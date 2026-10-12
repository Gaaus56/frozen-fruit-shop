"use client";

import { useId, useState, type ReactNode } from "react";

/**
 * Dòng giải thích ẩn sau nút "?" nhỏ cạnh tiêu đề / nhãn — bấm mới hiện, bấm lại để ẩn.
 * `head` là tiêu đề hoặc nhãn; `children` (ô nhập, nội dung khung…) nằm giữa tiêu đề và dòng giải thích
 * khi `placement="bottom"` (giống vị trí chữ gợi ý cũ dưới ô nhập), hoặc sau dòng giải thích khi "top".
 */
export function WithHelp({
  head,
  help,
  label,
  placement = "top",
  className,
  helpClassName = "text-sm",
  children,
}: {
  head: ReactNode;
  help?: ReactNode;
  /** Đọc cho trình đọc màn hình: "Giải thích: <label>". */
  label: string;
  placement?: "top" | "bottom";
  className?: string;
  helpClassName?: string;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  if (!help) {
    return (
      <div className={className}>
        {head}
        {children}
      </div>
    );
  }

  const text = (
    <HelpPanel id={id} open={open}>
      <p className={`mt-1.5 border-l-2 border-accent-600 bg-accent-50/60 px-3 py-1.5 text-foreground/70 ${helpClassName}`}>{help}</p>
    </HelpPanel>
  );

  return (
    <div className={className}>
      <div className="flex items-center gap-1.5">
        {head}
        <HelpButton open={open} onToggle={() => setOpen((value) => !value)} controls={id} label={label} />
      </div>
      {placement === "top" ? text : null}
      {children}
      {placement === "bottom" ? text : null}
    </div>
  );
}

export function HelpButton({ open, onToggle, controls, label }: { open: boolean; onToggle: () => void; controls: string; label: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={controls}
      aria-label={`Giải thích: ${label}`}
      title={open ? "Ẩn giải thích" : "Xem giải thích"}
      className={`inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border text-[11px] font-bold leading-none transition-colors ${
        open ? "border-accent-600 bg-accent-600 text-white" : "border-foreground/30 text-foreground/50 hover:border-accent-600 hover:text-accent-700"
      }`}
    >
      ?
    </button>
  );
}

/**
 * Khung trượt mượt cho dòng giải thích: co giãn grid-template-rows 0fr ↔ 1fr (theo đúng chiều cao nội dung,
 * không cần đo) + mờ dần. Khi đóng vẫn nằm trong DOM nhưng `inert` để không bị Tab / trình đọc màn hình chạm tới.
 * `axis="x"`: trượt ngang (dòng chữ nằm cùng hàng với nút).
 */
export function HelpPanel({ id, open, axis = "y", children }: { id: string; open: boolean; axis?: "x" | "y"; children: ReactNode }) {
  const size =
    axis === "y"
      ? open
        ? "grid-rows-[1fr]"
        : "grid-rows-[0fr]"
      : open
        ? "grid-cols-[1fr]"
        : "grid-cols-[0fr]";
  return (
    <div
      id={id}
      inert={!open}
      className={`grid transition-[grid-template-rows,grid-template-columns,opacity,translate] duration-300 ease-out motion-reduce:transition-none ${size} ${
        open ? "translate-y-0 opacity-100" : `${axis === "y" ? "-translate-y-1" : ""} opacity-0`
      }`}
    >
      <div className={`min-h-0 min-w-0 overflow-hidden ${axis === "x" ? "whitespace-nowrap" : ""}`}>{children}</div>
    </div>
  );
}
