import { useMemo, useSyncExternalStore } from "react";
import type { OrderLookupResult } from "@frozen-fruit-shop/types";

/** Thông tin cửa hàng in trên đầu bill (lấy từ "Thông tin cửa hàng" lúc xuất bill). */
export interface ReceiptStore {
  name: string;
  phone: string;
  address: string;
  taxCode: string;
}

/** Bill khách đã xuất, lưu trên chính máy khách (localStorage) để lần sau mở lại ở trang Tra cứu đơn hàng. */
export interface SavedReceipt {
  orderNumber: string;
  /** SĐT đặt hàng — cần để tra cứu lại trạng thái mới nhất. */
  phone: string;
  /** Lúc xuất / cập nhật bill (ISO). */
  savedAt: string;
  order: OrderLookupResult;
  store: ReceiptStore;
}

const KEY = "traicay28:receipts";
/** Giữ tối đa chừng này bill gần nhất trên một máy. */
const MAX_RECEIPTS = 20;
/** Báo cho các phần khác trên trang (danh sách bill) cập nhật ngay khi có bill mới. */
export const RECEIPTS_CHANGED_EVENT = "traicay28:receipts-changed";

/** Chuỗi JSON thô đang lưu; localStorage bị chặn (chế độ riêng tư, trình duyệt trong app) → coi như chưa có bill. */
function readRaw(): string {
  try {
    return window.localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function parse(raw: string): SavedReceipt[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is SavedReceipt => typeof item?.orderNumber === "string" && typeof item?.order === "object")
      : [];
  } catch {
    return [];
  }
}

export function loadReceipts(): SavedReceipt[] {
  return parse(readRaw());
}

function subscribe(onChange: () => void) {
  window.addEventListener(RECEIPTS_CHANGED_EVENT, onChange);
  // Tab khác cùng máy lưu / xoá bill.
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(RECEIPTS_CHANGED_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Danh sách bill trên máy này, tự cập nhật khi lưu / xoá. Lúc render trên server luôn rỗng. */
export function useSavedReceipts(): SavedReceipt[] {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "[]");
  return useMemo(() => parse(raw), [raw]);
}

function write(receipts: SavedReceipt[]): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(receipts.slice(0, MAX_RECEIPTS)));
    window.dispatchEvent(new Event(RECEIPTS_CHANGED_EVENT));
    return true;
  } catch {
    return false;
  }
}

/**
 * Lưu bill. Bill mới thêm lên đầu danh sách; bill đã có (xem lại, cập nhật trạng thái) thì sửa tại chỗ,
 * không đổi thứ tự. Trả về false nếu máy không cho lưu.
 */
export function saveReceipt(receipt: SavedReceipt): boolean {
  const receipts = loadReceipts();
  const index = receipts.findIndex((item) => item.orderNumber === receipt.orderNumber);
  if (index === -1) return write([receipt, ...receipts]);
  return write(receipts.map((item, i) => (i === index ? receipt : item)));
}

export function removeReceipt(orderNumber: string): void {
  write(loadReceipts().filter((item) => item.orderNumber !== orderNumber));
}
