"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type TouchEvent } from "react";
import type { ProductImage as ProductImageData } from "@frozen-fruit-shop/types";
import { ProductImage } from "./product-image";

/** Tự chuyển ảnh sau mỗi khoảng này (ms); khách vừa bấm / vuốt thì đếm lại từ đầu. */
const AUTOPLAY_MS = 4000;
/** Vuốt quá tỉ lệ này của bề ngang khung (hoặc vuốt nhanh) thì sang ảnh kế. */
const SWIPE_RATIO = 0.18;
const FAST_SWIPE_PX_PER_MS = 0.5;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia(REDUCED_MOTION);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/**
 * Ảnh sản phẩm dạng dải trượt ngang: tự chuyển ảnh, vuốt ngón tay kéo ảnh theo tay rồi trượt khớp vào ảnh gần nhất
 * (điện thoại), nút ‹ › (máy tính) và ảnh nhỏ bên dưới. Tạm dừng tự chuyển khi rê chuột vào khung hoặc đang vuốt;
 * máy tắt hiệu ứng chuyển động thì không tự chuyển.
 */
export function ProductGallery({ images, name }: { images: ProductImageData[]; name: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragPx, setDragPx] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number; time: number; axis: "x" | "y" | null } | null>(null);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, () => window.matchMedia(REDUCED_MOTION).matches, () => true);

  const count = images.length;
  const hasMany = count > 1;
  const go = (next: number) => setActiveIndex((next + count) % count);

  // Tự chuyển ảnh: đặt lại hẹn giờ mỗi lần đổi ảnh (kể cả do khách bấm / vuốt) nên không nhảy ngay sau thao tác tay.
  const dragging = dragPx !== null;
  useEffect(() => {
    if (!hasMany || hovered || dragging || reducedMotion) return;
    const timer = window.setTimeout(() => setActiveIndex((index) => (index + 1) % count), AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [activeIndex, hasMany, hovered, dragging, reducedMotion, count]);

  function onTouchStart(event: TouchEvent) {
    const point = event.touches[0];
    if (!point) return;
    touch.current = { x: point.clientX, y: point.clientY, time: event.timeStamp, axis: null };
  }

  function onTouchMove(event: TouchEvent) {
    const start = touch.current;
    const point = event.touches[0];
    if (!start || !point) return;
    const dx = point.clientX - start.x;
    const dy = point.clientY - start.y;
    // Quyết định hướng một lần: vuốt dọc thì để trang cuộn bình thường, vuốt ngang thì kéo ảnh theo tay.
    if (start.axis === null && Math.abs(dx) + Math.abs(dy) > 8) start.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    if (start.axis !== "x") return;
    // Ảnh đầu / cuối: kéo nặng tay hơn (co giãn) cho biết là hết ảnh.
    const atEdge = (activeIndex === 0 && dx > 0) || (activeIndex === count - 1 && dx < 0);
    setDragPx(atEdge ? dx / 3 : dx);
  }

  function onTouchEnd(event: TouchEvent) {
    const start = touch.current;
    touch.current = null;
    if (!start || start.axis !== "x" || dragPx === null) {
      setDragPx(null);
      return;
    }
    const width = frameRef.current?.offsetWidth ?? 1;
    const speed = Math.abs(dragPx) / Math.max(1, event.timeStamp - start.time);
    const passed = Math.abs(dragPx) > width * SWIPE_RATIO || speed > FAST_SWIPE_PX_PER_MS;
    if (passed && dragPx < 0 && activeIndex < count - 1) setActiveIndex(activeIndex + 1);
    else if (passed && dragPx > 0 && activeIndex > 0) setActiveIndex(activeIndex - 1);
    setDragPx(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={frameRef}
        className="group relative aspect-square w-full touch-pan-y overflow-hidden rounded-xl bg-surface ring-1 ring-divider/70"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        {...(hasMany ? { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel: onTouchEnd } : {})}
      >
        <div
          className={`flex h-full ${dragging || reducedMotion ? "" : "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"}`}
          style={{ transform: `translateX(calc(${-activeIndex * 100}% + ${dragPx ?? 0}px))` }}
        >
          {images.map((image, index) => (
            <div key={image.id} className="relative h-full w-full shrink-0" aria-hidden={index !== activeIndex}>
              <ProductImage
                src={image.url}
                alt={image.alt ?? name}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}
          {count === 0 ? (
            <div className="relative h-full w-full shrink-0">
              <ProductImage src={undefined} alt={name} sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" priority />
            </div>
          ) : null}
        </div>

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
            {/* Chấm vị trí (điện thoại) + số thứ tự ảnh. */}
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 sm:hidden" aria-hidden>
              {images.map((image, index) => (
                <span
                  key={image.id}
                  className={`h-1.5 rounded-full bg-white shadow transition-all duration-300 ${index === activeIndex ? "w-5" : "w-1.5 opacity-60"}`}
                />
              ))}
            </div>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-0.5 text-xs font-semibold text-white">
              {activeIndex + 1} / {count}
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
