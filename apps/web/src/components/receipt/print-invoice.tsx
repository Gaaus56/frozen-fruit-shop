"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, formatPhone } from "@frozen-fruit-shop/types";
import { formatCurrency } from "@/lib/format";
import { formatDateTime } from "@/lib/receipt-content";
import type { SavedReceipt } from "@/lib/saved-receipts";

const noop = () => () => {};

/**
 * Hoá đơn dùng khi bấm "In / Lưu PDF": khổ A4, nền trắng, chữ đen — chỉ thông tin, không ảnh / hiệu ứng.
 * Gắn thẳng dưới <body> (portal) và ẩn trên màn hình; khi in, CSS ẩn mọi thứ khác (.print-invoice trong globals.css)
 * nên PDF chỉ có đúng một trang hoá đơn.
 */
export function PrintInvoice({ receipt }: { receipt: SavedReceipt }) {
  // Chỉ gắn portal sau khi đã chạy trên trình duyệt.
  const isClient = useSyncExternalStore(noop, () => true, () => false);
  if (!isClient) return null;

  const { order, store, phone } = receipt;
  const pending = order.status === "pending";

  return createPortal(
    <div className="print-invoice" aria-hidden>
      <header className="pi-header">
        <div>
          <p className="pi-store">{store.name}</p>
          {store.address ? <p>{store.address}</p> : null}
          <p>Hotline: {formatPhone(store.phone)}</p>
          {store.taxCode ? <p>MST: {store.taxCode}</p> : null}
        </div>
        <div className="pi-title-block">
          <p className="pi-title">HOÁ ĐƠN BÁN HÀNG</p>
          <p>
            Mã đơn: <strong>{order.orderNumber}</strong>
          </p>
          <p>Ngày đặt: {formatDateTime(order.createdAt)}</p>
        </div>
      </header>

      <section className="pi-parties">
        <div>
          <p className="pi-label">Khách hàng</p>
          <p className="pi-strong">{order.customerName}</p>
          <p>Điện thoại: {formatPhone(phone)}</p>
          <p>Giao đến: {order.shippingAddress}</p>
        </div>
        <div>
          <p className="pi-label">Thanh toán</p>
          <p className="pi-strong">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
          <p>Tình trạng thanh toán: {PAYMENT_STATUS_LABELS[order.paymentStatus]}</p>
          <p>Trạng thái đơn: {ORDER_STATUS_LABELS[order.status]}</p>
        </div>
      </section>

      <table className="pi-table">
        <thead>
          <tr>
            <th className="pi-num">STT</th>
            <th>Sản phẩm</th>
            <th>Quy cách</th>
            <th className="pi-num">SL</th>
            <th className="pi-money">Đơn giá</th>
            <th className="pi-money">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => (
            <tr key={index}>
              <td className="pi-num">{index + 1}</td>
              <td>{item.productName}</td>
              <td>{item.packageSize}</td>
              <td className="pi-num">{item.quantity}</td>
              <td className="pi-money">{formatCurrency(item.unitPrice)}</td>
              <td className="pi-money">{formatCurrency(item.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="pi-totals">
        <div>
          <dt>Tạm tính</dt>
          <dd>{formatCurrency(order.subtotal)}</dd>
        </div>
        <div>
          <dt>Phí vận chuyển</dt>
          <dd>{pending ? "Cửa hàng báo khi xác nhận" : formatCurrency(order.shippingFee)}</dd>
        </div>
        {order.discount > 0 ? (
          <div>
            <dt>Giảm giá</dt>
            <dd>-{formatCurrency(order.discount)}</dd>
          </div>
        ) : null}
        <div className="pi-grand">
          <dt>{pending ? "Tổng tạm tính" : "Tổng cộng"}</dt>
          <dd>{formatCurrency(order.total)}</dd>
        </div>
      </dl>

      <footer className="pi-footer">
        {pending ? <p>Phí vận chuyển sẽ được cửa hàng báo khi gọi xác nhận đơn.</p> : null}
        <p>Cảm ơn quý khách đã mua hàng tại {store.name}.</p>
      </footer>
    </div>,
    document.body,
  );
}
