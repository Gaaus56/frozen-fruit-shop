"use client";

import { useActionState, useEffect, useRef } from "react";
import { SubmitButton } from "@/components/ui/button";
import { Field, FormAlert, inputClass } from "@/components/ui/form";
import { changePasswordAction } from "./actions";

export function ChangePasswordForm({ minLength }: { minLength: number }) {
  const [state, formAction] = useActionState(changePasswordAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <Field label="Mật khẩu hiện tại" htmlFor="currentPassword" required>
        <input id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" className={inputClass} />
      </Field>
      <Field label="Mật khẩu mới" htmlFor="newPassword" required hint={`Ít nhất ${minLength} ký tự.`}>
        <input id="newPassword" name="newPassword" type="password" required minLength={minLength} autoComplete="new-password" className={inputClass} />
      </Field>
      <Field label="Nhập lại mật khẩu mới" htmlFor="confirmPassword" required>
        <input id="confirmPassword" name="confirmPassword" type="password" required minLength={minLength} autoComplete="new-password" className={inputClass} />
      </Field>
      <FormAlert state={state} />
      <SubmitButton className="w-fit">Đổi mật khẩu</SubmitButton>
    </form>
  );
}
