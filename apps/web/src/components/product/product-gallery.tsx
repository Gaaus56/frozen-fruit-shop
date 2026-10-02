"use client";

import { useState } from "react";
import type { ProductImage as ProductImageData } from "@frozen-fruit-shop/types";
import { ProductImage } from "./product-image";

export function ProductGallery({ images, name }: { images: ProductImageData[]; name: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden bg-surface">
        <ProductImage
          src={active?.url}
          alt={active?.alt ?? name}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
          priority
        />
      </div>

      {images.length > 1 ? (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Xem ảnh ${index + 1}`}
              aria-current={index === activeIndex}
              className={`relative aspect-square overflow-hidden bg-surface ring-2 transition ${
                index === activeIndex ? "ring-accent-600" : "ring-transparent hover:ring-divider"
              }`}
            >
              <ProductImage src={image.url} alt="" sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
