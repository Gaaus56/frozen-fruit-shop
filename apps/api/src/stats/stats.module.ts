import { Controller, Get, Injectable, Module, Query } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional } from 'class-validator';
import type { DashboardStats } from '@frozen-fruit-shop/types';
import { Auth } from '../auth/auth.guard.js';
import { iso } from '../common/utils.js';
import { PrismaService } from '../prisma/prisma.service.js';

const VN_OFFSET_MS = 7 * 3600_000;
const DAY_MS = 24 * 3600_000;

export class StatsQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([7, 30, 90, 365])
  days?: number;
}

/** Mốc 00:00 giờ Việt Nam của ngày chứa `date`, trả về dạng Date (UTC). */
function startOfVnDay(date: Date): Date {
  return new Date(Math.floor((date.getTime() + VN_OFFSET_MS) / DAY_MS) * DAY_MS - VN_OFFSET_MS);
}

function vnDateKey(date: Date): string {
  return new Date(date.getTime() + VN_OFFSET_MS).toISOString().slice(0, 10);
}

function percent(part: number, whole: number): number {
  return whole === 0 ? 0 : Math.round((part / whole) * 1000) / 10;
}

/**
 * Số liệu bán hàng cho trang Tổng quan (chỉ ADMIN). Doanh thu = tổng tiền các đơn không bị huỷ,
 * tính theo ngày đặt hàng, múi giờ Việt Nam. Khoảng so sánh là cùng số ngày ngay trước đó.
 */
@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(days = 30): Promise<DashboardStats> {
    const now = new Date();
    const from = new Date(startOfVnDay(now).getTime() - (days - 1) * DAY_MS);
    const previousFrom = new Date(from.getTime() - days * DAY_MS);
    const periodWhere = { createdAt: { gte: from, lte: now } };
    const notCancelled = { status: { not: 'cancelled' as const } };

    const [
      orders,
      previous,
      byStatus,
      items,
      toConfirm,
      inProgress,
      newInquiries,
      activeProducts,
      categoryCount,
      lowStock,
      outOfStock,
      stockAlerts,
      recentOrders,
    ] = await Promise.all([
      this.prisma.order.findMany({
        where: periodWhere,
        select: { createdAt: true, total: true, status: true, paymentMethod: true },
      }),
      this.prisma.order.aggregate({
        where: { ...notCancelled, createdAt: { gte: previousFrom, lt: from } },
        _sum: { total: true },
        _count: { _all: true },
      }),
      this.prisma.order.groupBy({ by: ['status'], where: periodWhere, _count: { _all: true } }),
      this.prisma.orderItem.findMany({
        where: { order: { ...periodWhere, ...notCancelled } },
        select: {
          productId: true,
          productName: true,
          quantity: true,
          lineTotal: true,
          product: { select: { categoryId: true, category: { select: { name: true } } } },
        },
      }),
      this.prisma.order.count({ where: { status: 'pending' } }),
      this.prisma.order.count({ where: { status: { in: ['confirmed', 'packing', 'shipping'] } } }),
      this.prisma.inquiry.count({ where: { status: 'new' } }),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.category.count(),
      this.prisma.productVariant.count({ where: { isActive: true, stockStatus: 'low_stock', product: { isActive: true } } }),
      this.prisma.productVariant.count({ where: { isActive: true, stockStatus: 'out_of_stock', product: { isActive: true } } }),
      this.prisma.productVariant.findMany({
        where: { isActive: true, stockStatus: { in: ['low_stock', 'out_of_stock'] }, product: { isActive: true } },
        select: { packageSize: true, stockStatus: true, product: { select: { id: true, name: true } } },
        orderBy: [{ stockStatus: 'desc' }, { updatedAt: 'desc' }],
        take: 10,
      }),
      this.prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: { id: true, orderNumber: true, customerName: true, total: true, status: true, createdAt: true },
      }),
    ]);

    const validOrders = orders.filter((order) => order.status !== 'cancelled');
    const revenue = validOrders.reduce((sum, order) => sum + order.total, 0);
    const cancelledOrders = orders.length - validOrders.length;

    // Doanh thu theo ngày: tạo đủ các ngày trong khoảng (kể cả ngày không có đơn).
    const byDay = new Map<string, { revenue: number; orders: number }>();
    for (let i = 0; i < days; i += 1) byDay.set(vnDateKey(new Date(from.getTime() + i * DAY_MS)), { revenue: 0, orders: 0 });
    for (const order of validOrders) {
      const bucket = byDay.get(vnDateKey(order.createdAt));
      if (bucket) {
        bucket.revenue += order.total;
        bucket.orders += 1;
      }
    }

    const byPayment = new Map<'cod' | 'bank_transfer', { revenue: number; orders: number }>();
    for (const order of validOrders) {
      const bucket = byPayment.get(order.paymentMethod) ?? { revenue: 0, orders: 0 };
      bucket.revenue += order.total;
      bucket.orders += 1;
      byPayment.set(order.paymentMethod, bucket);
    }

    const byProduct = new Map<string, { productId: string | null; name: string; quantity: number; revenue: number }>();
    const byCategory = new Map<string, { categoryId: string | null; name: string; quantity: number; revenue: number }>();
    for (const item of items) {
      const productKey = item.productId ?? `deleted:${item.productName}`;
      const product = byProduct.get(productKey) ?? { productId: item.productId, name: item.productName, quantity: 0, revenue: 0 };
      product.quantity += item.quantity;
      product.revenue += item.lineTotal;
      byProduct.set(productKey, product);

      const categoryId = item.product?.categoryId ?? null;
      const categoryKey = categoryId ?? 'unknown';
      const category = byCategory.get(categoryKey) ?? {
        categoryId,
        name: item.product?.category.name ?? 'Sản phẩm đã xoá',
        quantity: 0,
        revenue: 0,
      };
      category.quantity += item.quantity;
      category.revenue += item.lineTotal;
      byCategory.set(categoryKey, category);
    }

    const previousRevenue = previous._sum.total ?? 0;

    return {
      range: { from: iso(from), to: iso(now), days },
      summary: {
        revenue,
        previousRevenue,
        orders: validOrders.length,
        previousOrders: previous._count._all,
        averageOrderValue: validOrders.length ? Math.round(revenue / validOrders.length) : 0,
        itemsSold: items.reduce((sum, item) => sum + item.quantity, 0),
        cancelledOrders,
        cancelRate: percent(cancelledOrders, orders.length),
      },
      pending: { ordersToConfirm: toConfirm, ordersInProgress: inProgress, newInquiries },
      catalog: {
        activeProducts,
        categories: categoryCount,
        lowStockVariants: lowStock,
        outOfStockVariants: outOfStock,
      },
      revenueByDay: [...byDay].map(([date, value]) => ({ date, ...value })),
      ordersByStatus: byStatus.map((row) => ({ status: row.status, count: row._count._all })),
      revenueByPaymentMethod: [...byPayment].map(([method, value]) => ({ method, ...value })),
      topProducts: [...byProduct.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 8),
      revenueByCategory: [...byCategory.values()].sort((a, b) => b.revenue - a.revenue),
      stockAlerts: stockAlerts.map((variant) => ({
        productId: variant.product.id,
        productName: variant.product.name,
        packageSize: variant.packageSize,
        stockStatus: variant.stockStatus,
      })),
      recentOrders: recentOrders.map((order) => ({ ...order, createdAt: iso(order.createdAt) })),
    };
  }
}

@Controller('admin/stats')
@Auth('ADMIN')
export class StatsController {
  constructor(private readonly service: StatsService) {}

  @Get()
  get(@Query() query: StatsQuery) {
    return this.service.getDashboard(query.days);
  }
}

@Module({
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
