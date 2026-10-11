"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { EditKind, PreviewMessage } from "@frozen-fruit-shop/types";

/** Chỉ trang admin này được bật chế độ sửa trên web (trang khác nhúng web vào khung thì không có tác dụng). */
const ADMIN_ORIGIN = new URL(process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3002").origin;

interface Hovered {
  element: HTMLElement;
  kind: EditKind;
  id: string;
  label: string;
}

function findTarget(node: EventTarget | null): Hovered | null {
  const element = node instanceof Element ? node.closest<HTMLElement>("[data-edit]") : null;
  if (!element) return null;
  const [kind, ...rest] = (element.dataset.edit ?? "").split(":");
  return { element, kind: kind as EditKind, id: rest.join(":"), label: element.dataset.editLabel ?? "Nội dung" };
}

/**
 * Lớp "chế độ sửa" khi admin xem web trong trang Xem trước & sửa:
 * rê chuột vào phần có đánh dấu (editTarget) → viền đỏ + nhãn; bấm đúp → báo admin mở trang sửa.
 * Web mở bình thường (không nằm trong khung của admin) thì component này không làm gì.
 */
export function PreviewEditOverlay() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"off" | "edit" | "browse">("off");
  const [hovered, setHovered] = useState<Hovered | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const hoveredRef = useRef<Hovered | null>(null);

  const path = `${pathname}${searchParams.size ? `?${searchParams}` : ""}`;
  const post = (message: PreviewMessage) => window.parent.postMessage(message, ADMIN_ORIGIN);

  // Nhận lệnh từ admin (chỉ khi đang nằm trong khung và đúng nguồn admin).
  useEffect(() => {
    if (window.parent === window) return;
    const onMessage = (event: MessageEvent<PreviewMessage>) => {
      if (event.origin !== ADMIN_ORIGIN || event.data?.type !== "tc28:preview") return;
      setMode(event.data.mode === "edit" ? "edit" : "browse");
    };
    window.addEventListener("message", onMessage);
    // Báo admin đã sẵn sàng; admin trả lời bằng chế độ hiện tại.
    window.parent.postMessage({ type: "tc28:ready" } satisfies PreviewMessage, ADMIN_ORIGIN);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Báo admin trang đang xem (lúc bật và mỗi lần chuyển trang trong khung).
  useEffect(() => {
    if (mode !== "off") post({ type: "tc28:path", path });
  }, [mode, path]);

  // Chế độ sửa: viền bám theo phần dưới con trỏ; bấm 1 lần không làm gì (không đi theo link), bấm đúp mới mở trang sửa.
  useEffect(() => {
    if (mode !== "edit") return;
    let pointer: { x: number; y: number } | null = null;
    let lastRect = "";
    let frame = 0;

    const update = (target: Hovered | null) => {
      hoveredRef.current = target;
      setHovered(target);
      lastRect = "";
    };
    // Mỗi khung hình: đo lại vị trí phần đang chọn. Theo kịp khi cuộn, khi thẻ sản phẩm nhấc lên lúc rê chuột,
    // khi dải danh mục tự lướt… (không dùng hiệu ứng trượt cho viền nên không bị trễ).
    const tick = () => {
      const current = hoveredRef.current;
      if (current) {
        const box = current.element.getBoundingClientRect();
        const key = `${box.top}|${box.left}|${box.width}|${box.height}`;
        if (key !== lastRect) {
          lastRect = key;
          setRect(box);
        }
      } else if (lastRect !== "none") {
        lastRect = "none";
        setRect(null);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const onMove = (event: MouseEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      const target = findTarget(event.target);
      if (target?.element !== hoveredRef.current?.element) update(target);
    };
    // Cuộn mà không di chuột: phần nằm dưới con trỏ đã đổi → chọn lại theo vị trí con trỏ.
    const onScroll = () => {
      if (!pointer) return;
      const target = findTarget(document.elementFromPoint(pointer.x, pointer.y));
      if (target?.element !== hoveredRef.current?.element) update(target);
    };
    const onLeave = () => {
      pointer = null;
      update(null);
    };
    const onClick = (event: MouseEvent) => {
      if (!findTarget(event.target)) return;
      event.preventDefault();
      event.stopPropagation();
    };
    const onDoubleClick = (event: MouseEvent) => {
      const target = findTarget(event.target);
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      window.getSelection()?.removeAllRanges();
      post({ type: "tc28:edit", kind: target.kind, id: target.id, path });
    };

    document.addEventListener("mousemove", onMove);
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener("scroll", onScroll, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("dblclick", onDoubleClick, true);
    document.documentElement.dataset.previewEdit = "";
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("scroll", onScroll, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("dblclick", onDoubleClick, true);
      delete document.documentElement.dataset.previewEdit;
      hoveredRef.current = null;
      setHovered(null);
      setRect(null);
    };
  }, [mode, path]);

  if (mode !== "edit" || !hovered || !rect) return null;

  // Nhãn nằm trên viền; sát mép trên màn hình thì đưa vào trong viền.
  const labelInside = rect.top < 30;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      <div
        className="absolute rounded-md outline outline-2 outline-offset-2 outline-[#cf2a10]"
        style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height, background: "rgb(207 42 16 / 0.06)" }}
      />
      <div
        className="absolute flex items-center gap-1.5 rounded-md bg-[#cf2a10] px-2.5 py-1 text-xs font-bold text-white shadow-lg"
        style={{ top: labelInside ? rect.top + 6 : rect.top - 30, left: Math.max(6, rect.left) }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
          <path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4" />
        </svg>
        Bấm đúp để sửa: {hovered.label}
      </div>
    </div>
  );
}
