"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { SubmitButton, buttonClass } from "@/components/ui/button";
import { Field, FormAlert, inputClass } from "@/components/ui/form";
import { createStaffAction, resetStaffPasswordAction, setStaffActiveAction } from "./actions";

export const PASSWORD_MIN_LENGTH = 8;

export function CreateStaffForm() {
  const [state, formAction] = useActionState(createStaffAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <Field label="Họ tên" htmlFor="staff-name" required>
        <input id="staff-name" name="name" required maxLength={100} className={inputClass} />
      </Field>
      <Field label="Email đăng nhập" htmlFor="staff-email" required>
        <input id="staff-email" name="email" type="email" required autoComplete="off" className={inputClass} />
      </Field>
      <Field label="Mật khẩu" htmlFor="staff-password" required hint={`Ít nhất ${PASSWORD_MIN_LENGTH} ký tự.`}>
        <input id="staff-password" name="password" type="text" required minLength={PASSWORD_MIN_LENGTH} autoComplete="new-password" className={inputClass} />
      </Field>
      <FormAlert state={state} />
      <SubmitButton pendingText="Đang tạo...">Tạo tài khoản</SubmitButton>
    </form>
  );
}

export function ToggleActiveButton({ id, isActive }: { id: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await setStaffActiveAction(id, !isActive);
            setError(result.error ?? null);
          })
        }
        className={buttonClass("secondary", "sm")}
      >
        {isActive ? "Khoá" : "Mở khoá"}
      </button>
      {error ? <span className="text-xs font-semibold text-accent-700">{error}</span> : null}
    </span>
  );
}

export function ResetPasswordForm({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(resetStaffPasswordAction.bind(null, id), undefined);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={buttonClass("ghost", "sm")}>
        Đặt lại mật khẩu
      </button>
    );
  }

  return (
    <form action={formAction} className="flex w-full max-w-xs flex-col items-end gap-2">
      <div className="flex w-full gap-2">
        <input
          name="password"
          type="text"
          required
          minLength={PASSWORD_MIN_LENGTH}
          placeholder="Mật khẩu mới"
          autoComplete="new-password"
          aria-label="Mật khẩu mới"
          className={`${inputClass} mt-0 py-1.5`}
        />
        <SubmitButton size="sm">Lưu</SubmitButton>
        <button type="button" onClick={() => setOpen(false)} className={buttonClass("ghost", "sm")}>
          Đóng
        </button>
      </div>
      <FormAlert state={state} />
    </form>
  );
}
