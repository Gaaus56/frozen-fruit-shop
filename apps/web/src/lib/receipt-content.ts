import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, formatPhone } from "@frozen-fruit-shop/types";
import { formatCurrency } from "@/lib/format";
import type { SavedReceipt } from "@/lib/saved-receipts";

/**
 * Nội dung bill dựng một lần, dùng chung cho bill hiển thị (ReceiptPaper) và ảnh PNG tải về (receipt-image)
 * để hai bản luôn giống nhau.
 */
export interface ReceiptContent {
  storeName: string;
  storeLines: string[];
  info: { label: string; value: string }[];
  items: { quantity: number; name: string; detail: string; amount: string }[];
  totals: { label: string; value: string; strong?: boolean }[];
  footer: string[];
}

export function formatDateTime(dateString: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateString));
}

export function receiptContent({ order, store, phone }: SavedReceipt): ReceiptContent {
  const pending = order.status === "pending";
  return {
    storeName: store.name,
    storeLines: [store.address, `Hotline: ${formatPhone(store.phone)}`, store.taxCode ? `MST: ${store.taxCode}` : ""].filter(Boolean),
    info: [
      { label: "Mã đơn", value: order.orderNumber },
      { label: "Ngày đặt", value: formatDateTime(order.createdAt) },
      { label: "Khách hàng", value: order.customerName },
      { label: "Điện thoại", value: formatPhone(phone) },
      { label: "Giao đến", value: order.shippingAddress },
      { label: "Thanh toán", value: `${PAYMENT_METHOD_LABELS[order.paymentMethod]} · ${PAYMENT_STATUS_LABELS[order.paymentStatus]}` },
      { label: "Trạng thái", value: ORDER_STATUS_LABELS[order.status] },
    ],
    items: order.items.map((item) => ({
      quantity: item.quantity,
      name: item.productName,
      detail: `${item.packageSize} × ${formatCurrency(item.unitPrice)}`,
      amount: formatCurrency(item.lineTotal),
    })),
    totals: [
      { label: "Tạm tính", value: formatCurrency(order.subtotal) },
      { label: "Phí vận chuyển", value: pending ? "Báo khi xác nhận" : formatCurrency(order.shippingFee) },
      ...(order.discount > 0 ? [{ label: "Giảm giá", value: `-${formatCurrency(order.discount)}` }] : []),
      { label: pending ? "TỔNG TẠM TÍNH" : "TỔNG CỘNG", value: formatCurrency(order.total), strong: true },
    ],
    footer: ["Cảm ơn quý khách đã mua hàng!", "Tra cứu đơn tại mục «Tra cứu đơn hàng» trên website."],
  };
}
