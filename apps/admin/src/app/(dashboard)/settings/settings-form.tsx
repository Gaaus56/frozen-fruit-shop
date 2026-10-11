"use client";

import { useActionState } from "react";
import { ASSURANCE_ICONS, MAX_PRODUCT_ASSURANCES, type ProductAssurance, type SiteSettings } from "@frozen-fruit-shop/types";
import { SubmitButton } from "@/components/ui/button";
import { Checkbox, Field, FormAlert, Section, inputClass } from "@/components/ui/form";
import { LinkPicker } from "../banners/link-picker";
import type { LinkOptionGroup } from "../banners/link-options";
import { saveSettingsAction } from "./actions";

const EMPTY_ASSURANCE: ProductAssurance = { icon: ASSURANCE_ICONS[0], title: "", text: "", linkUrl: "" };

export function SettingsForm({ settings, linkGroups }: { settings: SiteSettings; linkGroups: LinkOptionGroup[] }) {
  const [state, formAction] = useActionState(saveSettingsAction, undefined);
  // Luôn hiện đủ số ô; ô trống tiêu đề sẽ bị bỏ khi lưu.
  const assurances = Array.from({ length: MAX_PRODUCT_ASSURANCES }, (_, index) => settings.productAssurances[index] ?? EMPTY_ASSURANCE);

  return (
    <form action={formAction} className="flex max-w-4xl flex-col gap-6">
      <Section id="brand" title="Thương hiệu">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Tên cửa hàng" htmlFor="storeName" required hint="Hiện ở tiêu đề trang, chân trang.">
            <input id="storeName" name="storeName" required maxLength={120} defaultValue={settings.storeName} className={inputClass} />
          </Field>
          <Field label="Tên rút gọn" htmlFor="shortName" required hint="Hiện ở thanh menu khi cuộn trang.">
            <input id="shortName" name="shortName" required maxLength={60} defaultValue={settings.shortName} className={inputClass} />
          </Field>
        </div>
        <Checkbox
          name="marqueeEnabled"
          label="Hiện dải chữ chạy đỏ ở đầu trang"
          defaultChecked={settings.marqueeEnabled}
          hint="Bỏ chọn để ẩn hoàn toàn dải này trên website."
        />
        <Field label="Dòng chữ chạy đầu trang" htmlFor="marqueeText" hint="Để trống để tự ghép từ hotline, địa chỉ, giờ mở cửa.">
          <input id="marqueeText" name="marqueeText" maxLength={500} defaultValue={settings.marqueeText} className={inputClass} />
        </Field>
      </Section>

      <Section id="contact" title="Liên hệ" description="Dùng cho nút gọi, Zalo, Facebook nổi và trang Liên hệ.">
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

      <Section id="address" title="Địa chỉ">
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

      <Section
        id="assurances"
        title="Thẻ cam kết trang sản phẩm"
        description="Các ô nhỏ dưới nút «Mua ngay» ở mọi trang chi tiết sản phẩm. Để trống tiêu đề để ẩn ô đó. Có thể gõ {phone} (hotline) và {hotlineHours} (giờ nhận điện thoại) — web tự thay bằng thông tin ở mục Liên hệ."
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {assurances.map((item, index) => (
            <fieldset key={index} className="flex flex-col gap-3 border border-divider bg-card p-4">
              <legend className="px-1 text-xs font-bold uppercase tracking-wide text-foreground/60">Ô {index + 1}</legend>
              <Field label="Biểu tượng" htmlFor={`assurance${index}Icon`}>
                <select id={`assurance${index}Icon`} name={`assurance${index}Icon`} defaultValue={item.icon} className={inputClass}>
                  {/* Giữ biểu tượng cũ nếu không nằm trong danh sách (dữ liệu nhập tay trước đây). */}
                  {(ASSURANCE_ICONS as readonly string[]).includes(item.icon) ? null : <option value={item.icon}>{item.icon}</option>}
                  {ASSURANCE_ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tiêu đề" htmlFor={`assurance${index}Title`}>
                <input id={`assurance${index}Title`} name={`assurance${index}Title`} maxLength={60} defaultValue={item.title} className={inputClass} />
              </Field>
              <Field label="Mô tả ngắn" htmlFor={`assurance${index}Text`}>
                <textarea id={`assurance${index}Text`} name={`assurance${index}Text`} rows={2} maxLength={160} defaultValue={item.text} className={inputClass} />
              </Field>
              <Field label="Bấm vào thì mở" htmlFor={`assurance${index}Link`}>
                <LinkPicker groups={linkGroups} defaultValue={item.linkUrl} name={`assurance${index}Link`} id={`assurance${index}Link`} />
              </Field>
            </fieldset>
          ))}
        </div>
      </Section>

      <Section id="payment" title="Thanh toán & pháp lý">
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
