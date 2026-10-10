/**
 * Một kết nối Server-Sent Events dùng chung cho MỌI tab cùng trình duyệt.
 *
 * Vì sao: trên HTTP/1.1 (máy dev, http://localhost) trình duyệt chỉ cho 6 kết nối đồng thời tới một địa chỉ.
 * Mỗi tab giữ riêng một EventSource thì mở 6 tab là hết chỗ — mọi request khác (lưu bài, chuyển trang) xếp hàng
 * chờ mãi, trang như bị treo. (Production qua Caddy là HTTP/2 nên ít gặp, nhưng vẫn tốn kết nối vô ích.)
 *
 * Cách làm: các tab tranh một Web Lock; tab giữ lock ("tab trưởng") mở EventSource duy nhất và chuyển từng sự kiện
 * sang các tab khác qua BroadcastChannel. Tab trưởng đóng → lock nhả → tab khác tự nhận và mở kết nối mới.
 * Trình duyệt không có Web Locks / BroadcastChannel → mỗi tab tự mở kết nối như trước.
 *
 * (Bản sao ở apps/admin/src/lib/shared-event-source.ts — sửa thì sửa cả hai.)
 */

export interface SharedEventSourceHandlers {
  /** Dữ liệu (`data`) của từng sự kiện — mọi tab đều nhận. */
  onMessage: (data: string) => void;
  /**
   * Kết nối mở / mở lại. `missedEvents` = có thể đã lỡ sự kiện (kết nối lại sau khi rớt, hoặc tab khác vừa
   * nhận làm tab trưởng) → nên tải lại dữ liệu một lần.
   */
  onOpen?: (missedEvents: boolean) => void;
  /** Kết nối bị máy chủ đóng hẳn (401 hết phiên, 502 API tắt). Chỉ gọi ở tab trưởng; tự kết nối lại sau `retryMs`. */
  onClosed?: () => void;
}

export interface SharedEventSource {
  /** Tab này đang giữ kết nối thật (dùng để chỉ một tab phát âm báo). */
  isLeader: () => boolean;
  stop: () => void;
}

type ChannelMessage = { kind: "message"; data: string } | { kind: "open" };

export function subscribeSharedEventSource(url: string, handlers: SharedEventSourceHandlers, retryMs = 5000): SharedEventSource {
  let source: EventSource | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let hasConnected = false;
  let leader = false;
  let stopped = false;

  const canShare = typeof BroadcastChannel !== "undefined" && typeof navigator !== "undefined" && "locks" in navigator;
  const channel = canShare ? new BroadcastChannel(`sse:${url}`) : null;
  const abort = new AbortController();
  let releaseLock: (() => void) | undefined;

  const open = () => {
    if (stopped) return;
    source = new EventSource(url);
    source.onopen = () => {
      handlers.onOpen?.(hasConnected);
      hasConnected = true;
      channel?.postMessage({ kind: "open" } satisfies ChannelMessage);
    };
    source.onmessage = (event: MessageEvent<string>) => {
      handlers.onMessage(event.data);
      channel?.postMessage({ kind: "message", data: event.data } satisfies ChannelMessage);
    };
    source.onerror = () => {
      // Lỗi mạng: EventSource tự kết nối lại. Máy chủ đóng hẳn (CLOSED) → báo ra ngoài rồi thử lại sau.
      if (source?.readyState !== EventSource.CLOSED || stopped) return;
      source.close();
      handlers.onClosed?.();
      retryTimer = setTimeout(open, retryMs);
    };
  };

  if (channel) {
    // Tab thường: nhận lại sự kiện do tab trưởng chuyển sang.
    channel.onmessage = (event: MessageEvent<ChannelMessage>) => {
      if (leader) return;
      if (event.data.kind === "message") handlers.onMessage(event.data.data);
      else handlers.onOpen?.(true); // tab trưởng (mới) vừa kết nối — có thể đã lỡ sự kiện
    };
    navigator.locks
      .request(`sse:${url}`, { signal: abort.signal }, () => {
        if (stopped) return;
        leader = true;
        open();
        // Giữ lock tới khi tab đóng / component huỷ.
        return new Promise<void>((resolve) => (releaseLock = resolve));
      })
      .catch(() => {
        // AbortError khi huỷ trước lúc được nhận lock — bình thường.
      });
  } else {
    leader = true;
    open();
  }

  return {
    isLeader: () => leader,
    stop: () => {
      stopped = true;
      clearTimeout(retryTimer);
      source?.close();
      abort.abort();
      releaseLock?.();
      channel?.close();
    },
  };
}
