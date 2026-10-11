"use client";

/** Thời gian hiệu ứng xe tải (khớp animation .order-truck / .order-box trong globals.css). */
export const ORDER_ANIMATION_MS = 2600;

/**
 * Nút "Đặt hàng" có hiệu ứng: bấm → thùng hàng rơi lên xe tải, xe chạy khỏi nút → "Đặt hàng thành công".
 * `state`: idle (chờ bấm) · sending (đang gửi đơn + chạy hiệu ứng) · done (đã đặt xong).
 */
export function OrderButton({ state, disabled }: { state: "idle" | "sending" | "done"; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled || state !== "idle"}
      data-state={state}
      className="order-button relative flex h-14 w-full items-center justify-center overflow-hidden rounded-full bg-accent-600 text-base font-extrabold text-white shadow-lg shadow-accent-900/20 transition-colors hover:bg-accent-700 disabled:cursor-not-allowed data-[state=idle]:disabled:opacity-45"
    >
      <span className="order-label">Đặt hàng</span>
      <span className="order-done" aria-hidden={state !== "done"}>
        Đặt hàng thành công
      </span>
      <span className="sr-only" aria-live="polite">
        {state === "sending" ? "Đang gửi đơn hàng…" : ""}
      </span>

      {/* Vạch đường chạy */}
      <span className="order-road" aria-hidden />
      {/* Xe tải: thùng xe trắng + đầu xe đỏ, thùng hàng vàng rơi lên thùng xe */}
      <span className="order-truck" aria-hidden>
        <span className="order-box" />
        <span className="order-truck-back" />
        <span className="order-truck-front">
          <span className="order-truck-window" />
        </span>
        <span className="order-wheel order-wheel-1" />
        <span className="order-wheel order-wheel-2" />
      </span>
    </button>
  );
}
