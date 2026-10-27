"use client";

import type { ActionState } from "./api";

// ───────────── Hộp "Nhập mã OTP" dùng chung cho thao tác nhạy cảm ─────────────
// API trả 403 OTP_REQUIRED → action trả { otpRequired: true } → withOtpRetry mở hộp (OtpStepUpDialog trong layout),
// nhập đúng mã thì gửi lại đúng thao tác đó; bấm Huỷ thì trả lỗi để form hiện như bình thường.

type Request = { id: number; resolve: (verified: boolean) => void };

let nextId = 1;

let current: Request | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

export function subscribeOtpRequest(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const getOtpRequest = () => current;

/** Mở hộp nhập mã; true = đã nhập đúng (token mới đã lưu), false = huỷ. */
export function requestOtp(): Promise<boolean> {
  current?.resolve(false);
  return new Promise((resolve) => {
    current = {
      id: nextId++,
      resolve: (verified) => {
        current = null;
        notify();
        resolve(verified);
      },
    };
    notify();
  });
}

/**
 * Bọc một action (Server Action / hàm gọi nó): nếu kết quả cần OTP thì hỏi mã rồi chạy lại một lần với đúng tham số.
 * Dùng được cho useActionState (`withOtpRetry(saveSettingsAction)`) lẫn nút bấm (`withOtpRetry(() => action(id))`).
 */
export function withOtpRetry<Args extends unknown[], Result extends ActionState | undefined>(
  action: (...args: Args) => Promise<Result>,
): (...args: Args) => Promise<Result> {
  return async (...args: Args) => {
    const result = await action(...args);
    if (!result?.otpRequired) return result;
    const verified = await requestOtp();
    if (!verified) return { ...result, otpRequired: false, error: "Đã huỷ — thao tác này cần nhập mã OTP mới thực hiện được." } as Result;
    return action(...args);
  };
}
