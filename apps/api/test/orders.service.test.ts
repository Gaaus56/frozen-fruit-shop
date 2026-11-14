import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { OrdersService } from '../src/orders/orders.service.js';

// ─────────── Prisma giả: chỉ những phương thức OrdersService dùng ───────────

type Variant = {
  id: string;
  price: number;
  packageSize: string;
  isActive: boolean;
  stockStatus: 'in_stock' | 'out_of_stock';
  product: {
    id: string;
    slug: string;
    name: string;
    isActive: boolean;
    category: { isActive: boolean };
    images: { url: string }[];
  };
};

function variant(id: string, price: number, overrides: Partial<Variant> & { productActive?: boolean; categoryActive?: boolean } = {}): Variant {
  return {
    id,
    price,
    packageSize: '1kg',
    isActive: overrides.isActive ?? true,
    stockStatus: overrides.stockStatus ?? 'in_stock',
    product: {
      id: `p-${id}`,
      slug: `san-pham-${id}`,
      name: `Sản phẩm ${id}`,
      isActive: overrides.productActive ?? true,
      category: { isActive: overrides.categoryActive ?? true },
      images: [],
    },
  };
}

function orderRow(status: string, extra: Record<string, unknown> = {}) {
  return {
    id: 'o1',
    orderNumber: 'DH261114ABCD',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0905123456',
    customerEmail: null,
    shippingAddress: 'Đà Nẵng',
    customerNote: '',
    paymentMethod: 'cod',
    paymentStatus: 'unpaid',
    status,
    subtotal: 300000,
    shippingFee: 0,
    discount: 0,
    total: 300000,
    internalNote: '',
    items: [],
    logs: [],
    createdAt: new Date('2026-11-14T00:00:00Z'),
    updatedAt: new Date('2026-11-14T00:00:00Z'),
    ...extra,
  };
}

function setup({ variants = [] as Variant[], order = null as ReturnType<typeof orderRow> | null, updateCount = 1, createFailures = 0 } = {}) {
  const calls = { created: [] as any[], updateMany: [] as any[], logs: [] as any[], published: [] as any[] };
  let failuresLeft = createFailures;
  const prisma: any = {
    productVariant: {
      findMany: async ({ where }: any) => variants.filter((v) => where.id.in.includes(v.id)),
    },
    order: {
      create: async ({ data }: any) => {
        calls.created.push(data);
        if (failuresLeft > 0) {
          failuresLeft -= 1;
          throw Object.assign(new Error('Unique constraint failed'), { code: 'P2002' });
        }
        return { id: 'new', orderNumber: data.orderNumber, customerName: data.customerName, total: data.total };
      },
      findUnique: async () => order,
      findUniqueOrThrow: async () => order,
      updateMany: async (args: any) => {
        calls.updateMany.push(args);
        return { count: updateCount };
      },
    },
    orderStatusLog: {
      create: async ({ data }: any) => {
        calls.logs.push(data);
        return data;
      },
    },
    $transaction: async (fn: any) => fn(prisma),
  };
  const realtime: any = { publishAdmin: (event: unknown) => calls.published.push(event) };
  return { service: new OrdersService(prisma, realtime), calls };
}

const customer = {
  customerName: 'Nguyễn Văn A',
  customerPhone: '0905 123 456',
  shippingAddress: '12 Bạch Đằng, Đà Nẵng',
  paymentMethod: 'cod',
} as const;

// ─────────── Báo giá (quote) ───────────

test('quote: giá luôn lấy từ CSDL, gộp các dòng trùng quy cách', async () => {
  const { service } = setup({ variants: [variant('v1', 120000), variant('v2', 50000)] });
  const quote = await service.quote([
    { variantId: 'v1', quantity: 1 },
    { variantId: 'v1', quantity: 2 },
    { variantId: 'v2', quantity: 1 },
  ]);
  assert.equal(quote.lines.length, 2);
  assert.equal(quote.lines.find((l) => l.variantId === 'v1')!.quantity, 3);
  assert.equal(quote.subtotal, 3 * 120000 + 50000);
  assert.equal(quote.hasUnavailableItems, false);
});

test('quote: giới hạn số lượng tối đa 999 mỗi dòng', async () => {
  const { service } = setup({ variants: [variant('v1', 1000)] });
  const quote = await service.quote([{ variantId: 'v1', quantity: 100000 }]);
  assert.equal(quote.lines[0].quantity, 999);
  assert.equal(quote.subtotal, 999000);
});

for (const [label, v, issue] of [
  ['hết hàng', variant('v1', 1000, { stockStatus: 'out_of_stock' }), 'Hết hàng'],
  ['quy cách ngừng bán', variant('v1', 1000, { isActive: false }), 'Sản phẩm đã ngừng bán'],
  ['sản phẩm ngừng bán', variant('v1', 1000, { productActive: false }), 'Sản phẩm đã ngừng bán'],
  ['danh mục bị ẩn', variant('v1', 1000, { categoryActive: false }), 'Sản phẩm đã ngừng bán'],
] as const) {
  test(`quote: ${label} → đánh dấu không khả dụng, không tính tiền`, async () => {
    const { service } = setup({ variants: [v, variant('v2', 5000)] });
    const quote = await service.quote([
      { variantId: 'v1', quantity: 1 },
      { variantId: 'v2', quantity: 1 },
    ]);
    const line = quote.lines.find((l) => l.variantId === 'v1')!;
    assert.equal(line.available, false);
    assert.equal(line.issue, issue);
    assert.equal(quote.subtotal, 5000);
    assert.equal(quote.hasUnavailableItems, true);
  });
}

test('quote: quy cách đã bị xoá khỏi hệ thống → bỏ khỏi báo giá, báo có sản phẩm không khả dụng', async () => {
  const { service } = setup({ variants: [variant('v1', 1000)] });
  const quote = await service.quote([
    { variantId: 'v1', quantity: 1 },
    { variantId: 'deleted', quantity: 1 },
  ]);
  assert.equal(quote.lines.length, 1);
  assert.equal(quote.hasUnavailableItems, true);
});

// ─────────── Đặt hàng (create) ───────────

test('create: tổng tiền đơn = báo giá tính lại trên server, chuẩn hoá số điện thoại, báo trang quản trị', async () => {
  const { service, calls } = setup({ variants: [variant('v1', 120000)] });
  const result = await service.create({ ...customer, items: [{ variantId: 'v1', quantity: 2 }] } as any);
  assert.equal(result.total, 240000);
  assert.equal(calls.created[0].customerPhone, '0905123456');
  assert.equal(calls.created[0].items.create[0].unitPrice, 120000);
  assert.equal(calls.created[0].logs.create.toStatus, 'pending');
  assert.equal(calls.published[0].type, 'order.created');
});

test('create: mã đơn dạng DH + yyMMdd + 4 ký tự không gây nhầm (không có 0/O/1/I)', async () => {
  const { service } = setup({ variants: [variant('v1', 1000)] });
  for (let i = 0; i < 50; i += 1) {
    const { orderNumber } = await service.create({ ...customer, items: [{ variantId: 'v1', quantity: 1 }] } as any);
    assert.match(orderNumber, /^DH\d{6}[A-HJ-NP-Z2-9]{4}$/);
  }
});

test('create: giỏ có sản phẩm hết hàng → từ chối, không tạo đơn', async () => {
  const { service, calls } = setup({ variants: [variant('v1', 1000, { stockStatus: 'out_of_stock' })] });
  await assert.rejects(
    service.create({ ...customer, items: [{ variantId: 'v1', quantity: 1 }] } as any),
    BadRequestException,
  );
  assert.equal(calls.created.length, 0);
});

test('create: trường bẫy bot (honeypot "website") có giá trị → từ chối', async () => {
  const { service, calls } = setup({ variants: [variant('v1', 1000)] });
  await assert.rejects(
    service.create({ ...customer, website: 'http://spam', items: [{ variantId: 'v1', quantity: 1 }] } as any),
    BadRequestException,
  );
  assert.equal(calls.created.length, 0);
});

test('create: trùng mã đơn (P2002) → sinh mã mới và thử lại', async () => {
  const { service, calls } = setup({ variants: [variant('v1', 1000)], createFailures: 2 });
  await service.create({ ...customer, items: [{ variantId: 'v1', quantity: 1 }] } as any);
  assert.equal(calls.created.length, 3);
});

test('create: trùng mã 5 lần liên tiếp → dừng, báo lỗi (không lặp vô hạn)', async () => {
  const { service, calls } = setup({ variants: [variant('v1', 1000)], createFailures: 99 });
  await assert.rejects(
    service.create({ ...customer, items: [{ variantId: 'v1', quantity: 1 }] } as any),
    BadRequestException,
  );
  assert.equal(calls.created.length, 5);
});

// ─────────── Tra cứu đơn (lookup) ───────────

test('lookup: đúng mã + số điện thoại (khác định dạng +84) → trả đơn', async () => {
  const { service } = setup({ order: orderRow('confirmed') });
  const found = await service.lookup({ orderNumber: 'DH261114ABCD', phone: '+84 905 123 456' });
  assert.equal(found.status, 'confirmed');
});

test('lookup: sai số điện thoại và sai mã đơn trả CÙNG một thông báo (không dò được mã đơn của người khác)', async () => {
  const wrongPhone = setup({ order: orderRow('confirmed') }).service;
  const wrongCode = setup({ order: null }).service;
  const e1 = await wrongPhone.lookup({ orderNumber: 'DH261114ABCD', phone: '0999999999' }).catch((e) => e);
  const e2 = await wrongCode.lookup({ orderNumber: 'DH000000XXXX', phone: '0905123456' }).catch((e) => e);
  assert.ok(e1 instanceof NotFoundException && e2 instanceof NotFoundException);
  assert.equal(e1.message, e2.message);
});

// ─────────── Cập nhật đơn (máy trạng thái) ───────────

const ALLOWED: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['packing', 'shipping', 'cancelled'],
  packing: ['shipping', 'cancelled'],
  shipping: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};
const STATUSES = Object.keys(ALLOWED);

test('máy trạng thái: kiểm tra đủ 30 cặp chuyển trạng thái (hợp lệ → ghi + log, không hợp lệ → 400)', async () => {
  for (const from of STATUSES) {
    for (const to of STATUSES) {
      if (from === to) continue;
      const { service, calls } = setup({ order: orderRow(from) });
      const attempt = service.update('o1', { status: to } as any, 'admin-1');
      if (ALLOWED[from].includes(to)) {
        await attempt;
        assert.equal(calls.updateMany[0].data.status, to, `${from} → ${to}`);
        assert.deepEqual(calls.logs[0], { orderId: 'o1', fromStatus: from, toStatus: to, note: '', changedById: 'admin-1' });
      } else {
        await assert.rejects(attempt, BadRequestException, `${from} → ${to} phải bị chặn`);
        assert.equal(calls.updateMany.length, 0);
      }
    }
  }
});

test('ghi có điều kiện "trạng thái vẫn như lúc kiểm tra" (optimistic concurrency)', async () => {
  const { service, calls } = setup({ order: orderRow('confirmed') });
  await service.update('o1', { status: 'shipping' } as any, 'admin-1');
  assert.deepEqual(calls.updateMany[0].where, { id: 'o1', status: 'confirmed' });
});

test('hai người cùng sửa: người sau gặp đơn đã đổi trạng thái → 409, không ghi log', async () => {
  const { service, calls } = setup({ order: orderRow('confirmed'), updateCount: 0 });
  await assert.rejects(service.update('o1', { status: 'shipping' } as any, 'admin-2'), ConflictException);
  assert.equal(calls.logs.length, 0);
});

test('không đổi trạng thái → không ghi nhật ký trạng thái', async () => {
  const { service, calls } = setup({ order: orderRow('confirmed') });
  await service.update('o1', { internalNote: 'Gọi trước 30 phút' } as any, 'admin-1');
  assert.equal(calls.logs.length, 0);
});

test('tổng tiền = tạm tính + phí giao hàng − giảm giá', async () => {
  const { service, calls } = setup({ order: orderRow('confirmed') });
  await service.update('o1', { shippingFee: 30000, discount: 20000 } as any, 'admin-1');
  assert.equal(calls.updateMany[0].data.total, 300000 + 30000 - 20000);
});

test('giảm giá lớn hơn tổng tiền → 400', async () => {
  const { service } = setup({ order: orderRow('confirmed') });
  await assert.rejects(service.update('o1', { discount: 999999 } as any, 'admin-1'), BadRequestException);
});

for (const finished of ['delivered', 'cancelled']) {
  test(`đơn ${finished} → không được sửa phí giao hàng/giảm giá`, async () => {
    const { service } = setup({ order: orderRow(finished) });
    await assert.rejects(service.update('o1', { shippingFee: 10000 } as any, 'admin-1'), BadRequestException);
  });
}

test('đơn không tồn tại → 404', async () => {
  const { service } = setup({ order: null });
  await assert.rejects(service.update('nope', { status: 'confirmed' } as any, 'admin-1'), NotFoundException);
});
