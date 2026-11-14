"use client";

import { useEffect, useRef, useState } from "react";
import { ReceiptPrinter } from "@/components/receipt/receipt-printer";
import type { SavedReceipt } from "@/lib/saved-receipts";

/** Hộp xem bill (in lại có hiệu ứng): bấm nền tối, nút Đóng hoặc phím Esc để đóng. */
export function ReceiptDialog({ receipt, onClose }: { receipt: SavedReceipt; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  // Hiện dần một lần rồi gỡ class: lúc "In / Lưu PDF" trang bị ẩn rồi hiện lại, class còn gắn thì hiệu ứng chạy lại.
  const [shown, setShown] = useState(false);

  useEffect(() => {
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    // Khoá cuộn trang phía sau khi đang mở.
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Bill đơn ${receipt.orderNumber}`}
      className={`${shown ? "" : "receipt-dialog"} fixed inset-0 z-[60] overflow-y-auto bg-black/55 px-4 py-6 backdrop-blur-sm sm:py-10`}
      onAnimationEnd={(event) => {
        if (event.animationName === "dialog-fade") setShown(true);
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="mx-auto w-full max-w-lg rounded-3xl bg-background p-4 shadow-2xl sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="font-bold text-foreground">Bill đơn {receipt.orderNumber}</p>
            <p className="text-xs text-foreground/65">Lưu trên máy này</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-lg text-foreground/70 ring-1 ring-divider hover:text-accent-700"
          >
            ×
          </button>
        </div>
        <ReceiptPrinter receipt={receipt} />
      </div>
    </div>
  );
}
