import { env } from '../config/env.js';

/** Chuyển tiếng Việt thành slug URL: "Xoài cát Đà Nẵng" → "xoai-cat-da-nang". */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * Ảnh lưu trong DB dạng đường dẫn tương đối "/uploads/..." để không phụ thuộc tên miền.
 * Khi trả về cho client thì đổi thành URL tuyệt đối theo PUBLIC_URL; URL ngoài giữ nguyên.
 */
export function toPublicUrl(path: string): string;
export function toPublicUrl(path: string | null): string | null;
export function toPublicUrl(path: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${env.publicUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** Ngược lại với toPublicUrl: client gửi URL tuyệt đối của chính API thì lưu lại dạng tương đối. */
export function toStoredPath(url: string): string;
export function toStoredPath(url: string | null | undefined): string | null;
export function toStoredPath(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith(`${env.publicUrl}/`)) return trimmed.slice(env.publicUrl.length);
  return trimmed;
}

/** Chuẩn hoá số điện thoại Việt Nam để so sánh: bỏ khoảng trắng/dấu chấm, +84 → 0. */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '');
  return digits.startsWith('+84') ? `0${digits.slice(3)}` : digits.replace(/\+/g, '');
}

export function iso(date: Date): string;
export function iso(date: Date | null): string | null;
export function iso(date: Date | null): string | null {
  return date ? date.toISOString() : null;
}
