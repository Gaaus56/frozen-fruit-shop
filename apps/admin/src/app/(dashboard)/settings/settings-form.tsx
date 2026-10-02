"use client";

import { useActionState } from "react";
import type { SiteSettings } from "@frozen-fruit-shop/types";
import { SubmitButton } from "@/components/ui/button";
import { Field, FormAlert, Section, inputClass } from "@/components/ui/form";
import { saveSettingsAction } from "./actions";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction] = useActionState(saveSettingsAction, undefined);

  return (
    <form action={formAction} className="flex max-w-4xl flex-col gap-6">
      <Section title="Thương hiệu">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Tên cửa hàng" htmlFor="storeName" required hint="Hiện ở tiêu đề trang, chân trang.">
            <input id="storeName" name="storeName" required maxLength={120} defaultValue={settings.storeName} className={inputClass} />
          </Field>
          <Field label="Tên rút gọn" htmlFor="shortName" required hint="Hiện ở thanh menu khi cuộn trang.">
            <input id="shortName" name="shortName" required maxLength={60} defaultValue={settings.shortName} className={inputClass} />
          </Field>
        </div>
        <Field label="Dòng chữ chạy đầu trang" htmlFor="marqueeText" hint="Để trống để tự ghép từ hotline, địa chỉ, giờ mở cửa.">
          <input id="marqueeText" name="marqueeText" maxLength={500} defaultValue={settings.marqueeText} className={inputClass} />
        </Field>
      </Section>

      <Section title="Liên hệ" description="Dùng cho nút gọi, Zalo, Facebook nổi và trang Liên hệ.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Hotline" htmlFor="phone" required>
            <input id="phone" name="phone" required inputMode="tel" maxLength={15} defaultValue={settings.phone} className={inputClass} />
          </Field>
          <Field label="Giờ nhận điện thoại" htmlFor="hotlineHours">
            <input id="hotlineHours" name="hotlineHours" maxLength={40} defaultValue={settings.hotlineHours} placeholder="7:00 – 21:00" className={inputClass} />
          </Field>
          <Field label="Số Zalo" htmlFor="zaloPhone" hint="Để trống để dùng hotline.">
            <input id="zaloPhone" name="zaloPhone" inputMode="tel" maxLength={15} defaultValue={settings.zaloPhone} className={inputClass} />
          </Field>
          <Field label="Email" htmlFor="email">
            <input id="email" name="email" type="email" maxLength={120} defaultValue={settings.email} className={inputClass} />
          </Field>
          <Field label="Trang Facebook" htmlFor="facebookUrl" className="sm:col-span-2">
            <input id="facebookUrl" name="facebookUrl" type="url" maxLength={300} defaultValue={settings.facebookUrl} placeholder="https://facebook.com/..." className={inputClass} />
          </Field>
        </div>
      </Section>

      <Section title="Địa chỉ">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Địa chỉ cửa hàng" htmlFor="address">
            <input id="address" name="address" maxLength={200} defaultValue={settings.address} className={inputClass} />
          </Field>
          <Field label="Mốc dễ tìm" htmlFor="addressLandmark">
            <input id="addressLandmark" name="addressLandmark" maxLength={120} defaultValue={settings.addressLandmark} placeholder="Chợ Đầu Mối Hoà Khánh" className={inputClass} />
          </Field>
          <Field label="Link Google Maps" htmlFor="mapUrl" className="sm:col-span-2">
            <input id="mapUrl" name="mapUrl" type="url" maxLength={500} defaultValue={settings.mapUrl} className={inputClass} />
          </Field>
        </div>
      </Section>

      <Section title="Thanh toán & pháp lý">
        <Field label="Thông tin chuyển khoản" htmlFor="bankTransferInfo" hint="Hiện cho khách chọn chuyển khoản khi đặt hàng (ngân hàng, số tài khoản, chủ tài khoản, nội dung CK).">
          <textarea id="bankTransferInfo" name="bankTransferInfo" rows={4} maxLength={2000} defaultValue={settings.bankTransferInfo} className={inputClass} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Mã số thuế" htmlFor="taxCode">
            <input id="taxCode" name="taxCode" maxLength={30} defaultValue={settings.taxCode} className={inputClass} />
          </Field>
          <Field label="Ghi chú MST" htmlFor="taxNote">
            <input id="taxNote" name="taxNote" maxLength={100} defaultValue={settings.taxNote} className={inputClass} />
          </Field>
        </div>
      </Section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SubmitButton className="py-3 sm:w-48">Lưu thông tin</SubmitButton>
        <FormAlert state={state} />
      </div>
    </form>
  );
}
