"use server";

import type { LoginResponse, OtpRecoveryCodes, OtpSetup } from "@frozen-fruit-shop/types";
import { api, runAction, type ActionState } from "./api";
import { setToken } from "./session";

/** Nhập lại mã OTP cho thao tác nhạy cảm → lưu token mới (dùng được OTP_STEP_UP_MINUTES phút). */
export async function otpStepUpAction(code: string): Promise<ActionState> {
  return runAction(async () => {
    const session = await api<LoginResponse>("/auth/otp/step-up", { method: "POST", json: { code } });
    await setToken(session.accessToken, session.expiresAt);
  });
}

export type OtpSetupState = ActionState & { setup?: OtpSetup };

/** Bật OTP bước 1: nhập lại mật khẩu → mã QR. */
export async function otpSetupAction(_prev: OtpSetupState | undefined, formData: FormData): Promise<OtpSetupState> {
  try {
    const setup = await api<OtpSetup>("/auth/otp/setup", { method: "POST", json: { password: String(formData.get("password") ?? "") } });
    return { setup };
  } catch (error) {
    return rethrowRedirect(error);
  }
}

export type RecoveryCodesState = ActionState & { recoveryCodes?: string[] };

/** Bật OTP bước 2: nhập mã trong app → bật, nhận mã dự phòng, lưu token mới (đã xác thực OTP). */
export async function otpEnableAction(_prev: RecoveryCodesState | undefined, formData: FormData): Promise<RecoveryCodesState> {
  try {
    const result = await api<LoginResponse & OtpRecoveryCodes>("/auth/otp/enable", { method: "POST", json: { code: String(formData.get("code") ?? "") } });
    await setToken(result.accessToken, result.expiresAt);
    return { recoveryCodes: result.recoveryCodes };
  } catch (error) {
    return rethrowRedirect(error);
  }
}

export async function otpDisableAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  return runAction(
    () =>
      api("/auth/otp/disable", {
        method: "POST",
        json: { password: String(formData.get("password") ?? ""), code: String(formData.get("code") ?? "") },
      }),
    "Đã tắt xác thực 2 lớp.",
  );
}

export async function otpRecoveryCodesAction(_prev: RecoveryCodesState | undefined, formData: FormData): Promise<RecoveryCodesState> {
  try {
    const result = await api<OtpRecoveryCodes>("/auth/otp/recovery-codes", { method: "POST", json: { code: String(formData.get("code") ?? "") } });
    return { recoveryCodes: result.recoveryCodes };
  } catch (error) {
    return rethrowRedirect(error);
  }
}

/** Lỗi thường → hiện trên form; redirect() của Next (phiên hết hạn) phải ném tiếp. */
function rethrowRedirect(error: unknown): ActionState {
  if (error instanceof Error && "digest" in error && String(error.digest).startsWith("NEXT_REDIRECT")) throw error;
  return { error: error instanceof Error ? error.message : "Có lỗi xảy ra, vui lòng thử lại." };
}
