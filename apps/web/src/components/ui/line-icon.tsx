import { ASSURANCE_ICON_INFO, normalizeAssuranceIcon } from "@frozen-fruit-shop/types";

/** Icon nét vẽ bằng `currentColor` → đổi màu theo chữ / chủ đề web (thay emoji, vốn màu cố định theo từng máy). */
export function LineIcon({ d, className = "h-5 w-5", strokeWidth = 1.8 }: { d: string; className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/** Biểu tượng thẻ cam kết đã lưu (tên icon, hoặc emoji kiểu cũ) → icon nét. */
export function AssuranceIconView({ icon, className }: { icon: string; className?: string }) {
  return <LineIcon d={ASSURANCE_ICON_INFO[normalizeAssuranceIcon(icon)].d} className={className} />;
}

/** Hình minh hoạ cho các trang / danh sách trống. */
export const EMPTY_ICONS = {
  cart: "M2 3h2.5l2.7 12.4a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.5L22 7H5.6M10 21.5a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4zM18 21.5a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4z",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5",
  box: "M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8M7.5 5.5l9 5",
  news: "M4 4h13v14a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2zM17 8h3v10a2 2 0 0 1-2 2M8 8h5M8 12h5M8 16h3",
  error: "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01",
  briefcase: "M3 7h18v13H3zM8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18M11 13v2h2v-2",
};

/** Vòng tròn nền nhạt viền đỏ + icon màu nhấn ở giữa (trạng thái trống: giỏ hàng, tìm kiếm, tin tức…). */
export function EmptyStateIcon({ d }: { d: string }) {
  return (
    <span className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-50 text-accent-600 ring-2 ring-accent-600" aria-hidden="true">
      <LineIcon d={d} className="h-10 w-10" strokeWidth={1.6} />
    </span>
  );
}
