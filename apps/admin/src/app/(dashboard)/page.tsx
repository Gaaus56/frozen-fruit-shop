import Link from 'next/link';
import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';

type Stats = {
  totals: {
    products: number;
    categories: number;
    posts: number;
    orders: number;
    revenue: number;
    revenueLast30Days: number;
  };
  revenueByDay: { date: string; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  stockByStatus: { status: string; count: number }[];
  topProducts: { productId: string; name: string; quantity: number }[];
  productsByCategory: { name: string; count: number }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }[];
};

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  packing: 'Đang đóng gói',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã huỷ',
};

const STOCK_LABEL: Record<string, string> = {
  in_stock: 'Còn hàng',
  low_stock: 'Sắp hết',
  out_of_stock: 'Hết hàng',
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(
    amount,
  );
}

async function loadStats(): Promise<Stats> {
  const res = await apiFetch('/stats');
  if (res.status === 401) redirect('/login');
  if (!res.ok) throw new Error(`Không tải được số liệu thống kê (mã lỗi ${res.status})`);
  return res.json() as Promise<Stats>;
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function RevenueChart({ data }: { data: Stats['revenueByDay'] }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div>
      <div className="flex h-44 items-end gap-1" role="img" aria-label="Doanh thu 30 ngày gần nhất">
        {data.map((d) => (
          <div
            key={d.date}
            title={`${d.date}: ${formatCurrency(d.revenue)}`}
            className="min-h-[2px] flex-1 rounded-t bg-emerald-500 hover:bg-emerald-600"
            style={{ height: `${Math.max((d.revenue / max) * 100, 1)}%` }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-slate-500">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}

function BarList({ rows }: { rows: { label: string; value: number }[] }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  if (rows.length === 0) return <p className="text-sm text-slate-500">Chưa có dữ liệu.</p>;
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.label}>
          <div className="flex justify-between text-sm">
            <span className="truncate pr-2 text-slate-700">{row.label}</span>
            <span className="font-medium text-slate-900">{row.value}</span>
          </div>
          <div className="mt-1 h-2 rounded bg-slate-100">
            <div className="h-2 rounded bg-emerald-500" style={{ width: `${(row.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="mb-4 font-semibold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

export default async function DashboardHomePage() {
  const stats = await loadStats();
  const { totals } = stats;

  return (
    <div>
      <PageHeader title="Tổng quan" description="Số liệu kinh doanh và tình trạng cửa hàng." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Tổng doanh thu" value={formatCurrency(totals.revenue)} hint="Không tính đơn đã huỷ" />
        <StatCard label="Doanh thu 30 ngày" value={formatCurrency(totals.revenueLast30Days)} />
        <StatCard label="Đơn hàng" value={String(totals.orders)} />
        <StatCard
          label="Sản phẩm"
          value={String(totals.products)}
          hint={`${totals.categories} danh mục · ${totals.posts} bài viết`}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Doanh thu 30 ngày gần nhất">
            <RevenueChart data={stats.revenueByDay} />
          </Panel>
        </div>
        <Panel title="Đơn hàng theo trạng thái">
          <BarList
            rows={stats.ordersByStatus.map((r) => ({ label: ORDER_STATUS_LABEL[r.status] ?? r.status, value: r.count }))}
          />
        </Panel>
        <Panel title="Sản phẩm bán chạy">
          <BarList rows={stats.topProducts.map((r) => ({ label: r.name, value: r.quantity }))} />
        </Panel>
        <Panel title="Tồn kho theo quy cách">
          <BarList rows={stats.stockByStatus.map((r) => ({ label: STOCK_LABEL[r.status] ?? r.status, value: r.count }))} />
        </Panel>
        <Panel title="Sản phẩm theo danh mục">
          <BarList rows={stats.productsByCategory.map((r) => ({ label: r.name, value: r.count }))} />
        </Panel>
      </div>

      <div className="mt-6">
        <Panel title="Đơn hàng gần đây">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="pb-2 font-medium">Mã đơn</th>
                  <th className="pb-2 font-medium">Khách hàng</th>
                  <th className="pb-2 font-medium">Tổng tiền</th>
                  <th className="pb-2 font-medium">Trạng thái</th>
                  <th className="pb-2 font-medium">Ngày</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-2 font-medium text-slate-900">{order.orderNumber}</td>
                    <td className="py-2 text-slate-600">{order.customerName}</td>
                    <td className="py-2 text-slate-600">{formatCurrency(order.total)}</td>
                    <td className="py-2 text-slate-600">{ORDER_STATUS_LABEL[order.status] ?? order.status}</td>
                    <td className="py-2 text-slate-600">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                  </tr>
                ))}
                {stats.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-500">
                      Chưa có đơn hàng nào.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link href="/products" className="font-medium text-emerald-700 hover:underline">
          Quản lý sản phẩm →
        </Link>
        <Link href="/categories" className="font-medium text-emerald-700 hover:underline">
          Danh mục →
        </Link>
        <Link href="/posts" className="font-medium text-emerald-700 hover:underline">
          Bài viết →
        </Link>
      </div>
    </div>
  );
}
