"use client";

import { useState } from "react";

/** Thời gian hiệu ứng rời trang quản trị (khớp html[data-leave] trong globals.css). */
const LEAVE_MS = 900;

/**
 * Đăng xuất có hiệu ứng ngược với lúc đăng nhập: nội dung mờ xuống, các nút menu ẩn dần từ dưới lên,
 * menu bên trượt ra bên phải — rồi mới gọi /logout (trang đăng nhập hiện lại có hiệu ứng, xem login/page.tsx).
 */
export function LogoutButton({ className, children }: { className?: string; children: React.ReactNode }) {
  const [leaving, setLeaving] = useState(false);

  return (
    <a
      href="/logout?bye=1"
      aria-disabled={leaving}
      onClick={(event) => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        event.preventDefault();
        if (leaving) return;
        setLeaving(true);
        document.documentElement.setAttribute("data-leave", "");
        // /logout là route handler (xoá cookie phiên rồi chuyển về /login) → cần tải trang thật, không dùng router.push.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.setTimeout(() => window.location.assign("/logout?bye=1"), LEAVE_MS);
      }}
      className={className}
    >
      {children}
    </a>
  );
}
