import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

const REVENUE_DAYS = 30;

function toDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - (REVENUE_DAYS - 1));

    const [
      productCount,
      categoryCount,
      postCount,
      orderCount,
      revenueAgg,
      ordersByStatus,
      recentOrders,
      variantsByStock,
      topItems,
      categories,
      recentList,
    ] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.category.count(),
      this.prisma.blogPost.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'cancelled' } } }),
      this.prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.order.findMany({
        where: { createdAt: { gte: since }, status: { not: 'cancelled' } },
        select: { createdAt: true, total: true },
      }),
      this.prisma.productVariant.groupBy({ by: ['stockStatus'], _count: { _all: true } }),
      this.prisma.orderItem.groupBy({
        by: ['productId', 'productName'],
        where: { order: { status: { not: 'cancelled' } } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
      this.prisma.category.findMany({
        select: { name: true, _count: { select: { products: true } } },
        orderBy: { name: 'asc' },
      }),
      this.prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, orderNumber: true, customerName: true, total: true, status: true, createdAt: true },
      }),
    ]);

    const revenueByDay = new Map<string, number>();
    for (let i = 0; i < REVENUE_DAYS; i++) {
      const day = new Date(since);
      day.setDate(since.getDate() + i);
      revenueByDay.set(toDateKey(day), 0);
    }
    for (const order of recentOrders) {
      const key = toDateKey(order.createdAt);
      revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + order.total);
    }

    const recentTotal = recentOrders.reduce((sum, order) => sum + order.total, 0);

    return {
      totals: {
        products: productCount,
        categories: categoryCount,
        posts: postCount,
        orders: orderCount,
        revenue: revenueAgg._sum.total ?? 0,
        revenueLast30Days: recentTotal,
      },
      revenueByDay: [...revenueByDay.entries()].map(([date, revenue]) => ({ date, revenue })),
      ordersByStatus: ordersByStatus.map((row) => ({ status: row.status, count: row._count._all })),
      stockByStatus: variantsByStock.map((row) => ({ status: row.stockStatus, count: row._count._all })),
      topProducts: topItems.map((row) => ({
        productId: row.productId,
        name: row.productName,
        quantity: row._sum.quantity ?? 0,
      })),
      productsByCategory: categories.map((c) => ({ name: c.name, count: c._count.products })),
      recentOrders: recentList,
    };
  }
}
