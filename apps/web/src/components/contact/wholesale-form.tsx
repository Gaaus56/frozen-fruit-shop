"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, HoneypotField, inputClass } from "@/components/ui/form";
import { sendInquiry } from "@/lib/api-client";

export function WholesaleForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setStatus("sending");
    setError(null);
    try {
      await sendInquiry({
        type: "wholesale",
        name: String(data.get("name") ?? ""),
        company: String(data.get("company") ?? ""),
        phone: String(data.get("phone") ?? ""),
        email: String(data.get("email") ?? ""),
        quantity: String(data.get("quantity") ?? ""),
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
    return <FormMessage tone="success">Cảm ơn bạn đã gửi yêu cầu! Cửa hàng sẽ liên hệ báo giá trong thời gian sớm nhất.</FormMessage>;
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex flex-col gap-4">
      <HoneypotField />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Người liên hệ" htmlFor="name" required>
          <input id="name" name="name" type="text" required minLength={2} maxLength={100} autoComplete="name" className={inputClass} />
        </Field>
        <Field label="Tên quán / cửa hàng / công ty" htmlFor="company">
          <input id="company" name="company" type="text" maxLength={150} autoComplete="organization" className={inputClass} />
        </Field>
        <Field label="Số điện thoại" htmlFor="phone" required>
          <input id="phone" name="phone" type="tel" inputMode="tel" required autoComplete="tel" className={inputClass} />
        </Field>
        <Field label="Email" htmlFor="email">
          <input id="email" name="email" type="email" autoComplete="email" className={inputClass} />
        </Field>
      </div>
      <Field label="Sản phẩm & số lượng dự kiến" htmlFor="quantity">
        <input id="quantity" name="quantity" type="text" maxLength={100} placeholder="Ví dụ: xoài 30kg/tháng, dâu 20kg/tháng" className={inputClass} />
      </Field>
      <Field label="Ghi chú" htmlFor="message">
        <textarea id="message" name="message" rows={4} maxLength={3000} className={inputClass} />
      </Field>

      {error ? <FormMessage tone="error">{error}</FormMessage> : null}

      <Button type="submit" className="w-fit" disabled={status === "sending"}>
        {status === "sending" ? "Đang gửi..." : "Gửi yêu cầu báo giá"}
      </Button>
    </form>
  );
}
