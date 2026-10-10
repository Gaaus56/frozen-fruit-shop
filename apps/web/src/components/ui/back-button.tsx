"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, type MouseEvent } from "react";

/** Đã chuyển trang bên trong web ít nhất một lần (điều hướng phía client không đổi `document.referrer`). */
let hasInAppHistory = false;

/** Gắn một lần ở layout: ghi nhận khi khách chuyển trang trong web, để BackButton biết có trang trước để quay về. */
export function NavigationTracker() {
  const pathname = usePathname();
  const firstPath = useRef(pathname);
  useEffect(() => {
    if (pathname !== firstPath.current) hasInAppHistory = true;
  }, [pathname]);
  return null;
}

/**
 * Nút tròn nhỏ "quay lại" (thay cho đường dẫn breadcrumb). Khách đến từ một trang khác trong web
 * thì quay lại đúng trang đó (giữ vị trí cuộn, bộ lọc); vào thẳng bằng link ngoài thì về `fallbackHref`.
 */
export function BackButton({ fallbackHref, label }: { fallbackHref: string; label: string }) {
  const router = useRouter();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const cameFromThisSite = hasInAppHistory || document.referrer.startsWith(window.location.origin);
    if (!cameFromThisSite || window.history.length < 2) return; // để Link tự đi tới fallbackHref
    event.preventDefault();
    router.back();
  }

  return (
    <Link
      href={fallbackHref}
      onClick={handleClick}
      aria-label={label}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-divider bg-card text-foreground/70 shadow-sm transition-colors hover:border-accent-600 hover:text-accent-700"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </Link>
  );
}
