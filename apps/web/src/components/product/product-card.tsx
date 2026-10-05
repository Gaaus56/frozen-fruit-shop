"use client";

import Link from "next/link";
import { useState, type MouseEvent } from "react";
import type { Product } from "@frozen-fruit-shop/types";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/format";
import { ProductImage } from "./product-image";

/** Quy cách hiển thị mặc định: rẻ nhất trong các quy cách còn hàng (hoặc quy cách đầu nếu hết hàng cả). */
function defaultVariant(product: Product) {
  const available = product.variants.filter((variant) => variant.stockStatus !== "out_of_stock");
  return (available.length > 0 ? available : product.variants).reduce((min, variant) =>
    variant.price < min.price ? variant : min,
  );
}

export function ProductCard({ product }: { product: Product }) {
  const variant = defaultVariant(product);
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const isOutOfStock = product.variants.every((item) => item.stockStatus === "out_of_stock");
  const hasManyVariants = product.variants.length > 1;
  const discount =
    variant.compareAtPrice && variant.compareAtPrice > variant.price
      ? Math.round((1 - variant.price / variant.compareAtPrice) * 100)
      : 0;

  function handleQuickAdd(event: MouseEvent) {
    event.preventDefault();
    if (isOutOfStock) return;
    addItem({
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      productSlug: product.slug,
      image: product.images[0]?.url ?? null,
      packageSize: variant.packageSize,
      unitPrice: variant.price,
      quantity: 1,
    });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden bg-card transition-colors hover:bg-accent-100"
    >
      <div className="relative aspect-square w-full overflow-hidden">
        <ProductImage
          src={product.images[0]?.url}
          alt={product.images[0]?.alt ?? product.name}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute right-3 top-3 flex gap-1.5">
          {isOutOfStock ? (
            <span className="bg-foreground/80 px-2 py-0.5 text-[10px] font-bold text-white sm:px-2.5 sm:py-1 sm:text-xs">Hết hàng</span>
          ) : product.isFeatured ? (
            <span className="bg-accent-600 px-2 py-0.5 text-[10px] font-bold text-white sm:px-2.5 sm:py-1 sm:text-xs">Nổi bật</span>
          ) : null}
          {discount > 0 ? (
            <span className="bg-accent-100 px-1.5 py-0.5 text-[10px] font-extrabold text-accent-700 sm:px-2 sm:py-1 sm:text-xs">-{discount}%</span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3 sm:gap-1.5 sm:p-4">
        <p className="text-[10px] font-bold uppercase tracking-wide text-accent-600 sm:text-[11px]">
          {hasManyVariants ? `${product.variants.length} quy cách` : variant.packageSize}
        </p>
        <h3 className="line-clamp-2 text-[13px] font-bold leading-snug text-foreground sm:text-[15px]">{product.name}</h3>
        {/* Đáy thẻ luôn thẳng hàng giữa các sản phẩm cùng dòng: giá chính và nút nằm cùng một đường. */}
        <div className="mt-auto pt-1">
          {discount > 0 ? (
            <p className="text-[10px] text-foreground/45 line-through sm:text-xs">{formatCurrency(variant.compareAtPrice!)}</p>
          ) : null}
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-extrabold text-price sm:text-lg">{formatCurrency(variant.price)}</span>
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={isOutOfStock}
              aria-label={`Thêm ${product.name} (${variant.packageSize}) vào giỏ hàng`}
              title={`Thêm ${variant.packageSize} vào giỏ`}
              className="flex h-7 w-7 shrink-0 items-center justify-center bg-accent-600 text-base font-bold text-white sm:h-8 sm:w-8 sm:text-lg transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {justAdded ? "✓" : "+"}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
