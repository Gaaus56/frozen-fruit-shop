"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Không cuộn / không rê chuột bao lâu thì thanh cuộn mờ đi. */
const HIDE_AFTER_MS = 1000;
const MIN_THUMB = 36;

/**
 * Vùng cuộn có thanh cuộn kiểu Facebook: mảnh, bo tròn, nằm đè lên nội dung (không chiếm bề ngang),
 * hiện khi cuộn / rê chuột vào vùng, tự mờ đi khi ngừng; kéo được như thanh cuộn thường.
 * Thanh cuộn mặc định bị ẩn (trình duyệt không cho làm mờ dần thanh cuộn gốc).
 */
export function FadingScrollArea({ children, className = "", label }: { children: ReactNode; className?: string; label?: string }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const thumb = thumbRef.current;
    if (!scroller || !thumb) return;
    let hideTimer = 0;
    let dragging = false;
    let hoveringThumb = false;
    let thumbHeight = 0;

    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = scroller;
      if (scrollHeight <= clientHeight + 1) {
        thumb.style.display = "none";
        return;
      }
      thumb.style.display = "";
      thumbHeight = Math.max(MIN_THUMB, (clientHeight * clientHeight) / scrollHeight);
      const top = (scrollTop / (scrollHeight - clientHeight)) * (clientHeight - thumbHeight);
      thumb.style.height = `${thumbHeight}px`;
      thumb.style.transform = `translateY(${top}px)`;
    };
    const show = () => {
      update();
      thumb.dataset.visible = "true";
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => {
        if (!dragging && !hoveringThumb) thumb.dataset.visible = "false";
      }, HIDE_AFTER_MS);
    };

    // Kéo thanh cuộn: dịch chuyển chuột → vị trí cuộn tương ứng.
    let startY = 0;
    let startScroll = 0;
    const onPointerDown = (event: PointerEvent) => {
      event.preventDefault();
      dragging = true;
      startY = event.clientY;
      startScroll = scroller.scrollTop;
      thumb.setPointerCapture(event.pointerId);
      thumb.dataset.dragging = "true";
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      const { scrollHeight, clientHeight } = scroller;
      const ratio = (scrollHeight - clientHeight) / Math.max(1, clientHeight - thumbHeight);
      scroller.scrollTop = startScroll + (event.clientY - startY) * ratio;
    };
    const onPointerUp = () => {
      dragging = false;
      delete thumb.dataset.dragging;
      show();
    };
    const onThumbEnter = () => {
      hoveringThumb = true;
      show();
    };
    const onThumbLeave = () => {
      hoveringThumb = false;
      show();
    };

    const resize = new ResizeObserver(update);
    resize.observe(scroller);
    if (scroller.firstElementChild) resize.observe(scroller.firstElementChild);
    scroller.addEventListener("scroll", show, { passive: true });
    scroller.addEventListener("mouseenter", show);
    thumb.addEventListener("pointerdown", onPointerDown);
    thumb.addEventListener("pointermove", onPointerMove);
    thumb.addEventListener("pointerup", onPointerUp);
    thumb.addEventListener("pointercancel", onPointerUp);
    thumb.addEventListener("mouseenter", onThumbEnter);
    thumb.addEventListener("mouseleave", onThumbLeave);
    update();
    return () => {
      window.clearTimeout(hideTimer);
      resize.disconnect();
      scroller.removeEventListener("scroll", show);
      scroller.removeEventListener("mouseenter", show);
      thumb.removeEventListener("pointerdown", onPointerDown);
      thumb.removeEventListener("pointermove", onPointerMove);
      thumb.removeEventListener("pointerup", onPointerUp);
      thumb.removeEventListener("pointercancel", onPointerUp);
      thumb.removeEventListener("mouseenter", onThumbEnter);
      thumb.removeEventListener("mouseleave", onThumbLeave);
    };
  }, []);

  return (
    <div className="relative min-h-0 flex-1">
      <div ref={scrollerRef} aria-label={label} className={`h-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}>
        <div>{children}</div>
      </div>
      <div
        ref={thumbRef}
        aria-hidden
        data-visible="false"
        className="fading-scroll-thumb absolute right-1 top-0 w-2 cursor-default rounded-full bg-white/30 opacity-0 transition-[opacity,background-color] duration-300 hover:bg-white/50 data-[dragging=true]:bg-white/60 data-[visible=true]:opacity-100"
      />
    </div>
  );
}
