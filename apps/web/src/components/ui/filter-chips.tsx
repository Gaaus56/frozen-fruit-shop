import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Hàng chip lọc trên nền ảnh tối của PageHero (danh mục sản phẩm, loại bài viết).
 * Mobile: một hàng vuốt ngang (không xuống nhiều dòng) để banner các trang cao bằng nhau.
 */
export function FilterChips({ label, children }: { label: string; children: ReactNode }) {
  return (
    <nav
      aria-label={label}
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [&>*]:shrink-0 [&>*]:whitespace-nowrap"
    >
      {children}
    </nav>
  );
}

export function FilterChip({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-sm transition-colors ${
        active ? "border-accent-600 bg-accent-600 text-white" : "border-white/40 bg-black/10 text-white hover:border-white hover:bg-white/15"
      }`}
    >
      {children}
    </Link>
  );
}

/** Chip trắng hiện từ khoá đang tìm, bấm để xoá. */
export function ClearFilterChip({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex items-center gap-2 rounded-full border border-white bg-white px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-white/85"
    >
      <span className="max-w-48 truncate">{children}</span>
      <span aria-hidden className="text-base leading-none text-foreground/65">×</span>
    </Link>
  );
}
