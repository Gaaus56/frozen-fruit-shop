"use client";

import { useActionState } from "react";
import type { Banner } from "@frozen-fruit-shop/types";
import { LinkButton, SubmitButton } from "@/components/ui/button";
import { Checkbox, Field, FormAlert, inputClass } from "@/components/ui/form";
import { ImageUpload } from "@/components/ui/image-upload";
import { saveBannerAction } from "./actions";
import type { LinkOptionGroup } from "./link-options";
import { LinkPicker } from "./link-picker";

export function BannerForm({ banner, linkGroups }: { banner?: Banner; linkGroups: LinkOptionGroup[] }) {
  const [state, formAction] = useActionState(saveBannerAction.bind(null, banner?.id ?? null), undefined);

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-5 border border-divider bg-surface p-6">
      <Field label="Ảnh banner" required hint="Ảnh ngang, khuyến nghị 2100×800 px (tỉ lệ 21:8). Trên điện thoại ảnh được cắt về 16:9 — đặt nội dung chính ở giữa.">
        <ImageUpload name="image" defaultValue={banner?.image} frame="w-full max-w-xl aspect-[21/8]" label="Tải ảnh banner" />
      </Field>
      <Field label="Tiêu đề" htmlFor="title" hint="Không bắt buộc. Để trống nếu chữ đã có sẵn trong ảnh.">
        <input id="title" name="title" maxLength={150} defaultValue={banner?.title} className={inputClass} />
      </Field>
      <Field label="Mô tả" htmlFor="description">
        <textarea id="description" name="description" rows={2} maxLength={300} defaultValue={banner?.description} className={inputClass} />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Liên kết khi bấm" htmlFor="linkUrl" hint="Chọn trang có sẵn, hoặc chọn «Link tự nhập» ở cuối danh sách.">
          <LinkPicker groups={linkGroups} defaultValue={banner?.linkUrl ?? ""} />
        </Field>
        <Field label="Chữ trên nút" htmlFor="ctaLabel" hint="Để trống sẽ không hiện nút.">
          <input id="ctaLabel" name="ctaLabel" maxLength={40} defaultValue={banner?.ctaLabel ?? ""} placeholder="Mua ngay" className={inputClass} />
        </Field>
        <Field label="Thứ tự hiển thị" htmlFor="sortOrder" hint="Số nhỏ hiện trước.">
          <input id="sortOrder" name="sortOrder" type="number" defaultValue={banner?.sortOrder ?? 0} className={inputClass} />
        </Field>
      </div>
      <Checkbox name="isActive" label="Hiển thị trên trang chủ" defaultChecked={banner?.isActive ?? true} />

      <FormAlert state={state} />
      <div className="flex gap-3">
        <SubmitButton>{banner ? "Lưu thay đổi" : "Tạo banner"}</SubmitButton>
        <LinkButton href="/banners" variant="secondary">Huỷ</LinkButton>
      </div>
    </form>
  );
}
