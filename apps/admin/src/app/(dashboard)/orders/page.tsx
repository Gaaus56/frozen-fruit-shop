import Link from "next/link";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  type Order,
  type OrderStatus,
  type Paginated,
} from "@frozen-fruit-shop/types";
import { Badge, ORDER_STATUS_TONE } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { inputClass } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { Table, Td, Th } from "@/components/ui/table";
import { api } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/format";

export const metadata = { title: "Đơn hàng" };

const STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

export default async function OrdersPage({ searchParams }: PageProps<"/orders">) {
  const params = await searchParams;
  const status = STATUSES.find((item) => item === params.status);
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const page = Math.max(1, Number(params.page) || 1);

  const search = new URLSearchParams({ page: String(page), pageSize: "20" });
  if (status) search.set("status", status);
  if (q) search.set("q", q);
  const data = await api<Paginated<Order>>(`/admin/orders?${search.toString()}`);

  const tab = (value?: OrderStatus) => {
    const next = new URLSearchParams();
    if (value) next.set("status", value);
    if (q) next.set("q", q);
    const text = next.toString();
    return text ? `/orders?${text}` : "/orders";
  };

  return (
    <div>
      <PageHeader title="Đơn hàng" help="Đơn khách đặt trên website. Gọi xác nhận, chốt phí vận chuyển rồi cập nhật trạng thái." />

      <div className="mb-4 flex flex-wrap items-center gap-1 border-b border-divider">
        {[undefined, ...STATUSES].map((value) => (
          <Link
            key={value ?? "all"}
            href={tab(value)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-bold ${
              status === value ? "border-accent-600 text-accent-700" : "border-transparent text-foreground/60 hover:text-foreground"
            }`}
          >
            {value ? ORDER_STATUS_LABELS[value] : "Tất cả"}
          </Link>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <form className="flex w-full max-w-lg gap-2" action="/orders">
          {status ? <input type="hidden" name="status" value={status} /> : null}
          <input name="q" defaultValue={q} placeholder="Tìm mã đơn, tên hoặc số điện thoại khách" className={`${inputClass} mt-0`} />
          <button type="submit" className={buttonClass("secondary")}>Tìm</button>
        </form>

        {/* Tải Excel theo trạng thái + từ khoá đang xem, thêm khoảng ngày nếu cần (để trống = mọi ngày). */}
        <form action="/api/export/orders" method="get" className="flex flex-wrap items-end gap-2 text-sm">
          {status ? <input type="hidden" name="status" value={status} /> : null}
          {q ? <input type="hidden" name="q" value={q} /> : null}
          <label className="flex flex-col gap-1 text-xs font-semibold text-foreground/70">
            Từ ngày
            <input type="date" name="from" className={`${inputClass} mt-0 w-40`} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-foreground/70">
            Đến ngày
            <input type="date" name="to" className={`${inputClass} mt-0 w-40`} />
          </label>
          <button type="submit" className={buttonClass("primary")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
              <path d="M12 3v12M7 10l5 5 5-5M4 19h16" />
            </svg>
            Xuất Excel
          </button>
        </form>
      </div>

      <Table
        empty={data.items.length === 0 && (q ? "Không có đơn hàng khớp tìm kiếm." : "Chưa có đơn hàng nào.")}
        head={
          <>
            <Th>Mã đơn</Th>
            <Th>Khách hàng</Th>
            <Th>Ngày đặt</Th>
            <Th>Trạng thái</Th>
            <Th>Thanh toán</Th>
            <Th className="text-right">Tổng tiền</Th>
          </>
        }
      >
        {data.items.map((order) => (
          <tr key={order.id} className="hover:bg-muted/40">
            <Td>
              <Link href={`/orders/${order.id}`} className="font-bold text-accent-700 hover:underline">
                {order.orderNumber}
              </Link>
            </Td>
            <Td>
              <p className="font-semibold">{order.customerName}</p>
              <p className="text-xs text-foreground/55">{order.customerPhone}</p>
            </Td>
            <Td className="whitespace-nowrap text-foreground/70">{formatDateTime(order.createdAt)}</Td>
            <Td><Badge tone={ORDER_STATUS_TONE[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge></Td>
            <Td>
              <Badge tone={order.paymentStatus === "paid" ? "green" : "neutral"}>{PAYMENT_STATUS_LABELS[order.paymentStatus]}</Badge>
            </Td>
            <Td className="text-right font-bold">{formatCurrency(order.total)}</Td>
          </tr>
        ))}
      </Table>

      <Pagination page={data.page} pageSize={data.pageSize} total={data.total} basePath="/orders" params={{ status, q: q || undefined }} />
    </div>
  );
}
