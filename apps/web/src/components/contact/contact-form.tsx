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
      <div className="rounded-none border border-accent-200 bg-accent-50 p-6 text-accent-800">
        Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="name" className="text-sm font-medium text-foreground/85">
          Họ và tên
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="mt-1 w-full rounded-none border border-divider px-3 py-2 text-sm focus:border-accent-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="contact" className="text-sm font-medium text-foreground/85">
          Email hoặc số điện thoại
        </label>
        <input
          id="contact"
          name="contact"
          type="text"
          required
          className="mt-1 w-full rounded-none border border-divider px-3 py-2 text-sm focus:border-accent-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="message" className="text-sm font-medium text-foreground/85">
          Nội dung
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          className="mt-1 w-full rounded-none border border-divider px-3 py-2 text-sm focus:border-accent-500 focus:outline-none"
        />
      </div>

      <Button type="submit" className="w-fit">
        Gửi liên hệ
      </Button>
    </form>
  );
}
