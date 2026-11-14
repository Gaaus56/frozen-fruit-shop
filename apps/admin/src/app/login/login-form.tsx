"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { SubmitButton } from "@/components/ui/button";
import { Field, FormAlert, inputClass } from "@/components/ui/form";
import { loginAction } from "./actions";

/** Thời gian hiệu ứng rời màn hình đăng nhập (khớp .login-root[data-leaving] trong globals.css). */
const EXIT_MS = 650;

export function LoginForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(loginAction, undefined);

  // Vừa đăng xuất (?bye=1): bỏ tham số khỏi thanh địa chỉ để tải lại trang không chạy lại hiệu ứng.
  useEffect(() => {
    if (window.location.search.includes("bye=")) window.history.replaceState(null, "", "/login");
    document.documentElement.removeAttribute("data-leave");
  }, []);

  useEffect(() => {
    const target = state?.redirectTo;
    if (!target) return;
    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      router.replace(target);
      return;
    }
    // Banner trượt mờ sang trái, form trượt mờ sang phải; rồi bật hiệu ứng "vào trang" (EnterAnimation) và chuyển trang.
    document.querySelector<HTMLElement>("[data-login-root]")?.setAttribute("data-leaving", "");
    const timer = window.setTimeout(() => {
      root.setAttribute("data-enter", "");
      router.replace(target);
    }, EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [state, router]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Email" htmlFor="email">
        <input id="email" name="email" type="email" required autoComplete="username" autoFocus className={inputClass} />
      </Field>
      <Field label="Mật khẩu" htmlFor="password">
        <input id="password" name="password" type="password" required autoComplete="current-password" className={inputClass} />
      </Field>
      <FormAlert state={state?.error ? state : undefined} />
      <SubmitButton pendingText="Đang đăng nhập..." className="mt-2 w-full py-2.5">
        {state?.redirectTo ? "Đang vào trang quản trị…" : "Đăng nhập"}
      </SubmitButton>
    </form>
  );
}
