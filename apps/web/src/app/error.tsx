"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui/container";
import { Button, LinkButton } from "@/components/ui/button";
import { EMPTY_ICONS, EmptyStateIcon } from "@/components/ui/line-icon";

/** Lỗi khi tải một trang (máy chủ chưa phản hồi, mất mạng…) — vẫn giữ header / footer, cho khách thử lại. */
export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="flex flex-col items-center gap-4 py-20 text-center">
      <EmptyStateIcon d={EMPTY_ICONS.error} />
      <h1 className="text-2xl uppercase text-foreground">Có lỗi khi tải trang</h1>
      <p className="max-w-md text-foreground/70">
        Hệ thống đang bận hoặc mạng chập chờn. Bạn vui lòng thử lại sau vài giây — hoặc gọi / nhắn Zalo cho cửa hàng bằng nút liên hệ ở góc màn hình.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={() => retry()}>Thử lại</Button>
        <LinkButton href="/" variant="secondary">
          Về trang chủ
        </LinkButton>
      </div>
      {error.digest ? <p className="text-xs text-foreground/45">Mã lỗi: {error.digest}</p> : null}
    </Container>
  );
}
