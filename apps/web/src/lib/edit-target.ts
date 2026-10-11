import type { EditKind, SettingsSection } from "@frozen-fruit-shop/types";

/**
 * Đánh dấu một phần trên web là "sửa được" cho trang Xem trước & sửa của admin:
 *   <section {...editTarget("banner", banner.id, "Banner trang chủ")}>
 * Chỉ là thuộc tính data-* (khách xem web bình thường không thấy gì); lớp viền + nút Sửa chỉ bật
 * khi web nằm trong khung xem trước của admin (components/layout/preview-edit-overlay.tsx).
 */
export function editTarget(kind: EditKind, id: string, label: string) {
  return { "data-edit": `${kind}:${id}`, "data-edit-label": label };
}

/** Mục trong "Thông tin cửa hàng". */
export function editSettings(section: SettingsSection, label: string) {
  return editTarget("settings", section, label);
}
