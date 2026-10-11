"use client";

import { useState } from "react";
import type { ProductImage as ProductImageData } from "@frozen-fruit-shop/types";
import { useSwipe } from "@/lib/use-swipe";
import { ProductImage } from "./product-image";

export function ProductGallery({ images, name }: { images: ProductImageData[]; name: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0];
  const hasMany = images.length > 1;
  const go = (next: number) => setActiveIndex((next + images.length) % images.length);
  // Điện thoại: vuốt trái / phải để đổi ảnh (nút mũi tên ẩn trên màn nhỏ).
  const swipe = useSwipe(() => go(activeIndex + 1), () => go(activeIndex - 1));

  return (
    <div className="flex flex-col gap-3">
      <div className="group relative aspect-square w-full overflow-hidden rounded-xl bg-surface ring-1 ring-divider/70" {...(hasMany ? swipe : {})}>
        <ProductImage
          src={active?.url}
          alt={active?.alt ?? name}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
          priority
        />

        {hasMany ? (
          <>
            <button
              type="button"
              onClick={() => go(activeIndex - 1)}
              aria-label="Ảnh trước"
              className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-xl text-foreground shadow-md transition hover:bg-white sm:flex lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => go(activeIndex + 1)}
              aria-label="Ảnh sau"
              className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-xl text-foreground shadow-md transition hover:bg-white sm:flex lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100"
            >
              ›
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-0.5 text-xs font-semibold text-white" aria-live="polite">
              {activeIndex + 1} / {images.length}
            </span>
          </>
        ) : null}
      </div>

      {hasMany ? (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Xem ảnh ${index + 1}`}
              aria-current={index === activeIndex}
              className={`relative aspect-square overflow-hidden rounded-lg bg-surface ring-2 transition ${
                index === activeIndex ? "ring-accent-600" : "ring-transparent opacity-75 hover:opacity-100 hover:ring-divider"
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
