"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO: nối với API gửi liên hệ thật (email/CRM) khi có backend.
    setIsSubmitted(true);
  }

  if (isSubmitted) {
    return (
      <div className="rounded-2xl border border-mango-200 bg-mango-50 p-6 text-mango-800">
        Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="name" className="text-sm font-medium text-slate-700">
          Họ và tên
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-mango-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="contact" className="text-sm font-medium text-slate-700">
          Email hoặc số điện thoại
        </label>
        <input
          id="contact"
          name="contact"
          type="text"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-mango-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="message" className="text-sm font-medium text-slate-700">
          Nội dung
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-mango-500 focus:outline-none"
        />
      </div>

      <Button type="submit" className="w-fit">
        Gửi liên hệ
      </Button>
    </form>
  );
}
