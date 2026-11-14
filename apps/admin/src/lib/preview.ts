/** Địa chỉ web khách hàng, mở trong khung trang "Xem trước & sửa". */
export const WEB_URL = (process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000").replace(/\/$/, "");
export const WEB_ORIGIN = new URL(WEB_URL).origin;

/**
 * Trang web đang xem lúc bấm "Sửa" (lưu trong sessionStorage của tab admin). Còn giá trị thì admin hiện nút
 * "Quay lại xem trước" ở mọi trang — kể cả sau khi lưu form (form tự chuyển về danh sách).
 */
const RETURN_KEY = "tc28:preview-return";
const RETURN_EVENT = "tc28:preview-return-changed";

export function setPreviewReturn(path: string | null) {
  try {
    if (path) window.sessionStorage.setItem(RETURN_KEY, path);
    else window.sessionStorage.removeItem(RETURN_KEY);
    window.dispatchEvent(new Event(RETURN_EVENT));
  } catch {
    // sessionStorage bị chặn — bỏ qua, chỉ mất nút quay lại.
  }
}

export function readPreviewReturn(): string | null {
  try {
    return window.sessionStorage.getItem(RETURN_KEY);
  } catch {
    return null;
  }
}

export function subscribePreviewReturn(onChange: () => void) {
  window.addEventListener(RETURN_EVENT, onChange);
  return () => window.removeEventListener(RETURN_EVENT, onChange);
}

/** Link mở lại trang Xem trước & sửa đúng trang web đang xem. */
export function previewHref(path: string) {
  return path && path !== "/" ? `/preview?path=${encodeURIComponent(path)}` : "/preview";
}
