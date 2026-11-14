"use client";

import { useEffect, useMemo, useState } from "react";
import { PrintInvoice } from "@/components/receipt/print-invoice";
import { ReceiptPaper } from "@/components/receipt/receipt-paper";
import { receiptContent } from "@/lib/receipt-content";
import { downloadReceiptPng } from "@/lib/receipt-image";
import type { SavedReceipt } from "@/lib/saved-receipts";

/** Thời gian "in" bill (khớp animation .receipt-feed trong globals.css). */
const PRINT_MS = 2800;

/**
 * Máy in bill: thân máy có khe giấy, bill trượt ra từng nấc như giấy in nhiệt kèm % đang in.
 * In xong hiện nút Tải ảnh bill / In – lưu PDF (hoá đơn A4 riêng, xem PrintInvoice) / In lại. Người dùng tắt hiệu ứng chuyển động thì hiện bill ngay.
 */
export function ReceiptPrinter({ receipt }: { receipt: SavedReceipt }) {
  const content = useMemo(() => receiptContent(receipt), [receipt]);
  const [run, setRun] = useState(0);
  const [progress, setProgress] = useState(0);
  /** Cú bật nhẹ sau khi in đã chạy xong — gỡ class để không bị chạy lại. */
  const [settled, setSettled] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const done = progress >= 100;

  useEffect(() => {
    // Tắt hiệu ứng chuyển động → in xong ngay ở khung hình đầu tiên.
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : PRINT_MS;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const value = duration === 0 ? 100 : Math.min(100, Math.round(((now - start) / duration) * 100));
      setProgress(value);
      if (value < 100) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [run]);

  async function download() {
    setDownloadError(null);
    try {
      await downloadReceiptPng(content, receipt.orderNumber);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : "Không tải được bill.");
    }
  }

  return (
    <div className="receipt-printer mx-auto w-full max-w-md">
      {/* Thân máy in + khe giấy */}
      <div className="relative z-10 h-14 rounded-2xl bg-card shadow-[0_10px_30px_-10px_rgba(0,0,0,0.35)] ring-1 ring-divider">
        <span className="absolute inset-x-6 bottom-3 h-1.5 rounded-full bg-[#2b2827]" aria-hidden />
        <span
          className={`absolute right-5 top-3 h-2 w-2 rounded-full ${done ? "bg-leaf" : "animate-pulse bg-accent-600"}`}
          aria-hidden
        />
      </div>

      {/* Giấy nhả ra từ khe: đầu bill (dải đỏ) ló ra trước sát khe, giấy dài dần xuống từng nấc như máy in nhiệt */}
      {/* Class hiệu ứng chỉ gắn trong lúc đang in / vừa in xong rồi gỡ: lúc "In / Lưu PDF" trình duyệt ẩn rồi hiện lại
          trang, nếu class còn gắn thì hiệu ứng CSS sẽ chạy lại từ đầu. */}
      <div key={run} className={`relative -mt-3 grid px-4 pb-6 sm:px-6 ${done ? "" : "receipt-unroll"}`}>
        <div className="min-h-0 overflow-hidden">
          <div
            className={`receipt-feed relative mx-auto bg-white shadow-xl ${done && !settled ? "is-done" : ""}`}
            aria-busy={!done}
            onAnimationEnd={(event) => {
              if (event.animationName === "receipt-settle") setSettled(true);
            }}
          >
            <ReceiptPaper content={content} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2" role="toolbar" aria-label="Thao tác với bill">
        {done ? (
          <>
            <button type="button" onClick={download} className="receipt-action bg-accent-600 text-white hover:bg-accent-700">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                <path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" />
              </svg>
              Tải ảnh bill
            </button>
            <button type="button" onClick={() => window.print()} className="receipt-action bg-card text-foreground ring-1 ring-divider hover:text-accent-700 hover:ring-accent-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                <path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M7 14h10v7H7z" />
              </svg>
              In / Lưu PDF
            </button>
            <button
              type="button"
              onClick={() => {
                setProgress(0);
                setSettled(false);
                setRun((value) => value + 1);
              }}
              className="receipt-action bg-card text-foreground ring-1 ring-divider hover:text-accent-700 hover:ring-accent-600"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                <path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4" />
              </svg>
              In lại
            </button>
          </>
        ) : (
          <span className="receipt-action bg-accent-100 text-accent-700" aria-live="polite">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
            Đang in bill {progress}%
          </span>
        )}
      </div>
      {downloadError ? <p className="mt-2 text-center text-sm font-semibold text-red-600">{downloadError}</p> : null}
      {/* Bản dùng cho "In / Lưu PDF": hoá đơn A4 chỉ có thông tin, ẩn trên màn hình. */}
      <PrintInvoice receipt={receipt} />
    </div>
  );
}
