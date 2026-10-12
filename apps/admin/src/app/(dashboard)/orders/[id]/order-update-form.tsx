"use client";

import { useActionState } from "react";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  type OrderDetail,
  type OrderStatus,
  type PaymentStatus,
} from "@frozen-fruit-shop/types";
import { SubmitButton, buttonClass } from "@/components/ui/button";
import { Field, FormAlert, inputClass } from "@/components/ui/form";
import { WithHelp } from "@/components/ui/help";
import { updateOrderAction } from "../actions";

/** Nút chuyển nhanh sang bước kế tiếp; "Huỷ đơn" luôn nằm riêng. */
const PRIMARY_ACTION: Partial<Record<OrderStatus, string>> = {
  pending: "Xác nhận đơn",
  confirmed: "Bắt đầu đóng gói",
  packing: "Giao cho vận chuyển",
  shipping: "Đã giao thành công",
};

/** Phải khớp quy tắc chuyển trạng thái của API (apps/api/src/orders/orders.service.ts). */
const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["packing", "shipping", "cancelled"],
  packing: ["shipping", "cancelled"],
  shipping: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export function OrderUpdateForm({ order }: { order: OrderDetail }) {
  const [state, formAction] = useActionState(updateOrderAction.bind(null, order.id), undefined);
  const nextStatuses = NEXT_STATUSES[order.status];
  const isFinished = nextStatuses.length === 0;

  return (
    <form action={formAction} className="flex flex-col gap-4 border border-divider bg-surface p-5 xl:sticky xl:top-6">
      <WithHelp
        head={<h2 className="text-base">Xử lý đơn</h2>}
        help={isFinished ? undefined : "Bấm nút chuyển nhanh hoặc chọn trạng thái bên dưới. Phí ship / giảm giá bên dưới sẽ được lưu cùng lúc."}
        label="Xử lý đơn"
      />

      {!isFinished ? (
        <div className="flex flex-col gap-2">
          <button
            type="submit"
            name="quickStatus"
            value={nextStatuses[0]}
            className={buttonClass("primary", "md", "w-full")}
          >
            {PRIMARY_ACTION[order.status]}
          </button>
          <button
            type="submit"
            name="quickStatus"
            value="cancelled"
            onClick={(e) => {
              if (!window.confirm("Huỷ đơn này?")) e.preventDefault();
            }}
            className={buttonClass("secondary", "md", "w-full")}
          >
            Huỷ đơn
          </button>
        </div>
      ) : null}

      <Field label="Chuyển trạng thái" htmlFor="status" hint={isFinished ? "Đơn đã kết thúc, không đổi được trạng thái." : undefined}>
        <select id="status" name="status" defaultValue="" disabled={isFinished} className={inputClass}>
          <option value="">Giữ nguyên ({ORDER_STATUS_LABELS[order.status]})</option>
          {nextStatuses.map((status) => (
            <option key={status} value={status}>
              → {ORDER_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Ghi chú cho lần cập nhật" htmlFor="note" hint="Lưu vào lịch sử, ví dụ: đã gọi khách, mã vận đơn...">
        <input id="note" name="note" maxLength={500} disabled={isFinished} className={inputClass} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Phí vận chuyển (đ)" htmlFor="shippingFee">
          <input id="shippingFee" name="shippingFee" type="number" min={0} step={1000} defaultValue={order.shippingFee} disabled={isFinished} className={inputClass} />
        </Field>
        <Field label="Giảm giá (đ)" htmlFor="discount">
          <input id="discount" name="discount" type="number" min={0} step={1000} defaultValue={order.discount} disabled={isFinished} className={inputClass} />
        </Field>
      </div>

      <Field label="Thanh toán" htmlFor="paymentStatus">
        <select id="paymentStatus" name="paymentStatus" defaultValue={order.paymentStatus} className={inputClass}>
          {(Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]).map((status) => (
            <option key={status} value={status}>{PAYMENT_STATUS_LABELS[status]}</option>
          ))}
        </select>
      </Field>

      <Field label="Ghi chú nội bộ" htmlFor="internalNote" hint="Chỉ người trong cửa hàng thấy.">
        <textarea id="internalNote" name="internalNote" rows={3} maxLength={2000} defaultValue={order.internalNote} className={inputClass} />
      </Field>

      <FormAlert state={state} />
      <SubmitButton>Lưu thay đổi</SubmitButton>
    </form>
  );
}
