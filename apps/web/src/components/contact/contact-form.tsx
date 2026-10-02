"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, HoneypotField, inputClass } from "@/components/ui/form";
import { sendInquiry } from "@/lib/api-client";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

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

  if (status === "done") {
    return <FormMessage tone="success">Cảm ơn bạn đã liên hệ! Cửa hàng sẽ phản hồi trong thời gian sớm nhất.</FormMessage>;
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex flex-col gap-4">
      <HoneypotField />
      <Field label="Họ và tên" htmlFor="name" required>
        <input id="name" name="name" type="text" required minLength={2} maxLength={100} autoComplete="name" className={inputClass} />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Số điện thoại" htmlFor="phone">
          <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" className={inputClass} />
        </Field>
        <Field label="Email" htmlFor="email">
          <input id="email" name="email" type="email" autoComplete="email" className={inputClass} />
        </Field>
      </div>
      <p className="-mt-2 text-xs text-foreground/55">Vui lòng để lại số điện thoại hoặc email để cửa hàng liên hệ lại.</p>
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
