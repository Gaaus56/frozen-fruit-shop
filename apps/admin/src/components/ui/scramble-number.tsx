"use client";

import { useEffect, useState } from "react";

const DELAY_MS = 550;
const DURATION_MS = 1100;

/**
 * Số liệu "nhảy loạn" rồi dừng ở giá trị thật — chỉ khi vừa đăng nhập (`<html data-enter>`).
 * Chỉ thay các chữ số, giữ nguyên dấu chấm, ký hiệu ₫ / %; chữ số dừng dần từ trái sang phải.
 */
export function ScrambleNumber({ value }: { value: string }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!document.documentElement.hasAttribute("data-enter")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const digits = [...value].filter((char) => /\d/.test(char)).length;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const elapsed = now - start - DELAY_MS;
      if (elapsed >= DURATION_MS) {
        setDisplay(value);
        return;
      }
      // Số chữ số đã "khoá" (hiện đúng), tăng dần theo thời gian.
      const locked = elapsed <= 0 ? 0 : Math.floor((elapsed / DURATION_MS) * (digits + 1));
      let seen = 0;
      setDisplay(
        [...value]
          .map((char) => {
            if (!/\d/.test(char)) return char;
            seen += 1;
            return seen <= locked ? char : String(Math.floor(Math.random() * 10));
          })
          .join(""),
      );
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  // tabular-nums: chữ số cùng bề rộng nên con số không bị rung ngang khi nhảy.
  return <span className="tabular-nums">{display}</span>;
}
