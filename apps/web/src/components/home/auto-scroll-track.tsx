"use client";

import { useEffect, useRef, type ReactNode } from "react";

const INTERVAL_MS = 5000;
const SLIDE_MS = 900;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Dải ngang tự lướt sang phải, chạy vòng liên tục như banner.
 * Phần con phải được nhân đôi (bản sao nằm sau bản gốc, ẩn ở breakpoint không đủ dài để lướt).
 * Khi lướt tới hết bản gốc thì nhảy âm thầm về đúng vị trí tương ứng ở đầu nên không thấy lùi lại.
 * Khách vuốt ngón tay / kéo để lướt tay được (dải cuộn ngang). Tạm dừng khi đang chạm / rê chuột,
 * và chờ thêm một nhịp sau lần vuốt cuối mới tự lướt tiếp. Tắt hẳn nếu người dùng bật "giảm chuyển động".
 */
export function AutoScrollTrack({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  /** Lần cuối khách tự vuốt / cuộn dải này (ms). */
  const lastTouchRef = useRef(0);
  const frameRef = useRef(0);

  useEffect(() => {
    const track = ref.current;
    if (!track || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const stopSlide = () => {
      cancelAnimationFrame(frameRef.current);
      track.style.scrollSnapType = "";
    };

    // Trượt mượt (ease-in-out) và tạm tắt snap trong lúc trượt để không bị khựng từng ô.
    const slideTo = (target: number) => {
      stopSlide();
      const from = track.scrollLeft;
      const start = performance.now();
      track.style.scrollSnapType = "none";
      const tick = (now: number) => {
        const t = Math.min((now - start) / SLIDE_MS, 1);
        track.scrollLeft = from + (target - from) * easeInOut(t);
        if (t < 1) frameRef.current = requestAnimationFrame(tick);
        else track.style.scrollSnapType = "";
      };
      frameRef.current = requestAnimationFrame(tick);
    };

    const timer = window.setInterval(() => {
      if (pausedRef.current || performance.now() - lastTouchRef.current < INTERVAL_MS) return;
      const items = Array.from(track.children) as HTMLElement[];
      const half = items.length / 2;
      const [first, second] = items;
      const copy = items[half];
      // Không có bản sao đang hiện nghĩa là nội dung vừa khung: không cần lướt.
      if (!second || !copy || copy.offsetWidth === 0) return;

      const step = second.offsetLeft - first.offsetLeft;
      const loopWidth = copy.offsetLeft - first.offsetLeft;
      if (track.scrollLeft >= loopWidth - 1) track.scrollLeft -= loopWidth;
      slideTo(track.scrollLeft + step);
    }, INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
      stopSlide();
    };
  }, []);

  const pause = () => {
    pausedRef.current = true;
    lastTouchRef.current = performance.now();
    cancelAnimationFrame(frameRef.current);
    if (ref.current) ref.current.style.scrollSnapType = "";
  };
  const resume = () => {
    pausedRef.current = false;
    lastTouchRef.current = performance.now();
  };

  return (
    <div
      ref={ref}
      onPointerDown={pause}
      onPointerUp={resume}
      onPointerCancel={resume}
      onPointerLeave={resume}
      // Cuộn bằng bàn di chuột / con lăn ngang cũng tính là khách tự lướt.
      onWheel={() => (lastTouchRef.current = performance.now())}
      className={className}
    >
      {children}
    </div>
  );
}
