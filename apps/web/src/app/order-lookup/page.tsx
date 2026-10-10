"use client";

import { useState, type FormEvent } from "react";
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
import { lookupOrder } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/format";

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
          <span className={`h-1.5 ${index <= current ? "bg-accent-600" : "bg-divider"}`} />
          <span className={index <= current ? "text-foreground" : "text-foreground/65"}>{ORDER_STATUS_LABELS[step]}</span>
        </li>
      ))}
    </ol>
  );
}

export default function OrderLookupPage() {
  const [result, setResult] = useState<OrderLookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await lookupOrder(String(data.get("orderNumber") ?? "").trim(), String(data.get("phone") ?? "").trim()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tra cứu được đơn hàng.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Container className="py-12">
      <SectionHeading
        as="h1"
        eyebrow="Hỗ trợ"
        title="Tra cứu đơn hàng"
        description="Nhập mã đơn hàng (ví dụ DH260929ABCD) và số điện thoại đã dùng khi đặt."
      />

      <form onSubmit={handleSubmit} className="mt-8 flex max-w-md flex-col gap-4">
        <Field label="Mã đơn hàng" htmlFor="orderNumber" required>
          <input id="orderNumber" name="orderNumber" type="text" required minLength={4} maxLength={30} autoCapitalize="characters" className={`${inputClass} uppercase`} />
        </Field>
        <Field label="Số điện thoại" htmlFor="phone" required>
          <input id="phone" name="phone" type="tel" inputMode="tel" required autoComplete="tel" className={inputClass} />
        </Field>
        <Button type="submit" className="w-fit" disabled={isLoading}>
          {isLoading ? "Đang tra cứu..." : "Tra cứu"}
        </Button>
      </form>

      {error ? <div className="mt-6 max-w-md"><FormMessage tone="error">{error}</FormMessage></div> : null}

      {result ? (
        <section className="mt-10 max-w-2xl border border-divider p-6" aria-live="polite">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold text-foreground">Đơn {result.orderNumber}</h2>
            <p className="text-sm text-foreground/65">Đặt ngày {formatDate(result.createdAt)}</p>
          </div>
          <div className="mt-5">
            <StatusTimeline status={result.status} />
          </div>

          <ul className="mt-6 divide-y divide-divider border-y border-divider text-sm">
            {result.items.map((item, index) => (
              <li key={index} className="flex justify-between gap-4 py-2.5">
                <span>
                  {item.productName} <span className="text-foreground/65">({item.packageSize}) × {item.quantity}</span>
                </span>
                <span className="font-semibold">{formatCurrency(item.lineTotal)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-foreground/65">Tạm tính</dt><dd>{formatCurrency(result.subtotal)}</dd></div>
            <div className="flex justify-between">
              <dt className="text-foreground/65">Phí vận chuyển</dt>
              <dd>{result.status === "pending" ? "Chờ cửa hàng xác nhận" : formatCurrency(result.shippingFee)}</dd>
            </div>
            {result.discount > 0 ? (
              <div className="flex justify-between"><dt className="text-foreground/65">Giảm giá</dt><dd>-{formatCurrency(result.discount)}</dd></div>
            ) : null}
            <div className="flex justify-between border-t border-divider pt-2 text-base font-bold">
              <dt>Tổng cộng</dt>
              <dd className="text-price">{formatCurrency(result.total)}</dd>
            </div>
            <div className="flex justify-between pt-2">
              <dt className="text-foreground/65">Thanh toán</dt>
              <dd className="text-right">
                {PAYMENT_METHOD_LABELS[result.paymentMethod]} — {PAYMENT_STATUS_LABELS[result.paymentStatus]}
              </dd>
            </div>
            <div className="flex justify-between gap-6">
              <dt className="shrink-0 text-foreground/65">Giao đến</dt>
              <dd className="text-right">{result.customerName} — {result.shippingAddress}</dd>
            </div>
          </dl>
        </section>
      ) : null}
    </Container>
  );
}
