"use client";

import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";
import type { Product } from "@frozen-fruit-shop/types";
import { formatCurrency } from "@/lib/format";
import { StarRating } from "@/components/ui/star-rating";
import { useCart } from "@/lib/cart-context";

export function ProductCard({ product }: { product: Product }) {
  const defaultVariant = product.variants[0];
  const { addItem } = useCart();
  const isOutOfStock = defaultVariant.stockStatus === "out_of_stock";

  function handleQuickAdd(event: MouseEvent) {
    event.preventDefault();
    if (isOutOfStock) return;
    addItem({
      productId: product.id,
      variantId: defaultVariant.id,
      productName: product.name,
      productSlug: product.slug,
      image: product.images[0],
      packageSize: defaultVariant.packageSize,
      unitPrice: defaultVariant.price,
      quantity: 1,
    });
  }

  return (
    <Link href={`/products/${product.slug}`} className="group flex flex-col overflow-hidden bg-surface">
      <div className="relative aspect-square w-full">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="grayscale-photo object-contain p-6 transition-transform group-hover:scale-105"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        />
        {product.tags.includes("ban-chay") ? (
          <span className="absolute left-3 top-3 bg-accent-600 px-2.5 py-1 text-xs font-bold text-white">
            Bán chạy
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-accent-600">{defaultVariant.packageSize}</p>
        <h3 className="line-clamp-2 text-[15px] font-bold text-foreground">{product.name}</h3>
        <StarRating rating={product.rating} reviewCount={product.reviewCount} />
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="text-lg font-extrabold text-price">{formatCurrency(defaultVariant.price)}</span>
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            aria-label={`Thêm ${product.name} vào giỏ hàng`}
            className="flex h-8 w-8 items-center justify-center bg-accent-600 text-lg font-bold text-white transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>
    </Link>
  );
}
