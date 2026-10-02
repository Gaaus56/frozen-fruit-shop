"use client";

import Link from "next/link";
import { useState, type MouseEvent } from "react";
import type { Product } from "@frozen-fruit-shop/types";
import { useCart } from "@/lib/cart-context";
import { Price } from "./price";
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
    <Link href={`/products/${product.slug}`} className="group flex flex-col overflow-hidden bg-surface">
      <div className="relative aspect-square w-full overflow-hidden">
        <ProductImage
          src={product.images[0]?.url}
          alt={product.images[0]?.alt ?? product.name}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {isOutOfStock ? (
          <span className="absolute left-3 top-3 bg-foreground/80 px-2.5 py-1 text-xs font-bold text-white">Hết hàng</span>
        ) : product.isFeatured ? (
          <span className="absolute left-3 top-3 bg-accent-600 px-2.5 py-1 text-xs font-bold text-white">Nổi bật</span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-accent-600">
          {hasManyVariants ? `${product.variants.length} quy cách` : variant.packageSize}
        </p>
        <h3 className="line-clamp-2 text-[15px] font-bold text-foreground">{product.name}</h3>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span>
            {hasManyVariants ? <span className="mr-1 text-xs text-foreground/55">Từ</span> : null}
            <Price price={variant.price} compareAtPrice={variant.compareAtPrice} />
          </span>
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            aria-label={`Thêm ${product.name} (${variant.packageSize}) vào giỏ hàng`}
            title={`Thêm ${variant.packageSize} vào giỏ`}
            className="flex h-8 w-8 shrink-0 items-center justify-center bg-accent-600 text-lg font-bold text-white transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {justAdded ? "✓" : "+"}
          </button>
        </div>
      </div>
    </Link>
  );
}
