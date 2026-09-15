"use client";

import { useState, type FormEvent } from "react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";

export default function OrderLookupPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO: gọi API tra cứu đơn hàng thật khi tích hợp backend.
    setIsSubmitted(true);
  }

  return (
    <Container className="py-12">
      <SectionHeading
        eyebrow="Hỗ trợ"
        title="Tra cứu đơn hàng"
        description="Nhập mã đơn hàng và số điện thoại đã đặt để kiểm tra trạng thái đơn."
      />

      <form onSubmit={handleSubmit} className="mt-8 flex max-w-md flex-col gap-4">
        <div>
          <label htmlFor="orderCode" className="text-sm font-medium text-slate-700">
            Mã đơn hàng
          </label>
          <input
            id="orderCode"
            name="orderCode"
            type="text"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-mango-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="phone" className="text-sm font-medium text-slate-700">
            Số điện thoại
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-mango-500 focus:outline-none"
          />
        </div>
        <Button type="submit" className="w-fit">
          Tra cứu
        </Button>
      </form>

      {isSubmitted ? (
        <p className="mt-6 max-w-md text-sm text-slate-600">
          Tính năng tra cứu đơn hàng đang được hoàn thiện cùng với hệ thống xử lý đơn hàng. Vui lòng
          liên hệ hotline để được hỗ trợ trong lúc chờ.
        </p>
      ) : null}
    </Container>
  );
}
