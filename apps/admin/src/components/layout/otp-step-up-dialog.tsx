"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { createPortal } from "react-dom";
import { OTP_STEP_UP_MINUTES } from "@frozen-fruit-shop/types";
import { buttonClass } from "@/components/ui/button";
import { inputClass } from "@/components/ui/form";
import { otpStepUpAction } from "@/lib/otp-actions";
import { getOtpRequest, subscribeOtpRequest } from "@/lib/otp-step-up";

/** Hộp nhập mã OTP khi thao tác nhạy cảm cần xác thực lại (mở qua requestOtp / withOtpRetry). Gắn một lần trong layout. */
export function OtpStepUpDialog() {
  const request = useSyncExternalStore(subscribeOtpRequest, getOtpRequest, () => null);
  if (!request) return null;
  // key: mỗi lần hỏi mã là một hộp mới (ô trống, không còn lỗi cũ).
  return createPortal(<Dialog key={request.id} onDone={request.resolve} />, document.body);
}

function Dialog({ onDone }: { onDone: (verified: boolean) => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const result = await otpStepUpAction(code);
      if (result.error) {
        setError(result.error);
        setCode("");
        return;
      }
      onDone(true);
    });
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/50 p-4" onClick={() => onDone(false)}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="otp-step-up-title"
        className="unsaved-dialog w-full max-w-sm border border-divider bg-surface p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === "Escape") onDone(false);
        }}
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <h2 id="otp-step-up-title" className="text-lg">
          Nhập mã OTP
        </h2>
        <p className="mt-2 text-sm text-foreground/70">
          Thao tác quan trọng — mở app xác thực trên điện thoại và nhập mã 6 số. Sau đó {OTP_STEP_UP_MINUTES} phút không phải nhập lại.
        </p>
        <input
          autoFocus
          value={code}
          onChange={(event) => setCode(event.target.value)}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={9}
          placeholder="123 456"
          aria-label="Mã OTP"
          className={`${inputClass} mt-4 text-center text-2xl font-bold tracking-[0.3em]`}
        />
        <p className="mt-1.5 text-xs text-foreground/55">Mất điện thoại? Nhập một mã dự phòng (dạng ABCD-EF23).</p>
        {error ? (
          <p role="alert" className="mt-3 border border-accent-200 bg-accent-50 px-3 py-2 text-sm font-semibold text-accent-700">
            {error}
          </p>
        ) : null}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className={buttonClass("ghost")} onClick={() => onDone(false)}>
            Huỷ
          </button>
          <button type="submit" disabled={isPending || code.trim().length < 6} className={buttonClass("primary")}>
            {isPending ? "Đang kiểm tra…" : "Xác nhận"}
          </button>
        </div>
      </form>
    </div>
  );
}
