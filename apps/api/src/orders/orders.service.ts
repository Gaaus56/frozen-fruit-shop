import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { OrderStatus, Prisma } from '@prisma/client';
import { randomInt } from 'node:crypto';
import type {
  CartLineInput,
  CreateOrderResponse,
  Order,
  OrderDetail,
  OrderLookupResult,
  OrderQuote,
  Paginated,
  QuoteLine,
} from '@frozen-fruit-shop/types';
import { paginate } from '../common/pagination.js';
import { iso, normalizePhone, toPublicUrl } from '../common/utils.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RealtimeService } from '../realtime/realtime.module.js';
import type { AdminOrderQuery, CreateOrderDto, LookupOrderQuery, UpdateOrderDto } from './orders.dto.js';
import type { Writable } from 'node:stream';
import { streamOrdersWorkbook } from './orders-export.js';

/** Trạng thái được phép chuyển tới từ mỗi trạng thái — tránh nhảy lùi hoặc sửa đơn đã kết thúc. */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['packing', 'shipping', 'cancelled'],
  packing: ['shipping', 'cancelled'],
  shipping: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

/**
 * Tiền lưu kiểu integer trong Postgres (tối đa ~2,1 tỷ). Giới hạn tổng đơn đặt qua web ở 1 tỷ để còn chỗ cho phí ship,
 * tránh lỗi tràn số (API trả 500) khi giỏ hàng cực lớn hoặc ai đó cố gửi số lượng tối đa cho mọi món.
 */
const MAX_ORDER_SUBTOTAL = 1_000_000_000;

/** Xuất Excel: tối đa 20.000 đơn, đọc DB từng lô 500 đơn. */
const EXPORT_MAX_ORDERS = 20_000;
const EXPORT_BATCH = 500;

const include = { items: true } satisfies Prisma.OrderInclude;
type OrderRow = Prisma.OrderGetPayload<{ include: typeof include }>;

function toOrder(row: OrderRow): Order {
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    customerEmail: row.customerEmail,
    shippingAddress: row.shippingAddress,
    customerNote: row.customerNote,
    paymentMethod: row.paymentMethod,
    paymentStatus: row.paymentStatus,
    status: row.status,
    subtotal: row.subtotal,
    shippingFee: row.shippingFee,
    discount: row.discount,
    total: row.total,
    internalNote: row.internalNote,
    items: row.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      productName: item.productName,
      packageSize: item.packageSize,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
}

/** Mã đơn dễ đọc qua điện thoại: DH + yyMMdd (giờ Việt Nam) + 4 ký tự không gây nhầm (bỏ 0/O, 1/I). */
function generateOrderNumber(): string {
  const vnNow = new Date(Date.now() + 7 * 3600_000);
  const date = vnNow.toISOString().slice(2, 10).replace(/-/g, '');
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const suffix = Array.from({ length: 4 }, () => alphabet[randomInt(alphabet.length)]).join('');
  return `DH${date}${suffix}`;
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
  ) {}

  // ─────────── Web khách hàng ───────────

  /**
   * Tính lại giá giỏ hàng theo dữ liệu hiện tại trong DB. Giá trong trình duyệt khách chỉ để hiển thị,
   * không bao giờ được dùng để tính tiền đơn hàng.
   */
  async quote(items: CartLineInput[]): Promise<OrderQuote> {
    const merged = new Map<string, number>();
    for (const item of items) merged.set(item.variantId, (merged.get(item.variantId) ?? 0) + item.quantity);

    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: [...merged.keys()] } },
      include: {
        product: {
          include: { category: true, images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
        },
      },
    });
    const byId = new Map(variants.map((variant) => [variant.id, variant]));

    const lines: QuoteLine[] = [];
    for (const [variantId, rawQuantity] of merged) {
      const variant = byId.get(variantId);
      if (!variant) continue; // Quy cách đã bị xoá khỏi hệ thống — bỏ khỏi báo giá.

      const quantity = Math.min(rawQuantity, 999);
      const { product } = variant;
      let issue: string | null = null;
      if (!variant.isActive || !product.isActive || !product.category.isActive) issue = 'Sản phẩm đã ngừng bán';
      else if (variant.stockStatus === 'out_of_stock') issue = 'Hết hàng';

      lines.push({
        variantId,
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        packageSize: variant.packageSize,
        image: toPublicUrl(product.images[0]?.url ?? null),
        unitPrice: variant.price,
        quantity,
        lineTotal: variant.price * quantity,
        available: issue === null,
        issue,
      });
    }

    const subtotal = lines.filter((line) => line.available).reduce((sum, line) => sum + line.lineTotal, 0);
    return { lines, subtotal, hasUnavailableItems: lines.length !== merged.size || lines.some((l) => !l.available) };
  }

  async create(dto: CreateOrderDto): Promise<CreateOrderResponse> {
    if (dto.website) throw new BadRequestException('Không thể tạo đơn hàng.');

    const quote = await this.quote(dto.items);
    if (quote.hasUnavailableItems || quote.lines.length === 0) {
      throw new BadRequestException(
        'Một số sản phẩm trong giỏ đã hết hàng hoặc ngừng bán. Vui lòng kiểm tra lại giỏ hàng.',
      );
    }
    if (quote.subtotal > MAX_ORDER_SUBTOTAL) {
      throw new BadRequestException('Đơn hàng có giá trị quá lớn để đặt online. Vui lòng gọi hotline để cửa hàng báo giá sỉ.');
    }

    // Phí vận chuyển do cửa hàng báo khi gọi xác nhận đơn (nội thành / ngoại tỉnh khác nhau).
    const data = {
      customerName: dto.customerName,
      customerPhone: normalizePhone(dto.customerPhone),
      customerEmail: dto.customerEmail || null,
      shippingAddress: dto.shippingAddress,
      customerNote: dto.customerNote ?? '',
      paymentMethod: 'cod' as const,
      subtotal: quote.subtotal,
      total: quote.subtotal,
      items: {
        create: quote.lines.map((line) => ({
          productId: line.productId,
          variantId: line.variantId,
          productName: line.productName,
          packageSize: line.packageSize,
          unitPrice: line.unitPrice,
          quantity: line.quantity,
          lineTotal: line.lineTotal,
        })),
      },
      logs: { create: { toStatus: 'pending' as const, note: 'Khách đặt hàng qua website' } },
    };

    // Mã đơn ngẫu nhiên có thể trùng (rất hiếm) — thử lại vài lần.
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        const order = await this.prisma.order.create({ data: { ...data, orderNumber: generateOrderNumber() } });
        this.realtime.publishAdmin({
          type: 'order.created',
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          total: order.total,
        });
        return { orderNumber: order.orderNumber, total: order.total };
      } catch (error) {
        const isDuplicate =
          typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';
        if (!isDuplicate) throw error;
      }
    }
    throw new BadRequestException('Không tạo được mã đơn hàng, vui lòng thử lại.');
  }

  async lookup(query: LookupOrderQuery): Promise<OrderLookupResult> {
    const order = await this.prisma.order.findUnique({ where: { orderNumber: query.orderNumber }, include });
    // Cùng một thông báo cho cả "sai mã" và "sai số điện thoại" để không dò được mã đơn của người khác.
    if (!order || normalizePhone(order.customerPhone) !== normalizePhone(query.phone)) {
      throw new NotFoundException('Không tìm thấy đơn hàng khớp với mã đơn và số điện thoại.');
    }

    return {
      orderNumber: order.orderNumber,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      customerName: order.customerName,
      shippingAddress: order.shippingAddress,
      items: order.items.map(({ productName, packageSize, unitPrice, quantity, lineTotal }) => ({
        productName,
        packageSize,
        unitPrice,
        quantity,
        lineTotal,
      })),
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      discount: order.discount,
      total: order.total,
      createdAt: iso(order.createdAt),
    };
  }

  // ─────────── Trang quản trị ───────────

  /** Bộ lọc dùng chung cho danh sách đơn và file Excel (trạng thái, ô tìm, khoảng ngày). */
  private adminWhere(query: AdminOrderQuery): Prisma.OrderWhereInput {
    const q = query.q?.trim();
    return {
      status: query.status,
      createdAt: query.from || query.to ? { gte: query.from ? new Date(query.from) : undefined, lte: query.to ? new Date(query.to) : undefined } : undefined,
      OR: q
        ? [
            { orderNumber: { contains: q.toUpperCase() } },
            { customerName: { contains: q, mode: 'insensitive' } },
            { customerPhone: { contains: normalizePhone(q) || q } },
          ]
        : undefined,
    };
  }

  async list(query: AdminOrderQuery): Promise<Paginated<Order>> {
    const where = this.adminWhere(query);
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({ where, include, orderBy: { createdAt: 'desc' }, ...paginate(query) }),
      this.prisma.order.count({ where }),
    ]);
    return { items: rows.map(toOrder), total, page: query.page, pageSize: query.pageSize };
  }

  /**
   * File Excel các đơn khớp bộ lọc đang xem (tối đa 20.000 đơn, mới nhất trước), ghi thẳng ra `out` theo lô 500 đơn.
   * Chốt mốc thời gian lúc bắt đầu để hai lượt đọc (sheet đơn và sheet chi tiết) thấy cùng một tập đơn.
   */
  async exportExcel(query: AdminOrderQuery, out: Writable): Promise<void> {
    const where: Prisma.OrderWhereInput = { AND: [this.adminWhere(query), { createdAt: { lte: new Date() } }] };
    const prisma = this.prisma;
    async function* batches() {
      let cursor: string | undefined;
      for (let fetched = 0; fetched < EXPORT_MAX_ORDERS; ) {
        const rows = await prisma.order.findMany({
          where,
          include,
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          take: Math.min(EXPORT_BATCH, EXPORT_MAX_ORDERS - fetched),
          ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        });
        if (rows.length === 0) return;
        yield rows;
        fetched += rows.length;
        cursor = rows[rows.length - 1].id;
        if (rows.length < EXPORT_BATCH) return;
      }
    }
    await streamOrdersWorkbook(out, batches, 'Đơn hàng');
  }

  /** Tên file tải về theo ngày giờ Việt Nam. */
  exportFileName(): string {
    return `don-hang-${new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10)}.xlsx`;
  }

  async findById(id: string): Promise<OrderDetail> {
    const row = await this.prisma.order.findUnique({
      where: { id },
      include: {
        ...include,
        logs: { orderBy: { createdAt: 'asc' }, include: { changedBy: { select: { name: true } } } },
      },
    });
    if (!row) throw new NotFoundException('Không tìm thấy đơn hàng.');

    return {
      ...toOrder(row),
      logs: row.logs.map((log) => ({
        id: log.id,
        fromStatus: log.fromStatus,
        toStatus: log.toStatus,
        note: log.note,
        changedBy: log.changedBy?.name ?? null,
        createdAt: iso(log.createdAt),
      })),
    };
  }

  async update(id: string, dto: UpdateOrderDto, userId: string): Promise<OrderDetail> {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng.');

    const isFinished = order.status === 'delivered' || order.status === 'cancelled';
    const changesMoney = dto.shippingFee !== undefined || dto.discount !== undefined;
    if (isFinished && changesMoney) {
      throw new BadRequestException('Đơn đã giao hoặc đã huỷ, không thể sửa phí vận chuyển/giảm giá.');
    }

    const statusChanged = dto.status !== undefined && dto.status !== order.status;
    if (statusChanged && !TRANSITIONS[order.status].includes(dto.status!)) {
      throw new BadRequestException('Không thể chuyển đơn hàng sang trạng thái này.');
    }

    const shippingFee = dto.shippingFee ?? order.shippingFee;
    const discount = dto.discount ?? order.discount;
    if (discount > order.subtotal + shippingFee) {
      throw new BadRequestException('Giảm giá không được lớn hơn tổng tiền đơn hàng.');
    }

    // Khoá lạc quan: chỉ ghi nếu đơn chưa bị ai sửa kể từ lúc đọc (updatedAt không đổi). Hai nhân viên bấm gần như
    // cùng lúc ("Đã giao" và "Huỷ") → người sau nhận lỗi thay vì vượt qua bảng chuyển trạng thái dựa trên dữ liệu cũ.
    await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.order.updateMany({
        where: { id, updatedAt: order.updatedAt },
        data: {
          status: dto.status,
          paymentStatus: dto.paymentStatus,
          shippingFee,
          discount,
          total: order.subtotal + shippingFee - discount,
          internalNote: dto.internalNote,
        },
      });
      if (count === 0) {
        throw new ConflictException('Đơn hàng vừa được người khác cập nhật. Tải lại trang để xem trạng thái mới rồi thử lại.');
      }
      if (statusChanged) {
        await tx.orderStatusLog.create({
          data: { orderId: id, fromStatus: order.status, toStatus: dto.status!, note: dto.note ?? '', changedById: userId },
        });
      }
    });
    const updated = await this.findById(id);
    this.realtime.publishAdmin({ type: 'order.updated', id, orderNumber: updated.orderNumber, status: updated.status });
    return updated;
  }
}
