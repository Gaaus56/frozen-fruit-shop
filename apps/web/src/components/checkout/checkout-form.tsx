"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { formatPhone, type OrderQuote, type PaymentMethod } from "@frozen-fruit-shop/types";
import { Container } from "@/components/ui/container";
import { Button, LinkButton } from "@/components/ui/button";
import { Field, FormMessage, HoneypotField, inputClass } from "@/components/ui/form";
import { ProductImage } from "@/components/product/product-image";
import { DATA_CHANGED_EVENT } from "@/components/layout/live-updates";
import { useCart } from "@/lib/cart-context";
import { placeOrder, quoteCart } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; description: string }[] = [
  { value: "cod", label: "Thanh toán khi nhận hàng (COD)", description: "Trả tiền mặt cho người giao hàng." },
  { value: "bank_transfer", label: "Chuyển khoản ngân hàng", description: "Chuyển khoản trước theo hướng dẫn của cửa hàng." },
];

interface PlacedOrder {
  orderNumber: string;
  total: number;
  paymentMethod: PaymentMethod;
}

export function CheckoutForm({ bankTransferInfo, hotline }: { bankTransferInfo: string; hotline: string }) {
  const { items, isHydrated, applyQuote, clearCart } = useCart();
  const [quote, setQuote] = useState<OrderQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);

  // Admin đổi giá / ẩn sản phẩm trong lúc khách đang ở trang thanh toán → báo giá lại ngay.
  const [dataVersion, setDataVersion] = useState(0);
  useEffect(() => {
    const onDataChanged = () => setDataVersion((version) => version + 1);
    window.addEventListener(DATA_CHANGED_EVENT, onDataChanged);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, onDataChanged);
  }, []);

  // Mỗi khi giỏ thay đổi: hỏi máy chủ giá hiện tại và tình trạng hàng.
  const cartKey = items.map((item) => `${item.variantId}:${item.quantity}`).join("|");
  useEffect(() => {
    if (!isHydrated || items.length === 0) return;
    let cancelled = false;
    quoteCart(items.map(({ variantId, quantity }) => ({ variantId, quantity })))
      .then((result) => {
        if (cancelled) return;
        setQuote(result);
        setQuoteError(null);
        applyQuote(result);
      })
      .catch((error: unknown) => {
        if (!cancelled) setQuoteError(error instanceof Error ? error.message : "Không kiểm tra được giỏ hàng.");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ báo giá lại khi nội dung giỏ thay đổi
  }, [isHydrated, cartKey, dataVersion]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!quote || quote.hasUnavailableItems) return;
    const data = new FormData(event.currentTarget);
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await placeOrder({
        customerName: String(data.get("customerName") ?? ""),
        customerPhone: String(data.get("customerPhone") ?? ""),
        customerEmail: String(data.get("customerEmail") ?? ""),
        shippingAddress: String(data.get("shippingAddress") ?? ""),
        customerNote: String(data.get("customerNote") ?? ""),
        paymentMethod,
        items: items.map(({ variantId, quantity }) => ({ variantId, quantity })),
        website: String(data.get("website") ?? ""),
      });
      setPlaced({ ...result, paymentMethod });
      clearCart();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Đặt hàng không thành công, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (placed) {
    return (
      <Container className="flex max-w-2xl flex-col items-center gap-4 py-16 text-center">
        <p className="text-5xl" aria-hidden>✅</p>
        <h1 className="text-2xl uppercase text-foreground">Đặt hàng thành công!</h1>
        <p className="text-foreground/75">
          Mã đơn hàng của bạn: <strong className="text-lg text-accent-700">{placed.orderNumber}</strong>
        </p>
        <p className="max-w-md text-foreground/70">
          Cửa hàng sẽ gọi điện xác nhận đơn và báo phí vận chuyển trong thời gian sớm nhất. Tạm tính:{" "}
          <strong>{formatCurrency(placed.total)}</strong>.
        </p>
        {placed.paymentMethod === "bank_transfer" ? (
          <div className="w-full whitespace-pre-line border border-divider bg-surface p-5 text-left text-sm text-foreground/80">
            <p className="mb-2 font-bold text-foreground">Hướng dẫn chuyển khoản</p>
            {bankTransferInfo ||
              `Cửa hàng sẽ gửi thông tin chuyển khoản khi gọi xác nhận đơn. Nội dung chuyển khoản: ${placed.orderNumber}.`}
          </div>
        ) : null}
        <p className="text-sm text-foreground/60">
          Lưu lại mã đơn để{" "}
          <Link href="/order-lookup" className="font-bold text-accent-700 hover:underline">
            tra cứu tình trạng đơn hàng
          </Link>
          . Cần hỗ trợ gấp: gọi {formatPhone(hotline)}.
        </p>
        <LinkButton href="/products">Tiếp tục mua sắm</LinkButton>
      </Container>
    );
  }

  if (!isHydrated) {
    return <Container className="py-20 text-center text-foreground/60">Đang tải giỏ hàng...</Container>;
  }

  if (items.length === 0) {
    return (
      <Container className="flex flex-col items-center gap-4 py-20 text-center">
        <h1 className="text-2xl uppercase text-foreground">Giỏ hàng đang trống</h1>
        <p className="text-foreground/70">Hãy chọn sản phẩm trước khi thanh toán.</p>
        <LinkButton href="/products">Xem sản phẩm</LinkButton>
      </Container>
    );
  }

  const canSubmit = quote !== null && !quote.hasUnavailableItems && !isSubmitting;

  return (
    <Container className="py-10">
      <h1 className="text-2xl uppercase text-foreground">Thanh toán</h1>

      <form onSubmit={handleSubmit} className="relative mt-8 grid grid-cols-1 gap-10 lg:grid-cols-5">
        <HoneypotField />
        <div className="flex flex-col gap-4 lg:col-span-3">
          <h2 className="font-bold text-foreground">Thông tin người nhận</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Họ và tên" htmlFor="customerName" required>
              <input id="customerName" name="customerName" required minLength={2} maxLength={100} autoComplete="name" className={inputClass} />
            </Field>
            <Field label="Số điện thoại" htmlFor="customerPhone" required>
              <input id="customerPhone" name="customerPhone" type="tel" inputMode="tel" required autoComplete="tel" className={inputClass} />
            </Field>
          </div>
          <Field label="Email" htmlFor="customerEmail" hint="Không bắt buộc.">
            <input id="customerEmail" name="customerEmail" type="email" autoComplete="email" className={inputClass} />
          </Field>
          <Field label="Địa chỉ giao hàng" htmlFor="shippingAddress" required hint="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố.">
            <textarea id="shippingAddress" name="shippingAddress" required minLength={10} maxLength={300} rows={2} autoComplete="street-address" className={inputClass} />
          </Field>
          <Field label="Ghi chú cho cửa hàng" htmlFor="customerNote">
            <textarea id="customerNote" name="customerNote" rows={2} maxLength={1000} placeholder="Ví dụ: giao giờ hành chính, gọi trước khi giao..." className={inputClass} />
          </Field>

          <fieldset className="mt-2">
            <legend className="font-bold text-foreground">Phương thức thanh toán</legend>
            <div className="mt-3 flex flex-col gap-2">
              {PAYMENT_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-start gap-3 border p-4 ${
                    paymentMethod === option.value ? "border-accent-600 bg-accent-50" : "border-divider"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={option.value}
                    checked={paymentMethod === option.value}
                    onChange={() => setPaymentMethod(option.value)}
                    className="mt-1 accent-[#ec3013]"
                  />
                  <span>
                    <span className="block text-sm font-bold text-foreground">{option.label}</span>
                    <span className="block text-xs text-foreground/60">{option.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="h-fit border border-divider p-6 lg:col-span-2">
          <h2 className="font-bold text-foreground">Đơn hàng của bạn</h2>

          {quoteError ? <div className="mt-4"><FormMessage tone="error">{quoteError}</FormMessage></div> : null}
          {!quote && !quoteError ? <p className="mt-4 text-sm text-foreground/60">Đang kiểm tra giá và tình trạng hàng...</p> : null}

          {quote ? (
            <>
              <ul className="mt-4 divide-y divide-divider">
                {quote.lines.map((line) => (
                  <li key={line.variantId} className="flex gap-3 py-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-surface">
                      <ProductImage src={line.image} alt={line.productName} sizes="56px" />
                    </div>
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="font-semibold text-foreground">{line.productName}</p>
                      <p className="text-foreground/55">
                        {line.packageSize} × {line.quantity}
                      </p>
                      {line.issue ? <p className="font-semibold text-red-600">{line.issue}</p> : null}
                    </div>
                    <p className={`text-sm font-bold ${line.available ? "text-foreground" : "text-foreground/40 line-through"}`}>
                      {formatCurrency(line.lineTotal)}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-4 space-y-2 border-t border-divider pt-4 text-sm">
                <div className="flex justify-between text-foreground/70">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(quote.subtotal)}</span>
                </div>
                <div className="flex justify-between text-foreground/70">
                  <span>Phí vận chuyển</span>
                  <span>Cửa hàng báo khi xác nhận</span>
                </div>
                <div className="flex justify-between border-t border-divider pt-3 text-base font-bold text-foreground">
                  <span>Tổng tạm tính</span>
                  <span className="text-lg font-extrabold text-price">{formatCurrency(quote.subtotal)}</span>
                </div>
              </div>

              {quote.hasUnavailableItems ? (
                <div className="mt-4">
                  <FormMessage tone="error">
                    Một số sản phẩm đã hết hàng hoặc ngừng bán.{" "}
                    <Link href="/cart" className="underline">Quay lại giỏ hàng</Link> để bỏ chúng trước khi đặt.
                  </FormMessage>
                </div>
              ) : null}
            </>
          ) : null}

          {submitError ? <div className="mt-4"><FormMessage tone="error">{submitError}</FormMessage></div> : null}

          <Button type="submit" className="mt-6 w-full" disabled={!canSubmit}>
            {isSubmitting ? "Đang đặt hàng..." : "Đặt hàng"}
          </Button>
          <p className="mt-3 text-center text-xs text-foreground/55">
            Bằng việc đặt hàng, bạn đồng ý với các chính sách mua hàng của cửa hàng.
          </p>
        </div>
      </form>
    </Container>
  );
}
