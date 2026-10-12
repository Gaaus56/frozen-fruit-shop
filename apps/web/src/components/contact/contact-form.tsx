"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, HoneypotField, inputClass } from "@/components/ui/form";
import { sendInquiry } from "@/lib/api-client";
import { SuccessCheck } from "@/components/ui/check-icon";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "leaving">("idle");
  const [error, setError] = useState<string | null>(null);
  /** Đã gửi xong rồi bấm "Gửi tin nhắn khác": đặt con trỏ sẵn vào ô Họ và tên. */
  const [sendAnother, setSendAnother] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setStatus("sending");
    setError(null);
    try {
      await sendInquiry({
        type: "contact",
        name: String(data.get("name") ?? ""),
        phone: String(data.get("phone") ?? ""),
        email: String(data.get("email") ?? ""),
        message: String(data.get("message") ?? ""),
        website: String(data.get("website") ?? ""),
      });
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gửi không thành công, vui lòng thử lại.");
      setStatus("idle");
    }
  }

  function backToForm() {
    setSendAnother(true);
    setStatus("idle");
  }

  if (status === "done" || status === "leaving") {
    return (
      <div
        role="status"
        className={`contact-success ${status === "leaving" ? "contact-success-leave" : ""}`}
        onAnimationEnd={(event) => {
          // Chỉ khi chính khối này trượt ra xong (không tính animation của máy bay / dấu V bên trong).
          if (status === "leaving" && event.target === event.currentTarget) backToForm();
        }}
      >
        <SentIcon />
        <div className="contact-success-text flex flex-col items-center gap-4">
          <p className="max-w-sm text-foreground/80">
            <strong className="block text-lg text-foreground">Đã gửi thành công!</strong>
            Cảm ơn bạn đã liên hệ. Cửa hàng sẽ phản hồi trong thời gian sớm nhất.
          </p>
          <Button
            type="button"
            variant="secondary"
            disabled={status === "leaving"}
            onClick={() => {
              // Tắt hiệu ứng chuyển động: không có animationend → quay lại form ngay.
              if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) backToForm();
              else setStatus("leaving");
            }}
          >
            ← Gửi tin nhắn khác
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`relative flex flex-col gap-4 ${sendAnother ? "contact-form-enter" : ""}`}>
      <HoneypotField />
      <Field label="Họ và tên" htmlFor="name" required>
        <input id="name" name="name" type="text" required minLength={2} maxLength={100} autoComplete="name" autoFocus={sendAnother} className={inputClass} />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Số điện thoại" htmlFor="phone">
          <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" className={inputClass} />
        </Field>
        <Field label="Email" htmlFor="email">
          <input id="email" name="email" type="email" autoComplete="email" className={inputClass} />
        </Field>
      </div>
      <p className="-mt-2 text-xs text-foreground/65">Vui lòng để lại số điện thoại hoặc email để cửa hàng liên hệ lại.</p>
      <Field label="Nội dung" htmlFor="message" required>
        <textarea id="message" name="message" rows={4} required maxLength={3000} className={inputClass} />
      </Field>

      {error ? <FormMessage tone="error">{error}</FormMessage> : null}

      <Button type="submit" className="w-fit" disabled={status === "sending"}>
        {status === "sending" ? "Đang gửi..." : "Gửi liên hệ"}
      </Button>
    </form>
  );
}

/** Máy bay giấy bay vào rồi thu lại, nhường chỗ cho vòng tròn + dấu V tự vẽ (SuccessCheck). */
function SentIcon() {
  return (
    <div className="contact-sent-icon" aria-hidden="true">
      <svg className="contact-plane" viewBox="0 0 64 64" fill="none" strokeLinejoin="round" strokeLinecap="round">
        <path d="M6 30 58 8 46 56 32 38Z" fill="#fff" stroke="currentColor" strokeWidth="3" />
        <path d="M58 8 32 38v14l6-9" stroke="currentColor" strokeWidth="3" />
      </svg>
      <SuccessCheck delayMs={820} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
