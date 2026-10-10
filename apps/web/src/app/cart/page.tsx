"use client";

import Link from "next/link";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/format";
import { ProductImage } from "@/components/product/product-image";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, isHydrated } = useCart();

  if (!isHydrated) {
    return <Container className="py-20 text-center text-foreground/65">Đang tải giỏ hàng...</Container>;
  }

  if (items.length === 0) {
    return (
      <Container className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-5xl" aria-hidden>🛒</p>
        <h1 className="text-2xl uppercase text-foreground">Giỏ hàng của bạn đang trống</h1>
        <p className="text-foreground/70">Hãy khám phá các sản phẩm trái cây đông lạnh của chúng tôi.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <LinkButton href="/products">Xem sản phẩm</LinkButton>
          <LinkButton href="/order-lookup" variant="secondary">
            Tra cứu đơn hàng
          </LinkButton>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl uppercase text-foreground">Giỏ hàng ({items.length} sản phẩm)</h1>
        <LinkButton href="/order-lookup" variant="secondary">
          Tra cứu đơn hàng
        </LinkButton>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {items.map((item) => (
            <div
              key={item.variantId}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-divider bg-card p-4 shadow-sm sm:flex-nowrap sm:p-5"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface">
                <ProductImage src={item.image} alt={item.productName} sizes="80px" />
              </div>

              {/* Mobile: tên chiếm hết phần còn lại cạnh ảnh; nút số lượng + Xóa xuống dòng dưới. */}
              <div className="min-w-0 flex-1 basis-[calc(100%-6rem)] sm:basis-0">
                <Link href={`/products/${item.productSlug}`} className="font-semibold text-foreground hover:text-accent-600">
                  {item.productName}
                </Link>
                <p className="text-sm text-foreground/65">Quy cách: {item.packageSize}</p>
                <p className="mt-1 font-bold text-price">{formatCurrency(item.unitPrice)}</p>
              </div>

              <div className="flex w-full items-center justify-between gap-4 sm:w-auto">
                <div className="flex items-center rounded-full border border-divider">
                  <button
                    type="button"
                    className="px-3 py-1.5 text-lg text-foreground/70"
                    onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                    aria-label="Giảm số lượng"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    type="button"
                    className="px-3 py-1.5 text-lg text-foreground/70"
                    onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                    aria-label="Tăng số lượng"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.variantId)}
                  className="-m-2 p-2 text-sm font-medium text-foreground/65 hover:text-red-600"
                  aria-label={`Xóa ${item.productName} khỏi giỏ hàng`}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Khung trắng bo góc giống các khối ở trang chủ (SectionCard); dính theo khi cuộn danh sách dài. */}
        <div className="h-fit rounded-2xl border border-divider bg-card p-5 shadow-sm sm:p-7 lg:sticky lg:top-20">
          <h2 className="font-semibold text-foreground">Tóm tắt đơn hàng</h2>
          <div className="mt-4 flex items-center justify-between text-sm text-foreground/70">
            <span>Tạm tính</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-foreground/70">
            <span>Phí vận chuyển</span>
            <span>Cửa hàng báo khi xác nhận</span>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-divider pt-4 font-semibold text-foreground">
            <span>Tổng cộng</span>
            <span className="text-lg font-extrabold text-price">{formatCurrency(subtotal)}</span>
          </div>
          <LinkButton href="/checkout" className="mt-6 w-full">
            Tiến hành thanh toán
          </LinkButton>
          <LinkButton href="/products" variant="secondary" className="mt-3 w-full">
            Tiếp tục mua sắm
          </LinkButton>
        </div>
      </div>
    </Container>
  );
}
