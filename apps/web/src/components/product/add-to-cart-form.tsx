"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@frozen-fruit-shop/types";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";

export function AddToCartForm({ product }: { product: Product }) {
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0].id);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  const selectedVariant =
    product.variants.find((variant) => variant.id === selectedVariantId) ?? product.variants[0];
  const isOutOfStock = selectedVariant.stockStatus === "out_of_stock";

  function handleAddToCart() {
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      productName: product.name,
      productSlug: product.slug,
      image: product.images[0],
      packageSize: selectedVariant.packageSize,
      unitPrice: selectedVariant.price,
      quantity,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  function handleBuyNow() {
    handleAddToCart();
    router.push("/gio-hang");
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
              className={`rounded-none border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                variant.id === selectedVariantId
                  ? "border-accent-600 bg-accent-600 text-white"
                  : "border-divider text-foreground/85 hover:border-accent-500"
              }`}
            >
              {variant.packageSize}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-extrabold text-price">
          {formatCurrency(selectedVariant.price)}
        </span>
        <span className="text-sm text-foreground/55">
          ({formatCurrency(selectedVariant.pricePerKg)}/kg)
        </span>
      </div>

      {selectedVariant.stockStatus === "low_stock" ? (
        <p className="text-sm font-medium text-amber-600">Sắp hết hàng — chỉ còn số lượng giới hạn</p>
      ) : null}
      {isOutOfStock ? <p className="text-sm font-medium text-red-600">Hiện đã hết hàng</p> : null}

      <div className="flex items-center gap-3">
        <p className="text-sm font-semibold text-foreground">Số lượng</p>
        <div className="flex items-center rounded-none border border-divider">
          <button
            type="button"
            className="px-3 py-1.5 text-lg text-foreground/70 disabled:opacity-40"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Giảm số lượng"
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-medium">{quantity}</span>
          <button
            type="button"
            className="px-3 py-1.5 text-lg text-foreground/70"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Tăng số lượng"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="secondary" className="sm:flex-1" onClick={handleAddToCart} disabled={isOutOfStock}>
          {justAdded ? "Đã thêm vào giỏ ✓" : "Thêm vào giỏ hàng"}
        </Button>
        <Button className="sm:flex-1" onClick={handleBuyNow} disabled={isOutOfStock}>
          Mua ngay
        </Button>
      </div>
    </div>
  );
}
