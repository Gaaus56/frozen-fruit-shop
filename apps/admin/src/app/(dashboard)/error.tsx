"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { buttonClass, LinkButton } from "@/components/ui/button";
import { STATUS_ICONS, StatusPage } from "@/components/ui/status-page";

/** Lỗi khi tải trang trong khung quản trị (API không phản hồi, mất mạng…) — giữ menu, cho thử lại. */
export default function DashboardError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
    Sentry.captureException(error); // trang lỗi giữ lỗi lại nên phải tự gửi Sentry
  }, [error]);

  return (
    <StatusPage
      icon={STATUS_ICONS.error}
      title="Có lỗi khi tải trang"
      actions={
        <>
          <button type="button" onClick={() => retry()} className={buttonClass("primary")}>
            Thử lại
          </button>
          <LinkButton href="/" variant="secondary">
            Về trang quản trị
          </LinkButton>
        </>
      }
    >
      <p>Máy chủ chưa phản hồi hoặc mạng đang chập chờn. Đợi vài giây rồi bấm «Thử lại».</p>
      {error.digest ? <p className="mt-2 text-xs text-foreground/50">Mã lỗi (gửi cho kỹ thuật nếu lặp lại): {error.digest}</p> : null}
    </StatusPage>
  );
}
