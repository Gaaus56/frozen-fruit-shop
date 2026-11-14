"use client";

import { useActionState, useState } from "react";
import { BANNER_PLACEMENTS, BANNER_PLACEMENT_LABELS, type Banner, type BannerPlacement } from "@frozen-fruit-shop/types";
import { LinkButton, SubmitButton } from "@/components/ui/button";
import { Checkbox, Field, FormAlert, inputClass } from "@/components/ui/form";
import { ImageUpload } from "@/components/ui/image-upload";
import { saveBannerAction } from "./actions";
import type { LinkOptionGroup } from "./link-options";
import { LinkPicker } from "./link-picker";
import { UnsavedChangesGuard } from "@/components/ui/unsaved-changes-guard";

const IMAGE_HINT: Record<BannerPlacement, string> = {
  home: "Ảnh ngang, khuyến nghị 2100×800 px (tỉ lệ 21:8). Trên điện thoại ảnh được cắt về 16:9 — đặt nội dung chính ở giữa.",
  products:
    "Ảnh nền đầu trang Sản phẩm, khuyến nghị 2400×600 px. Ảnh được phủ lớp tối bên trái để chữ trắng dễ đọc — chọn ảnh có nội dung chính lệch phải.",
  news: "Ảnh nền đầu trang Tin tức, khuyến nghị 2400×600 px. Ảnh được phủ lớp tối bên trái để chữ trắng dễ đọc — chọn ảnh có nội dung chính lệch phải.",
  about:
    "Ảnh nền đầu trang Giới thiệu, khuyến nghị 2400×600 px. Ảnh được phủ lớp tối bên trái để chữ trắng dễ đọc — chọn ảnh có nội dung chính lệch phải.",
};

/** Tiêu đề mặc định của trang khi banner để trống tiêu đề. */
const DEFAULT_TITLE: Record<BannerPlacement, string> = {
  home: "",
  products: "Tất cả trái cây đông lạnh",
  news: "Tin tức",
  about: "Tiêu đề trang Giới thiệu",
};

export function BannerForm({
  banner,
  linkGroups,
  defaultPlacement = "home",
}: {
  banner?: Banner;
  linkGroups: LinkOptionGroup[];
  defaultPlacement?: BannerPlacement;
}) {
  const [state, formAction] = useActionState(saveBannerAction.bind(null, banner?.id ?? null), undefined);
  const [placement, setPlacement] = useState<BannerPlacement>(banner?.placement ?? defaultPlacement);
  const isHome = placement === "home";

  return (
    <form action={formAction} className="flex flex-col gap-5 border border-divider bg-surface p-6">
      <UnsavedChangesGuard state={state} />
      <Field
        label="Vị trí hiển thị"
        htmlFor="placement"
        required
        hint={
          isHome
            ? "Các banner trang chủ đang bật được trình chiếu lần lượt theo thứ tự."
            : "Trang dùng banner đang bật có thứ tự nhỏ nhất. Không có banner nào thì dùng ảnh mặc định."
        }
      >
        <select
          id="placement"
          name="placement"
          value={placement}
          onChange={(event) => setPlacement(event.target.value as BannerPlacement)}
          className={inputClass}
        >
          {BANNER_PLACEMENTS.map((value) => (
            <option key={value} value={value}>
              {BANNER_PLACEMENT_LABELS[value]}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Ảnh banner" required hint={IMAGE_HINT[placement]}>
        <ImageUpload
          name="image"
          defaultValue={banner?.image}
          frame={`w-full max-w-xl ${isHome ? "aspect-[21/8]" : "aspect-[4/1]"}`}
          label="Tải ảnh banner"
        />
      </Field>
      <Field
        label="Tiêu đề"
        htmlFor="title"
        hint={
          isHome
            ? "Không bắt buộc. Để trống nếu chữ đã có sẵn trong ảnh."
            : placement === "about"
              ? "Không bắt buộc. Để trống thì dùng tiêu đề đặt ở mục «Trang Giới thiệu»."
              : `Không bắt buộc. Thay cho tiêu đề mặc định «${DEFAULT_TITLE[placement]}» (khi khách đang lọc thì hiện tên mục đang lọc).`
        }
      >
        <input id="title" name="title" maxLength={150} defaultValue={banner?.title} className={inputClass} />
      </Field>
      <Field
        label="Mô tả"
        htmlFor="description"
        hint={isHome ? undefined : "Không bắt buộc. Thay cho dòng mô tả mặc định dưới tiêu đề."}
      >
        <textarea id="description" name="description" rows={2} maxLength={300} defaultValue={banner?.description} className={inputClass} />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Banner đầu trang Sản phẩm / Tin tức / Giới thiệu chỉ là ảnh nền, không có nút bấm — vẫn giữ giá trị cũ trong form để không mất khi đổi qua lại. */}
        <div className={isHome ? "contents" : "hidden"}>
          <Field label="Liên kết khi bấm" htmlFor="linkUrl" hint="Chọn trang có sẵn, hoặc chọn «Link tự nhập» ở cuối danh sách.">
            <LinkPicker groups={linkGroups} defaultValue={banner?.linkUrl ?? ""} />
          </Field>
          <Field label="Chữ trên nút" htmlFor="ctaLabel" hint="Để trống sẽ hiện «Xem ngay» (khi có liên kết).">
            <input id="ctaLabel" name="ctaLabel" maxLength={40} defaultValue={banner?.ctaLabel ?? ""} placeholder="Mua ngay" className={inputClass} />
          </Field>
        </div>
        <Field label="Thứ tự hiển thị" htmlFor="sortOrder" hint="Số nhỏ hiện trước.">
          <input id="sortOrder" name="sortOrder" type="number" defaultValue={banner?.sortOrder ?? 0} className={inputClass} />
        </Field>
      </div>

      <Checkbox name="isActive" label="Đang hiển thị trên website" defaultChecked={banner?.isActive ?? true} />

      <FormAlert state={state} />

      <div className="flex gap-3">
        <SubmitButton>{banner ? "Lưu thay đổi" : "Tạo banner"}</SubmitButton>
        <LinkButton href="/banners" variant="secondary">Huỷ</LinkButton>
      </div>
    </form>
  );
}
