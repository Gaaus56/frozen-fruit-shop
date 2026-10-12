"use client";

import { useId, useState, type FormEvent } from "react";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  type OrderLookupResult,
  type OrderStatus,
} from "@frozen-fruit-shop/types";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, inputClass } from "@/components/ui/form";
import { ReceiptDialog } from "@/components/receipt/receipt-dialog";
import { lookupOrder } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/format";
import { formatDateTime } from "@/lib/receipt-content";
import { removeReceipt, saveReceipt, useSavedReceipts, type ReceiptStore, type SavedReceipt } from "@/lib/saved-receipts";

const STEPS: OrderStatus[] = ["pending", "confirmed", "packing", "shipping", "delivered"];

function StatusTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return <p className="font-bold text-red-600">Đơn hàng đã bị huỷ.</p>;
  }
  const current = STEPS.indexOf(status);
  return (
    <ol className="grid grid-cols-5 gap-1 text-center text-[11px] font-semibold sm:text-xs">
      {STEPS.map((step, index) => (
        <li key={step} className="flex flex-col gap-2">
          <span className={`h-1.5 rounded-full ${index <= current ? "bg-accent-600" : "bg-divider"}`} />
          <span className={index <= current ? "text-foreground" : "text-foreground/65"}>{ORDER_STATUS_LABELS[step]}</span>
        </li>
      ))}
    </ol>
  );
}

const cardClass = "rounded-2xl border border-divider bg-card p-5 shadow-sm sm:p-7";

export function OrderLookup({ store }: { store: ReceiptStore }) {
  const [result, setResult] = useState<{ order: OrderLookupResult; phone: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [receiptHelpOpen, setReceiptHelpOpen] = useState(false);
  const receiptHelpId = useId();
  const [openReceipt, setOpenReceipt] = useState<SavedReceipt | null>(null);
  const receipts = useSavedReceipts();

  async function runLookup(orderNumber: string, phone: string) {
    setError(null);
    const order = await lookupOrder(orderNumber, phone);
    setResult({ order, phone });
    // Đơn đã có bill trên máy → cập nhật luôn trạng thái mới nhất vào bill đó.
    const saved = receipts.find((item) => item.orderNumber === order.orderNumber);
    if (saved) saveReceipt({ ...saved, order, savedAt: new Date().toISOString() });
    return order;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setIsLoading(true);
    setResult(null);
    try {
      await runLookup(String(data.get("orderNumber") ?? "").trim(), String(data.get("phone") ?? "").trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tra cứu được đơn hàng.");
    } finally {
      setIsLoading(false);
    }
  }

  async function refresh(receipt: SavedReceipt) {
    setRefreshing(receipt.orderNumber);
    try {
      await runLookup(receipt.orderNumber, receipt.phone);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không cập nhật được trạng thái đơn.");
    } finally {
      setRefreshing(null);
    }
  }

  /** Xuất bill cho đơn vừa tra cứu: lưu vào máy này rồi mở máy in bill. */
  function exportReceipt() {
    if (!result) return;
    const receipt: SavedReceipt = {
      orderNumber: result.order.orderNumber,
      phone: result.phone,
      savedAt: new Date().toISOString(),
      order: result.order,
      store,
    };
    saveReceipt(receipt);
    setOpenReceipt(receipt);
  }

  return (
    <Container className="py-12">
      <SectionHeading
        as="h1"
        eyebrow="Hỗ trợ"
        title="Tra cứu đơn hàng"
        description="Nhập mã đơn hàng (ví dụ DH260929ABCD) và số điện thoại đã dùng khi đặt."
      />

      <div className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        {/* Khung trắng bo góc giống các khối ở trang chủ (SectionCard); kết quả hiện ngay trong khung. */}
        <div className={cardClass}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Mã đơn hàng" htmlFor="orderNumber" required>
                <input
                  id="orderNumber"
                  name="orderNumber"
                  type="text"
                  required
                  minLength={4}
                  maxLength={30}
                  autoCapitalize="characters"
                  placeholder="DH260929ABCD"
                  className={`${inputClass} uppercase placeholder:normal-case`}
                />
              </Field>
              <Field label="Số điện thoại" htmlFor="phone" required>
                <input id="phone" name="phone" type="tel" inputMode="tel" required autoComplete="tel" className={inputClass} />
              </Field>
            </div>
            <Button type="submit" className="w-full sm:w-fit" disabled={isLoading}>
              {isLoading ? "Đang tra cứu..." : "Tra cứu"}
            </Button>
          </form>

          {error ? (
            <div className="mt-5">
              <FormMessage tone="error">{error}</FormMessage>
            </div>
          ) : null}

          {result ? (
            <section className="mt-6 border-t border-divider pt-6" aria-live="polite">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-bold text-foreground">Đơn {result.order.orderNumber}</h2>
                <p className="text-sm text-foreground/65">Đặt ngày {formatDate(result.order.createdAt)}</p>
              </div>
              <div className="mt-5">
                <StatusTimeline status={result.order.status} />
              </div>

              <ul className="mt-6 divide-y divide-divider border-y border-divider text-sm">
                {result.order.items.map((item, index) => (
                  <li key={index} className="flex justify-between gap-4 py-2.5">
                    <span>
                      {item.productName}{" "}
                      <span className="text-foreground/65">
                        ({item.packageSize}) × {item.quantity}
                      </span>
                    </span>
                    <span className="font-semibold">{formatCurrency(item.lineTotal)}</span>
                  </li>
                ))}
              </ul>

              <dl className="mt-4 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-foreground/65">Tạm tính</dt>
                  <dd>{formatCurrency(result.order.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-foreground/65">Phí vận chuyển</dt>
                  <dd>{result.order.status === "pending" ? "Chờ cửa hàng xác nhận" : formatCurrency(result.order.shippingFee)}</dd>
                </div>
                {result.order.discount > 0 ? (
                  <div className="flex justify-between">
                    <dt className="text-foreground/65">Giảm giá</dt>
                    <dd>-{formatCurrency(result.order.discount)}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between border-t border-divider pt-2 text-base font-bold">
                  <dt>Tổng cộng</dt>
                  <dd className="text-price">{formatCurrency(result.order.total)}</dd>
                </div>
                <div className="flex justify-between pt-2">
                  <dt className="text-foreground/65">Thanh toán</dt>
                  <dd className="text-right">
                    {PAYMENT_METHOD_LABELS[result.order.paymentMethod]} — {PAYMENT_STATUS_LABELS[result.order.paymentStatus]}
                  </dd>
                </div>
                <div className="flex justify-between gap-6">
                  <dt className="shrink-0 text-foreground/65">Giao đến</dt>
                  <dd className="text-right">
                    {result.order.customerName} — {result.order.shippingAddress}
                  </dd>
                </div>
              </dl>

              <button type="button" onClick={exportReceipt} className="receipt-action mt-6 bg-accent-600 text-white hover:bg-accent-700">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                  <path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6" />
                </svg>
                Xuất bill &amp; lưu vào máy
              </button>
            </section>
          ) : null}
        </div>

        {/* Bill đã xuất trên máy này (localStorage) — lần sau vào web vẫn thấy. */}
        <section className={cardClass} aria-labelledby="saved-receipts-heading">
          <div className="flex items-center gap-2">
            <h2 id="saved-receipts-heading" className="text-lg font-bold text-foreground">
              Bill đã lưu trên máy này
            </h2>
            <button
              type="button"
              onClick={() => setReceiptHelpOpen((value) => !value)}
              aria-expanded={receiptHelpOpen}
              aria-controls={receiptHelpId}
              aria-label="Giải thích: bill lưu ở đâu"
              className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-bold leading-none transition-colors ${
                receiptHelpOpen ? "border-accent-600 bg-accent-600 text-white" : "border-foreground/30 text-foreground/50 hover:border-accent-600 hover:text-accent-700"
              }`}
            >
              ?
            </button>
          </div>
          {/* Trượt xuống / thu lên mượt: grid-rows 0fr ↔ 1fr + mờ dần; khi đóng `inert` để không Tab tới. */}
          <div
            id={receiptHelpId}
            inert={!receiptHelpOpen}
            className={`grid transition-[grid-template-rows,opacity,translate] duration-300 ease-out motion-reduce:transition-none ${
              receiptHelpOpen ? "grid-rows-[1fr] translate-y-0 opacity-100" : "grid-rows-[0fr] -translate-y-1 opacity-0"
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              <p className="mt-2 rounded-lg bg-field px-3 py-2 text-xs text-foreground/65">
                Bill chỉ lưu trong trình duyệt này, không gửi đi đâu. Xoá dữ liệu trình duyệt sẽ mất bill.
              </p>
            </div>
          </div>
          {receipts.length === 0 ? (
            <p className="mt-3 text-sm text-foreground/65">
              Chưa có bill nào. Bill được tự lưu khi bạn đặt hàng trên máy này, hoặc khi bấm «Xuất bill» sau khi tra cứu.
            </p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {receipts.map((receipt) => (
                <li key={receipt.orderNumber} className="rounded-xl bg-field p-4 ring-1 ring-divider/60">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-foreground">{receipt.orderNumber}</p>
                      <p className="text-xs text-foreground/65">{formatDateTime(receipt.order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-price">{formatCurrency(receipt.order.total)}</p>
                      <p className="text-xs font-semibold text-leaf">{ORDER_STATUS_LABELS[receipt.order.status]}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setOpenReceipt(receipt)}
                      className="rounded-full bg-accent-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-accent-700"
                    >
                      Xem bill
                    </button>
                    <button
                      type="button"
                      onClick={() => refresh(receipt)}
                      disabled={refreshing === receipt.orderNumber}
                      className="rounded-full bg-card px-3.5 py-1.5 text-xs font-bold text-foreground ring-1 ring-divider hover:text-accent-700 hover:ring-accent-600 disabled:opacity-50"
                    >
                      {refreshing === receipt.orderNumber ? "Đang kiểm tra…" : "Xem trạng thái mới nhất"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Xoá bill ${receipt.orderNumber} khỏi máy này? (Đơn hàng vẫn còn ở cửa hàng.)`)) removeReceipt(receipt.orderNumber);
                      }}
                      className="rounded-full px-3 py-1.5 text-xs font-semibold text-foreground/60 hover:text-red-600"
                    >
                      Xoá khỏi máy
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {openReceipt ? <ReceiptDialog receipt={openReceipt} onClose={() => setOpenReceipt(null)} /> : null}
    </Container>
  );
}
