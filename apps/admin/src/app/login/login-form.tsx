"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/ui/button";
import { Field, FormAlert, inputClass } from "@/components/ui/form";
import { loginAction } from "./actions";

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Email" htmlFor="email">
        <input id="email" name="email" type="email" required autoComplete="username" autoFocus className={inputClass} />
      </Field>
      <Field label="Mật khẩu" htmlFor="password">
        <input id="password" name="password" type="password" required autoComplete="current-password" className={inputClass} />
      </Field>
      <FormAlert state={state} />
      <SubmitButton pendingText="Đang đăng nhập..." className="mt-2 w-full py-2.5">
        Đăng nhập
      </SubmitButton>
    </form>
  );
}
