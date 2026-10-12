"use client";

import { useEffect } from "react";

/** Đủ cho toàn bộ chuỗi hiệu ứng vào trang (menu, nội dung, số liệu, biểu đồ — xem globals.css "Hiệu ứng sau đăng nhập"). */
const ENTER_MS = 2800;

/**
 * Sau khi đăng nhập, form đặt `<html data-enter>` rồi mới chuyển trang → trang quản trị hiện ra có hiệu ứng.
 * Component này gỡ thuộc tính khi hiệu ứng chạy xong, để chuyển trang về sau không chạy lại.
 */
export function EnterAnimation() {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.hasAttribute("data-enter")) return;
    const timer = window.setTimeout(() => root.removeAttribute("data-enter"), ENTER_MS);
    return () => window.clearTimeout(timer);
  }, []);
  return null;
}
