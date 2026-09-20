"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";

export function WholesaleForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO: nối với API/CRM tiếp nhận yêu cầu báo giá sỉ khi có backend.
    setIsSubmitted(true);
  }

  if (isSubmitted) {
    return (
      <div className="rounded-none border border-accent-200 bg-accent-50 p-6 text-accent-800">
        Cảm ơn bạn đã gửi yêu cầu! Đội ngũ kinh doanh sẽ liên hệ trong vòng 24 giờ.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="company" className="text-sm font-medium text-foreground/85">
            Tên công ty / cửa hàng
          </label>
          <input
            id="company"
            name="company"
            type="text"
            required
            className="mt-1 w-full rounded-none border border-divider px-3 py-2 text-sm focus:border-accent-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="phone" className="text-sm font-medium text-foreground/85">
            Số điện thoại
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            className="mt-1 w-full rounded-none border border-divider px-3 py-2 text-sm focus:border-accent-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="quantity" className="text-sm font-medium text-foreground/85">
          Số lượng dự kiến / tháng
        </label>
        <input
          id="quantity"
          name="quantity"
          type="text"
          placeholder="Ví dụ: 50kg/tháng"
          className="mt-1 w-full rounded-none border border-divider px-3 py-2 text-sm focus:border-accent-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="note" className="text-sm font-medium text-foreground/85">
          Ghi chú
        </label>
        <textarea
          id="note"
          name="note"
          rows={4}
          className="mt-1 w-full rounded-none border border-divider px-3 py-2 text-sm focus:border-accent-500 focus:outline-none"
        />
      </div>

      <Button type="submit" className="w-fit">
        Gửi yêu cầu báo giá
      </Button>
    </form>
  );
}
