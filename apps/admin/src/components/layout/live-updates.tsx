"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { INQUIRY_TYPE_LABELS, type AdminRealtimeEvent } from "@frozen-fruit-shop/types";
import { formatCurrency } from "@/lib/format";
import { subscribeSharedEventSource } from "@/lib/shared-event-source";

interface Toast {
  key: string;
  title: string;
  detail: string;
  href: string;
}

const TOAST_MS = 20_000;
const RECONNECT_MS = 10_000;
const MAX_TOASTS = 4;

function toToast(event: AdminRealtimeEvent): Toast | null {
  switch (event.type) {
    case "order.created":
      return {
        key: `order-${event.id}`,
        title: `Đơn hàng mới ${event.orderNumber}`,
        detail: `${event.customerName} · ${formatCurrency(event.total)}`,
        href: `/orders/${event.id}`,
      };
    case "inquiry.created":
      return {
        key: `inquiry-${event.id}`,
        title: `${INQUIRY_TYPE_LABELS[event.inquiryType]} mới`,
        detail: event.name,
        href: event.inquiryType === "wholesale" ? "/inquiries?type=wholesale" : "/inquiries",
      };
    case "comment.created":
      return {
        key: `comment-${event.id}`,
        title: "Bình luận mới chờ duyệt",
        detail: `${event.name} · ${event.postTitle}`,
        href: "/comments",
      };
    default:
      return null;
  }
}

/** Tiếng "ting" ngắn báo có việc mới; trình duyệt chặn âm thanh khi chưa tương tác với trang thì bỏ qua. */
function playChime() {
  try {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.6);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.6);
    oscillator.onended = () => void context.close();
  } catch {
    // Không phát được âm thanh — thông báo trên màn hình vẫn hiển thị.
  }
}

/**
 * Nhận sự kiện realtime (qua /api/events): đơn hàng / liên hệ mới, thay đổi dữ liệu từ tài khoản khác.
 * Mỗi sự kiện → tải lại dữ liệu trang đang xem và số việc cần xử lý ở menu (router.refresh giữ nguyên
 * nội dung đang nhập trong form). Đơn hàng / liên hệ mới → hiện thông báo góc màn hình kèm âm báo.
 */
export function LiveUpdates() {
  const router = useRouter();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [unseen, setUnseen] = useState(0);

  useEffect(() => {
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    const scheduleRefresh = () => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => router.refresh(), 300);
    };

    // Một kết nối cho mọi tab admin (xem lib/shared-event-source.ts) — tránh hết chỗ kết nối khi mở nhiều tab.
    const events = subscribeSharedEventSource(
      "/api/events",
      {
        onOpen: (missedEvents) => {
          // Kết nối lại sau khi rớt / tab khác vừa nhận giữ kết nối: có thể đã lỡ sự kiện nên tải lại một lần.
          if (missedEvents) scheduleRefresh();
        },
        onMessage: (data) => {
          let event: AdminRealtimeEvent;
          try {
            event = JSON.parse(data) as AdminRealtimeEvent;
          } catch {
            return;
          }
          scheduleRefresh();
          const toast = toToast(event);
          if (!toast) return;
          setToasts((current) => [toast, ...current.filter((item) => item.key !== toast.key)].slice(0, MAX_TOASTS));
          if (document.hidden) setUnseen((count) => count + 1);
          // Mở nhiều tab thì chỉ tab giữ kết nối kêu, tránh âm báo chồng lên nhau.
          if (events.isLeader()) playChime();
        },
        // Máy chủ đóng hẳn kết nối (401 hết phiên, 502 API tắt): tải lại trang — hết phiên thì tự về đăng nhập.
        onClosed: () => router.refresh(),
      },
      RECONNECT_MS,
    );

    const onVisibilityChange = () => {
      if (!document.hidden) setUnseen(0);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      events.stop();
      clearTimeout(refreshTimer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [router]);

  // Tab đang ẩn: hiện số việc mới trên tiêu đề tab, ví dụ "(2) Đơn hàng".
  useEffect(() => {
    const current = document.title.replace(/^\(\d+\) /, "");
    document.title = unseen > 0 ? `(${unseen}) ${current}` : current;
  }, [unseen]);

  // Thông báo tự ẩn sau một lúc.
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => setToasts((current) => current.slice(0, -1)), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toasts]);

  const dismiss = (key: string) => setToasts((current) => current.filter((toast) => toast.key !== key));

  if (toasts.length === 0) return null;

  return (
    <div aria-live="polite" className="fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 print:hidden">
      {toasts.map((toast) => (
        <div key={toast.key} role="status" className="flex items-start gap-3 border-l-4 border-accent-600 bg-surface p-4 shadow-lg ring-1 ring-divider">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-foreground">{toast.title}</p>
            <p className="mt-0.5 truncate text-sm text-foreground/60">{toast.detail}</p>
            <Link href={toast.href} onClick={() => dismiss(toast.key)} className="mt-2 inline-block text-sm font-bold text-accent-700 hover:underline">
              Xem chi tiết →
            </Link>
          </div>
          <button type="button" onClick={() => dismiss(toast.key)} aria-label="Đóng thông báo" className="px-1 text-lg leading-none text-foreground/40 hover:text-foreground">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
