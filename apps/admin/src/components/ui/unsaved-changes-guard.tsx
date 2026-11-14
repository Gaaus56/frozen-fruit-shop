"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { buttonClass } from "./button";

/** Nội dung form thành chuỗi để so "đã sửa gì chưa" (file chọn từ máy chỉ lấy tên + dung lượng). */
function snapshot(form: HTMLFormElement): string {
  return JSON.stringify(
    Array.from(new FormData(form).entries()).map(([key, value]) =>
      typeof value === "string" ? [key, value] : [key, `file:${value.name}:${value.size}`],
    ),
  );
}

/**
 * Đặt BÊN TRONG `<form>` của trang sửa: rời trang khi còn thay đổi chưa lưu thì hỏi Lưu / Rời trang / Ở lại.
 * - Bấm link trong admin (menu, "Huỷ", logo…) → hộp hỏi của trang quản trị.
 * - Tải lại / đóng tab / gõ địa chỉ khác → hộp hỏi mặc định của trình duyệt (trình duyệt không cho đổi chữ).
 * Mốc so sánh lấy ngay trước thao tác đầu tiên trong form (trình soạn thảo, ô ảnh… đã nạp xong giá trị ban đầu),
 * và lấy lại sau mỗi lần lưu thành công (`state.success` — form lưu xong ở lại trang).
 * Bấm "Lưu" trong hộp hỏi: gửi form; lưu xong thì đi tiếp tới trang định mở
 * (form lưu xong chuyển về danh sách → đi tiếp khi form gỡ khỏi trang; form ở lại trang → đi tiếp khi có `success`).
 */
export function UnsavedChangesGuard({ state }: { state: { error?: string; success?: string } | undefined }) {
  const router = useRouter();
  const markerRef = useRef<HTMLSpanElement>(null);
  const baseline = useRef<string | null>(null);
  /** Trang định mở khi bấm "Lưu" trong hộp hỏi — đi tiếp sau khi lưu xong. */
  const pendingHref = useRef<string | null>(null);
  const [askHref, setAskHref] = useState<string | null>(null);

  const formOf = () => markerRef.current?.closest("form") ?? null;

  useEffect(() => {
    const form = formOf();
    if (!form) return;

    // Mốc: ngay trước lần đầu khách chạm vào form — bấm, gõ, focus vào ô (kể cả trình duyệt tự điền), dán, kéo thả;
    // các sự kiện này (capture) chạy trước khi giá trị đổi.
    const takeBaseline = () => {
      if (baseline.current === null) baseline.current = snapshot(form);
    };
    form.addEventListener("pointerdown", takeBaseline, true);
    form.addEventListener("keydown", takeBaseline, true);
    form.addEventListener("dragenter", takeBaseline, true);
    form.addEventListener("paste", takeBaseline, true);
    form.addEventListener("focusin", takeBaseline, true);

    const isDirty = () => baseline.current !== null && snapshot(form) !== baseline.current;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty()) return;
      event.preventDefault();
      event.returnValue = "";
    };

    // Chặn link trong admin trước khi Next.js chuyển trang (capture ở document chạy trước React).
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      if (!isDirty()) return;
      event.preventDefault();
      event.stopPropagation();
      setAskHref(url.pathname + url.search + url.hash);
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      form.removeEventListener("pointerdown", takeBaseline, true);
      form.removeEventListener("keydown", takeBaseline, true);
      form.removeEventListener("dragenter", takeBaseline, true);
      form.removeEventListener("paste", takeBaseline, true);
      form.removeEventListener("focusin", takeBaseline, true);
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
      // Lưu từ hộp hỏi xong, form chuyển về danh sách (form bị gỡ) → đi tiếp tới trang khách định mở.
      const href = pendingHref.current;
      pendingHref.current = null;
      if (href) window.setTimeout(() => router.push(href), 0);
    };
  }, [router]);

  // Lưu xong mà vẫn ở trang này: lấy lại mốc; nếu đang lưu từ hộp hỏi thì đi tiếp. Lỗi: ở lại để khách xem lỗi.
  useEffect(() => {
    const form = formOf();
    if (state?.success && form) {
      baseline.current = snapshot(form);
      const href = pendingHref.current;
      pendingHref.current = null;
      if (href) router.push(href);
    } else if (state?.error) {
      pendingHref.current = null;
    }
  }, [state, router]);

  useEffect(() => {
    if (!askHref) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAskHref(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [askHref]);

  function save() {
    const form = formOf();
    const href = askHref;
    setAskHref(null);
    if (!form || !href) return;
    // Ô bắt buộc còn trống: trình duyệt tự báo, không gửi → ở lại trang.
    if (!form.reportValidity()) return;
    pendingHref.current = href;
    form.requestSubmit();
  }

  function leave() {
    const href = askHref;
    setAskHref(null);
    if (!href) return;
    baseline.current = null; // không hỏi lại (kể cả beforeunload)
    router.push(href);
  }

  return (
    <>
      <span ref={markerRef} hidden />
      {askHref
        ? createPortal(
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 p-4" onClick={() => setAskHref(null)}>
              <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="unsaved-title"
                aria-describedby="unsaved-desc"
                className="unsaved-dialog w-full max-w-md border border-divider bg-surface p-6 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <h2 id="unsaved-title" className="text-lg">
                  Lưu thay đổi trước khi rời trang?
                </h2>
                <p id="unsaved-desc" className="mt-2 text-sm text-foreground/70">
                  Bạn đã sửa nội dung trên trang này nhưng chưa bấm Lưu. Rời trang bây giờ sẽ mất các thay đổi đó.
                </p>
                <div className="mt-5 flex flex-wrap justify-end gap-2">
                  <button type="button" className={buttonClass("ghost")} onClick={() => setAskHref(null)}>
                    Ở lại
                  </button>
                  <button type="button" className={buttonClass("secondary")} onClick={leave}>
                    Rời trang, không lưu
                  </button>
                  <button type="button" autoFocus className={buttonClass("primary")} onClick={save}>
                    Lưu thay đổi
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
