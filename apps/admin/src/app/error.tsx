"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { buttonClass, LinkButton } from "@/components/ui/button";
import { STATUS_ICONS, StatusPage } from "@/components/ui/status-page";

/** Lỗi ở trang ngoài khung quản trị (đăng nhập…). */
export default function RootError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
    Sentry.captureException(error); // trang lỗi giữ lỗi lại nên phải tự gửi Sentry
  }, [error]);

  return (
    <main className="flex min-h-svh items-center justify-center bg-background">
      <StatusPage
        icon={STATUS_ICONS.error}
        title="Có lỗi xảy ra"
        actions={
          <>
            <button type="button" onClick={() => retry()} className={buttonClass("primary")}>
              Thử lại
            </button>
            <LinkButton href="/login" variant="secondary">
              Về trang đăng nhập
            </LinkButton>
          </>
        }
      >
        <p>Máy chủ chưa phản hồi hoặc mạng đang chập chờn. Đợi vài giây rồi thử lại.</p>
        {error.digest ? <p className="mt-2 text-xs text-foreground/50">Mã lỗi: {error.digest}</p> : null}
      </StatusPage>
    </main>
  );
}
