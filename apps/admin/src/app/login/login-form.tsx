"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { SubmitButton } from "@/components/ui/button";
import { Field, FormAlert, inputClass } from "@/components/ui/form";
import { loginAction, loginOtpAction, type LoginState } from "./actions";

/** Thời gian hiệu ứng rời màn hình đăng nhập (khớp .login-root[data-leaving] trong globals.css). */
const EXIT_MS = 650;

export function LoginForm() {
  const router = useRouter();
  // Một state cho cả hai bước: form nhập mã có ô ẩn otpToken → gọi bước 2, không có → bước 1 (mật khẩu).
  const [state, formAction] = useActionState(
    (prev: LoginState, formData: FormData) => (formData.has("otpToken") ? loginOtpAction(prev, formData) : loginAction(prev, formData)),
    undefined,
  );
  // Bước nhập mã OTP: đúng mật khẩu và tài khoản đã bật OTP; sai mã vẫn ở lại, hết hạn thì về bước mật khẩu.
  const otpToken = state?.otpToken;
  const redirectTo = state?.redirectTo;

  // Vừa đăng xuất (?bye=1): bỏ tham số khỏi thanh địa chỉ để tải lại trang không chạy lại hiệu ứng.
  useEffect(() => {
    if (window.location.search.includes("bye=")) window.history.replaceState(null, "", "/login");
    document.documentElement.removeAttribute("data-leave");
  }, []);

  useEffect(() => {
    if (!redirectTo) return;
    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      router.replace(redirectTo);
      return;
    }
    // Banner trượt mờ sang trái, form trượt mờ sang phải; rồi bật hiệu ứng "vào trang" (EnterAnimation) và chuyển trang.
    document.querySelector<HTMLElement>("[data-login-root]")?.setAttribute("data-leaving", "");
    const timer = window.setTimeout(() => {
      root.setAttribute("data-enter", "");
      router.replace(redirectTo);
    }, EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [redirectTo, router]);

  if (otpToken) return <OtpStep otpToken={otpToken} state={state} action={formAction} done={Boolean(redirectTo)} />;

  // Phiên nhập mã hết hạn / bị khoá tạm cũng quay về đây kèm thông báo.
  const error = state?.error;
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Email" htmlFor="email">
        <input id="email" name="email" type="email" required autoComplete="username" autoFocus className={inputClass} />
      </Field>
      <Field label="Mật khẩu" htmlFor="password">
        <input id="password" name="password" type="password" required autoComplete="current-password" className={inputClass} />
      </Field>
      <FormAlert state={error ? { error } : undefined} />
      <SubmitButton pendingText="Đang đăng nhập..." className="mt-2 w-full py-2.5">
        {redirectTo ? "Đang vào trang quản trị…" : "Đăng nhập"}
      </SubmitButton>
    </form>
  );
}

function OtpStep({
  otpToken,
  state,
  action,
  done,
}: {
  otpToken: string;
  state: LoginState;
  action: (formData: FormData) => void;
  done: boolean;
}) {
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="otpToken" value={otpToken} />
      <div className="border-l-4 border-leaf-600 bg-leaf-50 px-4 py-3 text-sm text-leaf-700">
        <strong className="block">Xác thực 2 lớp</strong>
        Mở app <b>Google Authenticator</b> (hoặc Microsoft Authenticator) trên điện thoại, nhập mã 6 số của
        «Trái Cây 28 — Quản trị».
      </div>
      <Field label="Mã OTP" htmlFor="code">
        {/* key: sai mã thì ô được làm trống để gõ mã mới. */}
        <input
          key={state?.error ?? "otp"}
          id="code"
          name="code"
          required
          autoFocus
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={9}
          placeholder="123 456"
          className={`${inputClass} text-center text-2xl font-bold tracking-[0.3em]`}
        />
      </Field>
      <FormAlert state={state?.error ? state : undefined} />
      <SubmitButton pendingText="Đang kiểm tra..." className="w-full py-2.5">
        {done ? "Đang vào trang quản trị…" : "Xác nhận"}
      </SubmitButton>
      <p className="text-center text-xs text-foreground/55">
        Mất điện thoại? Nhập một <b>mã dự phòng</b> (dạng ABCD-EF23) đã lưu lúc bật OTP. Hết mã dự phòng: liên hệ kỹ thuật để tắt OTP.
      </p>
      <a href="/login" className="text-center text-sm font-semibold text-foreground/60 hover:text-accent-700">
        ← Đăng nhập bằng tài khoản khác
      </a>
    </form>
  );
}
