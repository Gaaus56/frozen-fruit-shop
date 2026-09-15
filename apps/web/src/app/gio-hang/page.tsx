"use client";

import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/format";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <Container className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-5xl" aria-hidden>🛒</p>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Giỏ hàng của bạn đang trống</h1>
        <p className="text-slate-600">Hãy khám phá các sản phẩm trái cây đông lạnh của chúng tôi.</p>
        <LinkButton href="/san-pham">Xem sản phẩm</LinkButton>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <h1 className="font-display text-2xl font-semibold text-slate-900">Giỏ hàng ({items.length} sản phẩm)</h1>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {items.map((item) => (
            <div
              key={item.variantId}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4"
            >
              <div className="relative h-20 w-20 shrink-0 rounded-xl bg-teal-50/60">
                <Image src={item.image} alt={item.productName} fill className="object-contain p-2" />
              </div>

              <div className="flex-1">
                <Link href={`/san-pham/${item.productSlug}`} className="font-semibold text-slate-900 hover:text-teal-600">
                  {item.productName}
                </Link>
                <p className="text-sm text-slate-500">Quy cách: {item.packageSize}</p>
                <p className="mt-1 font-display font-semibold text-mango-600">{formatCurrency(item.unitPrice)}</p>
              </div>

              <div className="flex items-center rounded-full border border-slate-300">
                <button
                  type="button"
                  className="px-3 py-1.5 text-lg text-slate-600"
                  onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                  aria-label="Giảm số lượng"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <button
                  type="button"
                  className="px-3 py-1.5 text-lg text-slate-600"
                  onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                  aria-label="Tăng số lượng"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={() => removeItem(item.variantId)}
                className="text-sm font-medium text-slate-400 hover:text-red-600"
                aria-label={`Xóa ${item.productName} khỏi giỏ hàng`}
              >
                Xóa
              </button>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-2xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900">Tóm tắt đơn hàng</h2>
          <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
            <span>Tạm tính</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
            <span>Phí vận chuyển</span>
            <span>Tính ở bước thanh toán</span>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 font-semibold text-slate-900">
            <span>Tổng cộng</span>
            <span className="font-display text-lg font-semibold text-mango-600">{formatCurrency(subtotal)}</span>
          </div>
          <LinkButton href="/thanh-toan" className="mt-6 w-full">
            Tiến hành thanh toán
          </LinkButton>
          <LinkButton href="/san-pham" variant="secondary" className="mt-3 w-full">
            Tiếp tục mua sắm
          </LinkButton>
        </div>
      </div>
    </Container>
  );
}
