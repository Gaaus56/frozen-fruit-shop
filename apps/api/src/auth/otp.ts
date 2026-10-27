import { createCipheriv, createDecipheriv, createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { generateSecret, generateURI, verify } from 'otplib';
import QRCode from 'qrcode';
import { env } from '../config/env.js';

/** Tên hiện trong app Authenticator (Google / Microsoft Authenticator). */
export const OTP_ISSUER = 'Trái Cây 28 — Quản trị';
/** Chấp nhận lệch đồng hồ điện thoại ±30 giây (một bước mã trước / sau). */
const EPOCH_TOLERANCE = 30;
export const RECOVERY_CODE_COUNT = 8;

// ───────────── Mã hoá khoá bí mật trong DB (AES-256-GCM) ─────────────
// Lộ bản sao database cũng không lấy được khoá OTP để tự sinh mã.

export function encryptSecret(secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', env.otpEncryptionKey, iv);
  const data = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  return ['v1', iv.toString('base64'), cipher.getAuthTag().toString('base64'), data.toString('base64')].join(':');
}

export function decryptSecret(stored: string): string {
  const [version, iv, tag, data] = stored.split(':');
  if (version !== 'v1' || !iv || !tag || !data) throw new Error('Khoá OTP lưu sai định dạng');
  const decipher = createDecipheriv('aes-256-gcm', env.otpEncryptionKey, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(data, 'base64')), decipher.final()]).toString('utf8');
}

// ───────────── Mã 6 số ─────────────

/** Mã 6 số khách gõ có thể có dấu cách ("123 456"). */
export function normalizeCode(code: string): string {
  return code.replace(/[\s-]/g, '');
}

/**
 * Kiểm tra mã 6 số. Trả về bước thời gian của mã (để lưu, chặn dùng lại), hoặc null nếu sai / đã dùng.
 * `afterTimeStep`: bước của mã dùng gần nhất — mã cùng bước hoặc cũ hơn bị từ chối (chống phát lại).
 */
export async function verifyTotp(encryptedSecret: string, code: string, afterTimeStep: number | null): Promise<number | null> {
  const token = normalizeCode(code);
  if (!/^\d{6}$/.test(token)) return null;
  const result = await verify({
    secret: decryptSecret(encryptedSecret),
    token,
    epochTolerance: EPOCH_TOLERANCE,
    ...(afterTimeStep !== null ? { afterTimeStep } : {}),
  });
  if (!result.valid) return null;
  // Kết quả TOTP có timeStep (kiểu khai báo gộp chung với HOTP nên phải kiểm tra).
  return 'timeStep' in result && typeof result.timeStep === 'number' ? result.timeStep : null;
}

/** Khoá mới + link otpauth:// + ảnh QR (data URL) để quét bằng app. */
export async function createOtpSetup(accountLabel: string) {
  const secret = generateSecret();
  const uri = generateURI({ issuer: OTP_ISSUER, label: accountLabel, secret });
  const qrDataUrl = await QRCode.toDataURL(uri, { margin: 1, width: 240, errorCorrectionLevel: 'M' });
  return { secret, uri, qrDataUrl };
}

// ───────────── Mã dự phòng (khi mất điện thoại) ─────────────

const RECOVERY_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // bỏ 0/O, 1/I cho dễ đọc

const hashRecoveryCode = (code: string) => createHash('sha256').update(code).digest('hex');

/** 8 mã dạng "ABCD-EF23": trả mã gốc (hiện cho người dùng một lần) và bản băm để lưu DB. */
export function generateRecoveryCodes(): { codes: string[]; hashes: string[] } {
  const codes = Array.from({ length: RECOVERY_CODE_COUNT }, () => {
    const raw = Array.from({ length: 8 }, () => RECOVERY_ALPHABET[randomInt(RECOVERY_ALPHABET.length)]).join('');
    return `${raw.slice(0, 4)}-${raw.slice(4)}`;
  });
  return { codes, hashes: codes.map((code) => hashRecoveryCode(code.replace('-', ''))) };
}

/** Mã dự phòng khớp → trả về danh sách băm còn lại (đã bỏ mã vừa dùng); không khớp → null. */
export function useRecoveryCode(stored: string[], input: string): string[] | null {
  const code = normalizeCode(input).toUpperCase();
  if (!/^[A-Z0-9]{8}$/.test(code)) return null;
  const hash = Buffer.from(hashRecoveryCode(code), 'hex');
  const index = stored.findIndex((item) => {
    const candidate = Buffer.from(item, 'hex');
    return candidate.length === hash.length && timingSafeEqual(candidate, hash);
  });
  return index === -1 ? null : stored.filter((_, i) => i !== index);
}
