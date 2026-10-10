"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { PublicRealtimeEvent } from "@frozen-fruit-shop/types";
import { API_URL } from "@/lib/api-client";
import { subscribeSharedEventSource } from "@/lib/shared-event-source";

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
    let timer: ReturnType<typeof setTimeout> | undefined;
    let pendingWhileHidden = false;

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

    // Một kết nối cho mọi tab của khách (xem lib/shared-event-source.ts): mở nhiều tab không chiếm hết
    // kết nối tới API (trình duyệt giới hạn 6 trên HTTP/1.1) làm treo báo giá / đặt hàng.
    const events = subscribeSharedEventSource(`${API_URL}/events`, {
      // Kết nối lại sau khi rớt mạng / API khởi động lại / tab khác nhận giữ kết nối: có thể đã lỡ sự kiện.
      onOpen: (missedEvents) => {
        if (missedEvents) scheduleRefresh();
      },
      onMessage: (data) => {
        try {
          const event = JSON.parse(data) as PublicRealtimeEvent;
          if (event.type === "changed") scheduleRefresh();
        } catch {
          // Bỏ qua dữ liệu không đọc được.
        }
      },
    });

    const onVisibilityChange = () => {
      if (!document.hidden && pendingWhileHidden) {
        pendingWhileHidden = false;
        refresh();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      events.stop();
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [router]);

  return null;
}
