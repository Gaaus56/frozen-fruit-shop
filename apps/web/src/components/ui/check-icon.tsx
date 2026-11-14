/** Dấu V nét thẳng (2 đoạn), thay ký tự ✓ vốn cong và đổi dáng theo font. Màu theo `currentColor`. */
export function CheckIcon({ className = "h-[1em] w-[1em]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

/**
 * Vòng tròn xanh lá + dấu V tự vẽ (form liên hệ, đặt hàng thành công).
 * `animate`: bật hiệu ứng vẽ — gỡ đi sau khi chạy xong thì hình vẫn đứng yên ở trạng thái đã vẽ
 * (kiểu mặc định là đã vẽ đủ, keyframes mới bắt đầu từ trạng thái ẩn) nên ẩn / hiện lại không vẽ lại.
 * `delayMs`: chờ trước khi vẽ (form liên hệ chờ máy bay giấy bay xong).
 */
export function SuccessCheck({
  animate = true,
  delayMs = 0,
  className = "h-20 w-20",
  onDone,
}: {
  animate?: boolean;
  delayMs?: number;
  className?: string;
  onDone?: () => void;
}) {
  return (
    <svg
      className={`success-check ${animate ? "success-check-animate" : ""} ${className}`}
      style={{ ["--check-delay" as string]: `${delayMs}ms` }}
      viewBox="0 0 64 64"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      onAnimationEnd={(event) => {
        if (event.animationName === "success-check-mark") onDone?.();
      }}
    >
      <circle className="success-check-circle" cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" />
      <path className="success-check-mark" d="M20 33l8 8 16-17" stroke="currentColor" strokeWidth="5" />
    </svg>
  );
}
