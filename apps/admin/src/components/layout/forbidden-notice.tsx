"use client";

import { useSearchParams } from "next/navigation";

/** Thông báo khi bị đưa về đây vì mở trang chưa được cấp quyền (lib/auth.ts → ?forbidden=1). */
export function ForbiddenNotice() {
  const searchParams = useSearchParams();
  if (!searchParams.get("forbidden")) return null;
  return (
    <p role="alert" className="mb-4 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      Tài khoản của bạn chưa được cấp quyền vào trang vừa chọn. Liên hệ chủ cửa hàng nếu cần quyền này.
    </p>
  );
}
