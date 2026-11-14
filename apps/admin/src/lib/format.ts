export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(amount);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value);
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(iso));
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(
    new Date(iso),
  );
}

/** Đọc chuỗi từ FormData, cắt khoảng trắng. */
export function text(data: FormData, key: string): string {
  return String(data.get(key) ?? "").trim();
}

/** Checkbox HTML chỉ gửi giá trị khi được tick. */
export function checked(data: FormData, key: string): boolean {
  return data.get(key) === "on";
}

export function int(data: FormData, key: string): number | null {
  const raw = text(data, key).replace(/[.\s,]/g, "");
  if (raw === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? Math.trunc(value) : null;
}
