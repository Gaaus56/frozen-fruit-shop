import { notFound } from "next/navigation";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  type OrderDetail,
} from "@frozen-fruit-shop/types";
import { Badge, ORDER_STATUS_TONE } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { ApiError, api } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { OrderUpdateForm } from "./order-update-form";
import { PrintButton } from "./print-button";

export const metadata = { title: "Chi tiết đơn hàng" };

export default async function OrderDetailPage({ params }: PageProps<"/orders/[id]">) {
  const { id } = await params;
  const order = await api<OrderDetail>(`/admin/orders/${id}`).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });

  return (
    <div>
      <PageHeader
        back={{ href: "/orders", label: "Danh sách đơn hàng" }}
        title={`Đơn ${order.orderNumber}`}
        description={`Đặt lúc ${formatDateTime(order.createdAt)}`}
        action={
          <div className="flex items-center gap-3">
            <Badge tone={ORDER_STATUS_TONE[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge>
            <PrintButton />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:col-span-2">
          <section className="border border-divider bg-surface p-5">
            <h2 className="text-base">Sản phẩm</h2>
            <table className="mt-3 w-full text-sm">
              <thead className="text-left text-xs uppercase text-foreground/50">
                <tr>
                  <th className="py-2">Sản phẩm</th>
                  <th className="py-2 text-right">Đơn giá</th>
                  <th className="py-2 text-right">SL</th>
                  <th className="py-2 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5">
                      <p className="font-semibold">{item.productName}</p>
                      <p className="text-xs text-foreground/55">
                        {item.packageSize}
                        {item.productId ? "" : " · sản phẩm đã bị xoá khỏi hệ thống"}
                      </p>
                    </td>
                    <td className="py-2.5 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-2.5 text-right">{item.quantity}</td>
                    <td className="py-2.5 text-right font-semibold">{formatCurrency(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className="ml-auto mt-4 max-w-xs space-y-1.5 border-t border-divider pt-3 text-sm">
              <div className="flex justify-between"><dt className="text-foreground/60">Tạm tính</dt><dd>{formatCurrency(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-foreground/60">Phí vận chuyển</dt><dd>{formatCurrency(order.shippingFee)}</dd></div>
              <div className="flex justify-between"><dt className="text-foreground/60">Giảm giá</dt><dd>-{formatCurrency(order.discount)}</dd></div>
              <div className="flex justify-between border-t border-divider pt-2 text-base font-extrabold"><dt>Tổng cộng</dt><dd className="text-accent-700">{formatCurrency(order.total)}</dd></div>
            </dl>
          </section>

          <section className="border border-divider bg-surface p-5">
            <h2 className="text-base">Khách hàng & giao hàng</h2>
            <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              <div><dt className="text-foreground/55">Người nhận</dt><dd className="font-semibold">{order.customerName}</dd></div>
              <div>
                <dt className="text-foreground/55">Số điện thoại</dt>
                <dd><a href={`tel:${order.customerPhone}`} className="font-semibold text-accent-700 hover:underline">{order.customerPhone}</a></dd>
              </div>
              <div><dt className="text-foreground/55">Email</dt><dd>{order.customerEmail ?? "—"}</dd></div>
              <div>
                <dt className="text-foreground/55">Thanh toán</dt>
                <dd>{PAYMENT_METHOD_LABELS[order.paymentMethod]} — <strong>{PAYMENT_STATUS_LABELS[order.paymentStatus]}</strong></dd>
              </div>
              <div className="sm:col-span-2"><dt className="text-foreground/55">Địa chỉ giao hàng</dt><dd className="font-semibold">{order.shippingAddress}</dd></div>
              {order.customerNote ? (
                <div className="sm:col-span-2"><dt className="text-foreground/55">Khách ghi chú</dt><dd className="whitespace-pre-line bg-amber-50 p-3">{order.customerNote}</dd></div>
              ) : null}
            </dl>
          </section>

          <section className="border border-divider bg-surface p-5 print:hidden">
            <h2 className="text-base">Lịch sử xử lý</h2>
            <ol className="mt-3 space-y-3 border-l-2 border-divider pl-4 text-sm">
              {order.logs.map((log) => (
                <li key={log.id}>
                  <p>
                    <strong>{ORDER_STATUS_LABELS[log.toStatus]}</strong>
                    {log.fromStatus ? <span className="text-foreground/50"> (từ {ORDER_STATUS_LABELS[log.fromStatus]})</span> : null}
                  </p>
                  <p className="text-xs text-foreground/55">
                    {formatDateTime(log.createdAt)} · {log.changedBy ?? "Khách hàng"}
                  </p>
                  {log.note ? <p className="mt-0.5 text-foreground/75">{log.note}</p> : null}
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="print:hidden">
          <OrderUpdateForm order={order} />
        </div>
      </div>
    </div>
  );
}
