import Link from "next/link";
import type { ReactNode } from "react";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  STOCK_STATUS_LABELS,
  type DashboardStats,
} from "@frozen-fruit-shop/types";
import { Badge, ORDER_STATUS_TONE, STOCK_TONE } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { api } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { formatCurrency, formatDate, formatDateTime, formatNumber } from "@/lib/format";

export const metadata = { title: "Tổng quan" };

const RANGES = [7, 30, 90, 365] as const;

function growth(current: number, previous: number): { text: string; tone: string } | null {
  if (previous === 0) return current > 0 ? { text: "Mới phát sinh", tone: "text-leaf-700" } : null;
  const change = Math.round(((current - previous) / previous) * 1000) / 10;
  return { text: `${change >= 0 ? "▲" : "▼"} ${Math.abs(change)}% so với kỳ trước`, tone: change >= 0 ? "text-leaf-700" : "text-accent-700" };
}

function Stat({ label, value, sub, subTone = "text-foreground/55" }: { label: string; value: string; sub?: string; subTone?: string }) {
  return (
    <div className="border border-divider bg-surface p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-foreground/55">{label}</p>
      <p className="mt-2 text-2xl font-extrabold">{value}</p>
      {sub ? <p className={`mt-1 text-xs font-semibold ${subTone}`}>{sub}</p> : null}
    </div>
  );
}

function Panel({ title, action, children, className = "" }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`border border-divider bg-surface p-5 ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Bars({ rows, format }: { rows: { label: string; value: number; hint?: string }[]; format: (value: number) => string }) {
  if (rows.length === 0) return <p className="text-sm text-foreground/55">Chưa có dữ liệu trong khoảng thời gian này.</p>;
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.label}>
          <div className="flex justify-between gap-3 text-sm">
            <span className="truncate text-foreground/80">{row.label}</span>
            <span className="shrink-0 font-bold">
              {format(row.value)}
              {row.hint ? <span className="ml-1 font-normal text-foreground/50">{row.hint}</span> : null}
            </span>
          </div>
          <div className="mt-1 h-2 bg-muted">
            <div className="h-2 bg-accent-600" style={{ width: `${(row.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function RevenueChart({ data }: { data: DashboardStats["revenueByDay"] }) {
  const max = Math.max(...data.map((day) => day.revenue), 1);
  // Nhiều ngày thì gộp theo tuần/tháng để cột không quá mảnh.
  const bucketSize = data.length > 120 ? 30 : data.length > 45 ? 7 : 1;
  const buckets: { label: string; revenue: number; orders: number }[] = [];
  for (let i = 0; i < data.length; i += bucketSize) {
    const chunk = data.slice(i, i + bucketSize);
    buckets.push({
      label: bucketSize === 1 ? chunk[0].date : `${chunk[0].date} → ${chunk[chunk.length - 1].date}`,
      revenue: chunk.reduce((sum, day) => sum + day.revenue, 0),
      orders: chunk.reduce((sum, day) => sum + day.orders, 0),
    });
  }
  const bucketMax = bucketSize === 1 ? max : Math.max(...buckets.map((bucket) => bucket.revenue), 1);

  return (
    <div>
      <div className="flex h-48 items-end gap-[3px]" role="img" aria-label="Biểu đồ doanh thu theo thời gian">
        {buckets.map((bucket) => (
          <div
            key={bucket.label}
            title={`${bucket.label}: ${formatCurrency(bucket.revenue)} · ${bucket.orders} đơn`}
            className="min-h-[2px] flex-1 bg-accent-600/85 transition-colors hover:bg-accent-700"
            style={{ height: `${Math.max((bucket.revenue / bucketMax) * 100, 1)}%` }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-foreground/50">
        <span>{formatDate(data[0].date)}</span>
        <span>{bucketSize === 1 ? "Theo ngày" : bucketSize === 7 ? "Gộp theo tuần" : "Gộp theo tháng"}</span>
        <span>{formatDate(data[data.length - 1].date)}</span>
      </div>
    </div>
  );
}

export default async function DashboardPage({ searchParams }: PageProps<"/">) {
  await requireAdmin();
  const { days: rawDays } = await searchParams;
  const days = RANGES.find((range) => String(range) === rawDays) ?? 30;
  const stats = await api<DashboardStats>(`/admin/stats?days=${days}`);
  const { summary, pending, catalog } = stats;
  const revenueGrowth = growth(summary.revenue, summary.previousRevenue);
  const ordersGrowth = growth(summary.orders, summary.previousOrders);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tổng quan bán hàng"
        description={`Từ ${formatDate(stats.range.from)} đến ${formatDate(stats.range.to)} · không tính đơn đã huỷ`}
        action={
          <div className="flex border border-divider bg-surface text-sm font-bold">
            {RANGES.map((range) => (
              <Link
                key={range}
                href={range === 30 ? "/" : `/?days=${range}`}
                className={`px-3 py-2 ${range === days ? "bg-ink text-white" : "text-foreground/70 hover:bg-muted"}`}
              >
                {range === 365 ? "1 năm" : `${range} ngày`}
              </Link>
            ))}
          </div>
        }
      />

      {pending.ordersToConfirm + pending.newInquiries > 0 ? (
        <div className="flex flex-wrap gap-3 border-l-4 border-accent-600 bg-accent-50 px-5 py-3 text-sm">
          <span className="font-bold text-accent-800">Việc cần xử lý:</span>
          {pending.ordersToConfirm > 0 ? (
            <Link href="/orders?status=pending" className="font-semibold text-accent-700 underline">
              {pending.ordersToConfirm} đơn chờ xác nhận
            </Link>
          ) : null}
          {pending.newInquiries > 0 ? (
            <Link href="/inquiries?status=new" className="font-semibold text-accent-700 underline">
              {pending.newInquiries} liên hệ/báo giá mới
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat label="Doanh thu" value={formatCurrency(summary.revenue)} sub={revenueGrowth?.text} subTone={revenueGrowth?.tone} />
        <Stat label="Số đơn hàng" value={formatNumber(summary.orders)} sub={ordersGrowth?.text} subTone={ordersGrowth?.tone} />
        <Stat label="Giá trị trung bình / đơn" value={formatCurrency(summary.averageOrderValue)} sub={`${formatNumber(summary.itemsSold)} sản phẩm đã bán`} />
        <Stat
          label="Đơn bị huỷ"
          value={formatNumber(summary.cancelledOrders)}
          sub={`Tỷ lệ huỷ ${summary.cancelRate}%`}
          subTone={summary.cancelRate > 15 ? "text-accent-700" : "text-foreground/55"}
        />
      </div>

      <Panel title="Doanh thu theo thời gian">
        <RevenueChart data={stats.revenueByDay} />
      </Panel>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel title="Sản phẩm bán chạy (theo doanh thu)">
          <Bars
            rows={stats.topProducts.map((item) => ({ label: item.name, value: item.revenue, hint: `· ${formatNumber(item.quantity)} sp` }))}
            format={formatCurrency}
          />
        </Panel>
        <Panel title="Doanh thu theo danh mục">
          <Bars
            rows={stats.revenueByCategory.map((item) => ({ label: item.name, value: item.revenue, hint: `· ${formatNumber(item.quantity)} sp` }))}
            format={formatCurrency}
          />
        </Panel>
        <Panel title="Đơn hàng theo trạng thái">
          <Bars
            rows={stats.ordersByStatus.map((item) => ({ label: ORDER_STATUS_LABELS[item.status], value: item.count }))}
            format={formatNumber}
          />
        </Panel>
        <Panel title="Phương thức thanh toán">
          <Bars
            rows={stats.revenueByPaymentMethod.map((item) => ({ label: PAYMENT_METHOD_LABELS[item.method], value: item.revenue, hint: `· ${item.orders} đơn` }))}
            format={formatCurrency}
          />
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel
          title="Đơn hàng gần đây"
          className="xl:col-span-2"
          action={<Link href="/orders" className="text-sm font-bold text-accent-700 hover:underline">Tất cả đơn →</Link>}
        >
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-foreground/55">Chưa có đơn hàng nào.</p>
          ) : (
            <ul className="divide-y divide-divider text-sm">
              {stats.recentOrders.map((order) => (
                <li key={order.id}>
                  <Link href={`/orders/${order.id}`} className="flex flex-wrap items-center justify-between gap-2 py-2.5 hover:text-accent-700">
                    <span>
                      <span className="font-bold">{order.orderNumber}</span>
                      <span className="ml-2 text-foreground/60">{order.customerName}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="text-xs text-foreground/50">{formatDateTime(order.createdAt)}</span>
                      <Badge tone={ORDER_STATUS_TONE[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge>
                      <span className="w-28 text-right font-bold">{formatCurrency(order.total)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Kho & danh mục">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-foreground/55">Sản phẩm đang bán</dt><dd className="text-xl font-extrabold">{catalog.activeProducts}</dd></div>
            <div><dt className="text-foreground/55">Danh mục</dt><dd className="text-xl font-extrabold">{catalog.categories}</dd></div>
            <div><dt className="text-foreground/55">Quy cách sắp hết</dt><dd className="text-xl font-extrabold text-amber-700">{catalog.lowStockVariants}</dd></div>
            <div><dt className="text-foreground/55">Quy cách hết hàng</dt><dd className="text-xl font-extrabold text-accent-700">{catalog.outOfStockVariants}</dd></div>
          </dl>
          {stats.stockAlerts.length > 0 ? (
            <ul className="mt-4 divide-y divide-divider border-t border-divider text-sm">
              {stats.stockAlerts.map((alert) => (
                <li key={`${alert.productId}-${alert.packageSize}`} className="flex items-center justify-between gap-2 py-2">
                  <Link href={`/products/${alert.productId}`} className="truncate hover:text-accent-700">
                    {alert.productName} <span className="text-foreground/50">({alert.packageSize})</span>
                  </Link>
                  <Badge tone={STOCK_TONE[alert.stockStatus]}>{STOCK_STATUS_LABELS[alert.stockStatus]}</Badge>
                </li>
              ))}
            </ul>
          ) : null}
        </Panel>
      </div>
    </div>
  );
}
