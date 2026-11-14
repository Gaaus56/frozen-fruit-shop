import type { ReactNode } from "react";

/** Đường vẽ icon (khung 24×24) cho các trang báo lỗi. */
export const STATUS_ICONS = {
  /** Tam giác cảnh báo: có lỗi. */
  error: "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01",
};

/**
 * Khung trang báo lỗi dùng chung (404, lỗi tải dữ liệu…): icon tròn viền đỏ, mã lỗi, tiêu đề, lời giải thích, các nút.
 * Dùng được cả trong component server (not-found) lẫn client (error).
 */
export function StatusPage({
  icon,
  code,
  title,
  children,
  actions,
  className = "",
}: {
  /** Bỏ trống ở trang 404 (chỉ hiện mã lỗi lớn). */
  icon?: string;
  code?: string;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center gap-4 px-4 py-16 text-center ${className}`}>
      {icon ? (
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-50 text-accent-600 ring-2 ring-accent-600" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10">
            <path d={icon} />
          </svg>
        </span>
      ) : null}
      {code ? <p className="text-5xl font-extrabold leading-none text-accent-600">{code}</p> : null}
      <h1 className="text-2xl uppercase">{title}</h1>
      {children ? <div className="max-w-md text-sm text-foreground/70">{children}</div> : null}
      {actions ? <div className="mt-2 flex flex-wrap justify-center gap-3">{actions}</div> : null}
    </div>
  );
}
