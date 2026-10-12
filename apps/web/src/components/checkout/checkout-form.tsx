"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { formatPhone, type OrderLookupResult, type OrderQuote, type PaymentMethod } from "@frozen-fruit-shop/types";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";
import { Field, FormMessage, HoneypotField, inputClass } from "@/components/ui/form";
import { ProductImage } from "@/components/product/product-image";
import { DATA_CHANGED_EVENT } from "@/components/layout/live-updates";
import { OrderButton, ORDER_ANIMATION_MS } from "@/components/checkout/order-button";
import { ReceiptPrinter } from "@/components/receipt/receipt-printer";
import { useCart } from "@/lib/cart-context";
import { lookupOrder, placeOrder, quoteCart } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";
import { saveReceipt, type ReceiptStore, type SavedReceipt } from "@/lib/saved-receipts";
import { SuccessCheck } from "@/components/ui/check-icon";

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; description: string }[] = [
  { value: "cod", label: "Thanh toán khi nhận hàng (COD)", description: "Trả tiền mặt cho người giao hàng." },
  { value: "bank_transfer", label: "Chuyển khoản ngân hàng", description: "Chuyển khoản trước theo hướng dẫn của cửa hàng." },
];

/** Khung trắng bo góc giống các khối ở trang chủ (SectionCard). */
function Card({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-divider bg-card p-5 shadow-sm sm:p-7 ${className}`}>
      <h2 className="mb-5 text-lg font-bold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function CheckoutForm({ bankTransferInfo, store }: { bankTransferInfo: string; store: ReceiptStore }) {
  const { items, isHydrated, applyQuote, clearCart } = useCart();
  const [quote, setQuote] = useState<OrderQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orderState, setOrderState] = useState<"idle" | "sending" | "done">("idle");
  const [placed, setPlaced] = useState<{ receipt: SavedReceipt; savedOnDevice: boolean } | null>(null);
  const [badgeShown, setBadgeShown] = useState(false);

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
    if (!isHydrated || items.length === 0 || orderState !== "idle") return;
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
    if (!quote || quote.hasUnavailableItems || orderState !== "idle") return;
    const data = new FormData(event.currentTarget);
    const phone = String(data.get("customerPhone") ?? "").trim();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Hiệu ứng xe tải chạy song song với lúc gửi đơn; xong cả hai mới chuyển sang bill.
    const animation = wait(reducedMotion ? 0 : ORDER_ANIMATION_MS);
    setOrderState("sending");
    setSubmitError(null);
    try {
      const result = await placeOrder({
        customerName: String(data.get("customerName") ?? ""),
        customerPhone: phone,
        customerEmail: String(data.get("customerEmail") ?? ""),
        shippingAddress: String(data.get("shippingAddress") ?? ""),
        customerNote: String(data.get("customerNote") ?? ""),
        paymentMethod,
        items: items.map(({ variantId, quantity }) => ({ variantId, quantity })),
        website: String(data.get("website") ?? ""),
      });

      // Bill lấy từ máy chủ (giá, thời gian đúng như đơn đã lưu); lỗi mạng thì dựng từ báo giá đang có.
      const order: OrderLookupResult = await lookupOrder(result.orderNumber, phone).catch(() => ({
        orderNumber: result.orderNumber,
        status: "pending",
        paymentMethod,
        paymentStatus: "unpaid",
        customerName: String(data.get("customerName") ?? ""),
        shippingAddress: String(data.get("shippingAddress") ?? ""),
        items: quote.lines
          .filter((line) => line.available)
          .map(({ productName, packageSize, unitPrice, quantity, lineTotal }) => ({ productName, packageSize, unitPrice, quantity, lineTotal })),
        subtotal: quote.subtotal,
        shippingFee: 0,
        discount: 0,
        total: result.total,
        createdAt: new Date().toISOString(),
      }));
      const receipt: SavedReceipt = { orderNumber: result.orderNumber, phone, savedAt: new Date().toISOString(), order, store };
      const savedOnDevice = saveReceipt(receipt);

      await animation;
      setOrderState("done");
      clearCart();
      await wait(reducedMotion ? 0 : 700);
      setPlaced({ receipt, savedOnDevice });
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    } catch (error) {
      setOrderState("idle");
      setSubmitError(error instanceof Error ? error.message : "Đặt hàng không thành công, vui lòng thử lại.");
    }
  }

  if (placed) {
    const { receipt, savedOnDevice } = placed;
    return (
      <Container className="py-10">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          {/* Vẽ một lần rồi gỡ hiệu ứng (lúc "In / Lưu PDF" trang bị ẩn rồi hiện lại, còn gắn thì vẽ lại). */}
          <SuccessCheck animate={!badgeShown} onDone={() => setBadgeShown(true)} className="h-16 w-16" />
          <h1 className="text-2xl uppercase text-foreground">Đặt hàng thành công!</h1>
          <p className="text-foreground/75">
            Mã đơn hàng: <strong className="text-lg text-accent-700">{receipt.orderNumber}</strong>
          </p>
          <p className="max-w-md text-sm text-foreground/70">
            Cửa hàng sẽ gọi điện xác nhận đơn và báo phí vận chuyển trong thời gian sớm nhất. Cần hỗ trợ gấp: gọi{" "}
            <a href={`tel:${store.phone}`} className="font-bold text-accent-700 hover:underline">
              {formatPhone(store.phone)}
            </a>
            .
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
          <ReceiptPrinter receipt={receipt} />

          <div className="flex flex-col gap-4">
            {receipt.order.paymentMethod === "bank_transfer" ? (
              <section className="rounded-2xl border border-divider bg-card p-5 text-sm shadow-sm">
                <h2 className="mb-2 font-bold text-foreground">Hướng dẫn chuyển khoản</h2>
                <p className="whitespace-pre-line text-foreground/80">
                  {bankTransferInfo || `Cửa hàng sẽ gửi thông tin chuyển khoản khi gọi xác nhận đơn.`}
                </p>
                <p className="mt-3 rounded-lg bg-field px-3 py-2 text-foreground">
                  Nội dung chuyển khoản: <strong>{receipt.orderNumber}</strong>
                </p>
              </section>
            ) : null}
            <section className="rounded-2xl border border-divider bg-card p-5 text-sm shadow-sm">
              <h2 className="mb-2 font-bold text-foreground">Bill của bạn</h2>
              <p className="text-foreground/75">
                {savedOnDevice
                  ? "Bill đã được lưu trên máy này. Lần sau mở mục «Tra cứu đơn hàng» là thấy lại bill và trạng thái đơn."
                  : "Trình duyệt đang chặn lưu dữ liệu (chế độ riêng tư) nên bill không lưu được trên máy — hãy bấm «Tải ảnh bill» để giữ lại."}
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <LinkButton href="/order-lookup" className="rounded-full">
                  Xem ở Tra cứu đơn hàng
                </LinkButton>
                <LinkButton href="/products" variant="secondary" className="rounded-full">
                  Tiếp tục mua sắm
                </LinkButton>
              </div>
            </section>
          </div>
        </div>
      </Container>
    );
  }

  if (!isHydrated) {
    return <Container className="py-20 text-center text-foreground/65">Đang tải giỏ hàng...</Container>;
  }

  if (items.length === 0 && orderState === "idle") {
    return (
      <Container className="flex flex-col items-center gap-4 py-20 text-center">
        <h1 className="text-2xl uppercase text-foreground">Giỏ hàng đang trống</h1>
        <p className="text-foreground/70">Hãy chọn sản phẩm trước khi thanh toán.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <LinkButton href="/products">Xem sản phẩm</LinkButton>
          <LinkButton href="/order-lookup" variant="secondary">
            Tra cứu đơn hàng
          </LinkButton>
        </div>
      </Container>
    );
  }

  const canSubmit = quote !== null && !quote.hasUnavailableItems;

  return (
    <Container className="py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl uppercase text-foreground">Thanh toán</h1>
        <Link href="/cart" className="text-sm font-semibold text-foreground/70 hover:text-accent-700">
          ‹ Quay lại giỏ hàng
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="relative mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <HoneypotField />
        <div className="flex flex-col gap-6 lg:col-span-3">
          <Card title="Thông tin người nhận">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Họ và tên" htmlFor="customerName" required>
                  <input id="customerName" name="customerName" required minLength={2} maxLength={100} autoComplete="name" className={inputClass} />
                </Field>
                <Field label="Số điện thoại" htmlFor="customerPhone" required>
                  <input id="customerPhone" name="customerPhone" type="tel" inputMode="tel" required autoComplete="tel" className={inputClass} />
                </Field>
              </div>
              <Field label="Email" htmlFor="customerEmail">
                <input id="customerEmail" name="customerEmail" type="email" autoComplete="email" className={inputClass} />
              </Field>
              <Field label="Địa chỉ giao hàng" htmlFor="shippingAddress" required hint="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố.">
                <textarea id="shippingAddress" name="shippingAddress" required minLength={10} maxLength={300} rows={2} autoComplete="street-address" className={inputClass} />
              </Field>
              <Field label="Ghi chú cho cửa hàng" htmlFor="customerNote">
                <textarea id="customerNote" name="customerNote" rows={2} maxLength={1000} placeholder="Ví dụ: giao giờ hành chính, gọi trước khi giao..." className={inputClass} />
              </Field>
            </div>
          </Card>

          <Card title="Phương thức thanh toán">
            <fieldset>
              <legend className="sr-only">Phương thức thanh toán</legend>
              <div className="flex flex-col gap-3">
                {PAYMENT_OPTIONS.map((option) => {
                  const active = paymentMethod === option.value;
                  return (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                        active ? "border-accent-600 bg-accent-50 ring-1 ring-accent-600" : "border-divider bg-field hover:border-accent-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={option.value}
                        checked={active}
                        onChange={() => setPaymentMethod(option.value)}
                        className="mt-1 accent-[#cf2a10]"
                      />
                      <span>
                        <span className="block text-sm font-bold text-foreground">{option.label}</span>
                        <span className="block text-xs text-foreground/65">{option.description}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </Card>
        </div>

        <Card title="Đơn hàng của bạn" className="h-fit lg:sticky lg:top-20 lg:col-span-2">
          {quoteError ? <FormMessage tone="error">{quoteError}</FormMessage> : null}
          {!quote && !quoteError ? <p className="text-sm text-foreground/65">Đang kiểm tra giá và tình trạng hàng...</p> : null}

          {quote ? (
            <>
              <ul className="-mt-2 divide-y divide-divider">
                {quote.lines.map((line) => (
                  <li key={line.variantId} className="flex gap-3 py-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface">
                      <ProductImage src={line.image} alt={line.productName} sizes="56px" />
                    </div>
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="font-semibold text-foreground">{line.productName}</p>
                      <p className="text-foreground/65">
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

              <div className="mt-2 space-y-2 rounded-xl bg-field p-4 text-sm">
                <div className="flex justify-between text-foreground/70">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(quote.subtotal)}</span>
                </div>
                <div className="flex justify-between gap-4 text-foreground/70">
                  <span>Phí vận chuyển</span>
                  <span className="text-right">Cửa hàng báo khi xác nhận</span>
                </div>
                <div className="flex items-baseline justify-between border-t border-divider pt-3 text-base font-bold text-foreground">
                  <span>Tổng tạm tính</span>
                  <span className="text-xl font-extrabold text-price">{formatCurrency(quote.subtotal)}</span>
                </div>
              </div>

              {quote.hasUnavailableItems ? (
                <div className="mt-4">
                  <FormMessage tone="error">
                    Một số sản phẩm đã hết hàng hoặc ngừng bán.{" "}
                    <Link href="/cart" className="underline">
                      Quay lại giỏ hàng
                    </Link>{" "}
                    để bỏ chúng trước khi đặt.
                  </FormMessage>
                </div>
              ) : null}
            </>
          ) : null}

          {submitError ? <div className="mt-4"><FormMessage tone="error">{submitError}</FormMessage></div> : null}

          <div className="mt-6">
            <OrderButton state={orderState} disabled={!canSubmit} />
          </div>
          <p className="mt-3 text-center text-xs text-foreground/65">Bằng việc đặt hàng, bạn đồng ý với các chính sách mua hàng của cửa hàng.</p>
        </Card>
      </form>
    </Container>
  );
}
