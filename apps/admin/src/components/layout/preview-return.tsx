"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { previewHref, readPreviewReturn, setPreviewReturn, subscribePreviewReturn } from "@/lib/preview";

/**
 * Nút nổi "Quay lại xem trước": hiện ở mọi trang admin sau khi bấm "Sửa" trong trang Xem trước & sửa,
 * đưa về đúng trang web đang xem (kể cả sau khi lưu form và bị chuyển về trang danh sách).
 */
export function PreviewReturn() {
  const pathname = usePathname();
  const path = useSyncExternalStore(subscribePreviewReturn, readPreviewReturn, () => null);
  if (!path || pathname === "/preview") return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-1 rounded-full bg-ink p-1 pl-1 text-sm font-bold text-white shadow-2xl print:hidden">
      <Link href={previewHref(path)} className="flex items-center gap-2 rounded-full bg-accent-600 px-4 py-2 hover:bg-accent-700">
        ‹ Quay lại xem trước
        <span className="max-w-40 truncate text-xs font-semibold text-white/80">{path}</span>
      </Link>
      <button
        type="button"
        onClick={() => setPreviewReturn(null)}
        aria-label="Ẩn nút quay lại xem trước"
        className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
      >
        ×
      </button>
    </div>
  );
}
