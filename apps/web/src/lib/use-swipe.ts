import { useRef, type TouchEvent } from "react";

/** Quãng vuốt ngang tối thiểu (px) để tính là chuyển slide. */
const MIN_DISTANCE = 40;

/**
 * Vuốt ngón tay trái / phải trên màn hình cảm ứng (banner, ảnh sản phẩm...).
 * Chỉ tính khi vuốt ngang rõ ràng hơn vuốt dọc, để không cản khách cuộn trang.
 * Trả về các handler gắn thẳng vào phần tử: `<div {...swipe}>`.
 */
export function useSwipe(onNext: () => void, onPrev: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null);

  return {
    onTouchStart(event: TouchEvent) {
      const touch = event.touches[0];
      start.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
    },
    onTouchEnd(event: TouchEvent) {
      const from = start.current;
      const touch = event.changedTouches[0];
      start.current = null;
      if (!from || !touch) return;
      const dx = touch.clientX - from.x;
      const dy = touch.clientY - from.y;
      if (Math.abs(dx) < MIN_DISTANCE || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) onNext();
      else onPrev();
    },
  };
}
