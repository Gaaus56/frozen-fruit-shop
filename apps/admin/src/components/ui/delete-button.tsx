"use client";

import { useState, useTransition } from "react";
import { requestOtp } from "@/lib/otp-step-up";
import { buttonClass } from "./button";

/** Nút xoá có hộp xác nhận; hiển thị lỗi từ API (ví dụ danh mục còn sản phẩm) ngay cạnh nút. */
export function DeleteButton({
  action,
  itemLabel,
  confirmText,
  label = "Xoá",
}: {
  action: () => Promise<{ error?: string; otpRequired?: boolean } | void>;
  itemLabel: string;
  confirmText?: string;
  label?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!window.confirm(confirmText ?? `Xoá "${itemLabel}"? Thao tác này không thể hoàn tác.`)) return;
    setError(null);
    startTransition(async () => {
      let result = await action();
      // Xoá cần nhập lại mã OTP (vd. xoá tài khoản nhân viên): hỏi mã rồi xoá lại.
      if (result && result.otpRequired) result = (await requestOtp()) ? await action() : { error: "Đã huỷ — cần nhập mã OTP để xoá." };
      if (result && result.error) setError(result.error);
    });
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button type="button" onClick={handleClick} disabled={isPending} className={buttonClass("danger", "sm")}>
        {isPending ? "Đang xoá..." : label}
      </button>
      {error ? <span className="max-w-64 text-right text-xs font-semibold text-accent-700">{error}</span> : null}
    </span>
  );
}
