"use client";

import { useActionState } from "react";
import type { Category, Product } from "@frozen-fruit-shop/types";
import { LinkButton, SubmitButton } from "@/components/ui/button";
import { Checkbox, Field, FormAlert, Section, inputClass } from "@/components/ui/form";
import { ImageListUpload } from "@/components/ui/image-upload";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { saveProductAction } from "./actions";
import { VariantEditor } from "./variant-editor";

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const [state, formAction] = useActionState(saveProductAction.bind(null, product?.id ?? null), undefined);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="flex flex-col gap-6 xl:col-span-2">
        <Section title="Thông tin cơ bản">
          <Field label="Tên sản phẩm" htmlFor="name" required>
            <input id="name" name="name" required maxLength={200} defaultValue={product?.name} placeholder="Ví dụ: Xoài cát Hòa Lộc cắt miếng" className={inputClass} />
          </Field>
          <Field label="Mô tả ngắn" htmlFor="shortDescription" hint="1–2 câu hiện ngay dưới tên sản phẩm.">
            <textarea id="shortDescription" name="shortDescription" rows={2} maxLength={500} defaultValue={product?.shortDescription} className={inputClass} />
          </Field>
          <Field label="Mô tả chi tiết" hint="Có thể in đậm, chia mục, chèn ảnh có chú thích.">
            <RichTextEditor name="description" defaultValue={product?.description} placeholder="Nguồn gốc, quy trình, cách dùng… (dán hoặc kéo ảnh vào đây)" />
          </Field>
        </Section>

        <Section title="Hình ảnh">
          <ImageListUpload name="images" defaultValue={product?.images.map((image) => image.url) ?? []} />
        </Section>

        <Section title="Quy cách đóng gói & giá" description="Mỗi quy cách có giá, tồn kho riêng. Khách chọn quy cách khi đặt hàng.">
          <VariantEditor name="variants" initial={product?.variants ?? []} />
        </Section>

        <Section title="Bảo quản & sử dụng">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nhiệt độ bảo quản" htmlFor="storageTemperature">
              <input id="storageTemperature" name="storageTemperature" maxLength={200} defaultValue={product?.storageInfo.temperature} placeholder="Bảo quản ở -18°C" className={inputClass} />
            </Field>
            <Field label="Hạn sử dụng (ngày)" htmlFor="shelfLifeDays">
              <input id="shelfLifeDays" name="shelfLifeDays" type="number" min={1} max={3650} defaultValue={product?.storageInfo.shelfLifeDays ?? ""} className={inputClass} />
            </Field>
          </div>
          <Field label="Hướng dẫn rã đông" htmlFor="thawInstructions">
            <textarea id="thawInstructions" name="thawInstructions" rows={2} maxLength={1000} defaultValue={product?.storageInfo.thawInstructions} className={inputClass} />
          </Field>
        </Section>
      </div>

      <div className="flex flex-col gap-6">
        <Section title="Phân loại & hiển thị">
          <Field label="Danh mục" htmlFor="categoryId" required>
            <select id="categoryId" name="categoryId" required defaultValue={product?.category.id ?? ""} className={inputClass}>
              <option value="" disabled>— Chọn danh mục —</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                  {category.isActive ? "" : " (đang ẩn)"}
                </option>
              ))}
            </select>
          </Field>
          <Checkbox name="isActive" label="Đang bán trên website" defaultChecked={product?.isActive ?? true} />
          <Checkbox name="isFeatured" label="Sản phẩm nổi bật" hint="Hiện ở mục nổi bật trang chủ." defaultChecked={product?.isFeatured} />
          <Field label="Thứ tự hiển thị" htmlFor="sortOrder" hint="Số nhỏ hiện trước.">
            <input id="sortOrder" name="sortOrder" type="number" defaultValue={product?.sortOrder ?? 0} className={inputClass} />
          </Field>
          <Field label="Đường dẫn (slug)" htmlFor="slug" hint="Để trống để tự tạo từ tên.">
            <input id="slug" name="slug" defaultValue={product?.slug} pattern="[a-z0-9]+(-[a-z0-9]+)*" className={inputClass} />
          </Field>
        </Section>

        <div className="flex flex-col gap-3 xl:sticky xl:top-6">
          <FormAlert state={state} />
          <SubmitButton className="w-full py-3">{product ? "Lưu sản phẩm" : "Tạo sản phẩm"}</SubmitButton>
          <LinkButton href="/products" variant="secondary" className="w-full">Huỷ</LinkButton>
        </div>
      </div>
    </form>
  );
}
