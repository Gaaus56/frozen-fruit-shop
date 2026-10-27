import "server-only";
import { redirect } from "next/navigation";
import { OTP_REQUIRED } from "@frozen-fruit-shop/types";
import { getToken } from "./session";

export const API_URL = (process.env.API_URL || "http://localhost:4000").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    /** Mã lỗi máy đọc được, ví dụ "OTP_REQUIRED" (thao tác cần nhập lại mã OTP). */
    public readonly code?: string,
  ) {
    super(message);
  }
}

function errorMessage(body: unknown, status: number): string {
  if (body && typeof body === "object" && "message" in body) {
    const message = (body as { message: unknown }).message;
    return Array.isArray(message) ? String(message[0]) : String(message);
  }
  return `Thao tác thất bại (mã lỗi ${status}).`;
}

/**
 * Gọi API kèm token của người đang đăng nhập (chỉ dùng phía server: Server Component / Server Action).
 * Phiên hết hạn (401) → chuyển về trang đăng nhập; lỗi khác → ném ApiError có thông báo tiếng Việt.
 */
export async function api<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const token = await getToken();
  const { json, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (token) headers.set("authorization", `Bearer ${token}`);
  if (json !== undefined) headers.set("content-type", "application/json");

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers,
      body: json !== undefined ? JSON.stringify(json) : rest.body,
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Không kết nối được máy chủ API. Kiểm tra API đã chạy chưa.", 0);
  }

  if (res.status === 401) redirect("/logout?expired=1");
  if (res.status === 204) return undefined as T;

  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const code = body && typeof body === "object" && "code" in body ? String((body as { code: unknown }).code) : undefined;
    throw new ApiError(errorMessage(body, res.status), res.status, code);
  }
  return body as T;
}

export interface ActionState {
  error?: string;
  success?: string;
  /** API báo thao tác cần nhập lại mã OTP — trình duyệt hiện hộp nhập mã rồi tự gửi lại (lib/otp-step-up.ts). */
  otpRequired?: boolean;
}

/** Bọc thao tác ghi dữ liệu trong Server Action: trả lỗi để hiển thị trên form thay vì làm sập trang. */
export async function runAction(fn: () => Promise<unknown>, success?: string): Promise<ActionState> {
  try {
    await fn();
    return success ? { success } : {};
  } catch (error) {
    // redirect() của Next được thực thi bằng cách ném lỗi đặc biệt — phải ném tiếp.
    if (error instanceof Error && "digest" in error && String(error.digest).startsWith("NEXT_REDIRECT")) throw error;
    if (error instanceof ApiError && error.code === OTP_REQUIRED) return { error: error.message, otpRequired: true };
    return { error: error instanceof Error ? error.message : "Có lỗi xảy ra, vui lòng thử lại." };
  }
}
