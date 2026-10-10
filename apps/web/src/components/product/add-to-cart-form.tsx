"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@frozen-fruit-shop/types";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Price } from "./price";

export function AddToCartForm({ product }: { product: Product }) {
  const firstAvailable = product.variants.find((variant) => variant.stockStatus !== "out_of_stock") ?? product.variants[0];
  const [selectedVariantId, setSelectedVariantId] = useState(firstAvailable.id);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  const selectedVariant = product.variants.find((variant) => variant.id === selectedVariantId) ?? firstAvailable;
  const isOutOfStock = selectedVariant.stockStatus === "out_of_stock";

  function handleAddToCart() {
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      productName: product.name,
      productSlug: product.slug,
      image: product.images[0]?.url ?? null,
      packageSize: selectedVariant.packageSize,
      unitPrice: selectedVariant.price,
      quantity,
    });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 2000);
  }

  function handleBuyNow() {
    handleAddToCart();
    router.push("/cart");
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">Quy cách đóng gói</p>
        <div className="flex flex-wrap gap-2">
          {product.variants.map((variant) => (
            <button
              key={variant.id}
              type="button"
              onClick={() => setSelectedVariantId(variant.id)}
              disabled={variant.stockStatus === "out_of_stock"}
              aria-pressed={variant.id === selectedVariantId}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                variant.id === selectedVariantId
                  ? "border-accent-600 bg-accent-600 text-white"
                  : "border-divider text-foreground/85 hover:border-accent-500"
              }`}
            >
              {variant.packageSize}
              {variant.stockStatus === "out_of_stock" ? " (hết)" : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-baseline gap-3">
        <Price price={selectedVariant.price} compareAtPrice={selectedVariant.compareAtPrice} size="lg" />
        {selectedVariant.pricePerKg ? (
          <span className="text-sm text-foreground/65">({formatCurrency(selectedVariant.pricePerKg)}/kg)</span>
        ) : null}
      </div>

      {selectedVariant.stockStatus === "in_stock" ? (
        <p className="flex items-center gap-2 text-sm font-medium text-leaf">
          <span className="h-2 w-2 rounded-full bg-leaf" aria-hidden />
          Còn hàng
        </p>
      ) : null}
      {selectedVariant.stockStatus === "low_stock" ? (
        <p className="flex items-center gap-2 text-sm font-medium text-amber-700">
          <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden />
          Sắp hết hàng — chỉ còn số lượng giới hạn
        </p>
      ) : null}
      {isOutOfStock ? (
        <p className="flex items-center gap-2 text-sm font-medium text-red-600">
          <span className="h-2 w-2 rounded-full bg-red-500" aria-hidden />
          Quy cách này hiện đã hết hàng
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <p className="text-sm font-semibold text-foreground">Số lượng</p>
        <div className="flex items-center overflow-hidden rounded-lg border border-divider">
          <button
            type="button"
            className="px-3 py-1.5 text-lg text-foreground/70 disabled:opacity-40"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Giảm số lượng"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-medium" aria-live="polite">{quantity}</span>
          <button
            type="button"
            className="px-3 py-1.5 text-lg text-foreground/70 disabled:opacity-40"
            onClick={() => setQuantity((q) => Math.min(99, q + 1))}
            disabled={quantity >= 99}
            aria-label="Tăng số lượng"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="secondary" className="rounded-lg sm:flex-1" onClick={handleAddToCart} disabled={isOutOfStock}>
          {justAdded ? "Đã thêm vào giỏ ✓" : "Thêm vào giỏ hàng"}
        </Button>
        <Button className="rounded-lg sm:flex-1" onClick={handleBuyNow} disabled={isOutOfStock}>
          Mua ngay
        </Button>
      </div>
    </div>
  );
}
