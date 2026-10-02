"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { PublicRealtimeEvent } from "@frozen-fruit-shop/types";
import { API_URL } from "@/lib/api-client";

/** Sự kiện trên window: dữ liệu cửa hàng vừa đổi — component cần kiểm tra lại (ví dụ báo giá giỏ hàng) lắng nghe. */
export const DATA_CHANGED_EVENT = "traicay28:data-changed";

/**
 * Nghe sự kiện realtime từ API (Server-Sent Events). Khi admin sửa sản phẩm, banner, bài viết, thông tin
 * cửa hàng... trang đang mở tự tải lại dữ liệu mới mà không mất giỏ hàng hay nội dung đang nhập.
 * Tab đang ẩn thì đợi tới khi khách quay lại mới tải. Mỗi trình duyệt trễ ngẫu nhiên một chút để
 * hàng loạt khách không cùng lúc dồn vào máy chủ.
 */
export function LiveUpdates() {
  const router = useRouter();

  useEffect(() => {
    const source = new EventSource(`${API_URL}/events`);
    let timer: ReturnType<typeof setTimeout> | undefined;
    let pendingWhileHidden = false;
    let hasConnected = false;

    const refresh = () => {
      if (document.hidden) {
        pendingWhileHidden = true;
        return;
      }
      router.refresh();
      window.dispatchEvent(new Event(DATA_CHANGED_EVENT));
    };
    const scheduleRefresh = () => {
      clearTimeout(timer);
      timer = setTimeout(refresh, 300 + Math.random() * 1500);
    };

    source.onopen = () => {
      // Kết nối lại sau khi rớt mạng / API khởi động lại: có thể đã lỡ sự kiện nên tải lại một lần.
      if (hasConnected) scheduleRefresh();
      hasConnected = true;
    };
    source.onmessage = (message: MessageEvent<string>) => {
      try {
        const event = JSON.parse(message.data) as PublicRealtimeEvent;
        if (event.type === "changed") scheduleRefresh();
      } catch {
        // Bỏ qua dữ liệu không đọc được.
      }
    };

    const onVisibilityChange = () => {
      if (!document.hidden && pendingWhileHidden) {
        pendingWhileHidden = false;
        refresh();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      source.close();
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [router]);

  return null;
}
