"use client";

import { useActionState } from "react";
import { HOME_BLOCK_POSITIONS, HOME_BLOCK_POSITION_LABELS, type HomeBlock } from "@frozen-fruit-shop/types";
import { LinkButton, SubmitButton } from "@/components/ui/button";
import { Checkbox, Field, FormAlert, inputClass } from "@/components/ui/form";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import type { ProductOption } from "@/components/editor/extensions";
import { saveHomeBlockAction } from "./actions";

export function HomeBlockForm({ block, products }: { block?: HomeBlock; products: ProductOption[] }) {
  const [state, formAction] = useActionState(saveHomeBlockAction.bind(null, block?.id ?? null), undefined);

  return (
    <form action={formAction} className="flex max-w-4xl flex-col gap-5 border border-divider bg-surface p-6">
      <Field
        label="Tiêu đề khối"
        htmlFor="title"
        hint="Không bắt buộc. Hiện ở giữa, chữ đỏ in hoa giống tiêu đề «Danh mục sản phẩm», «Tin tức» trên trang chủ."
      >
        <input id="title" name="title" maxLength={150} defaultValue={block?.title} placeholder="Câu chuyện của chúng tôi" className={inputClass} />
      </Field>
      <Field
        label="Nội dung"
        hint="Bấm «▥ Chia 2 cột» để đặt ảnh một bên, chữ một bên (điện thoại tự xếp dọc). Bôi đen chữ rồi bấm chữ A màu để đổi màu."
      >
        <RichTextEditor name="content" defaultValue={block?.content} products={products} />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Vị trí trên trang chủ" htmlFor="position" required>
          <select id="position" name="position" defaultValue={block?.position ?? "after_hero"} className={inputClass}>
            {HOME_BLOCK_POSITIONS.map((value) => (
              <option key={value} value={value}>
                {HOME_BLOCK_POSITION_LABELS[value]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Thứ tự" htmlFor="sortOrder" hint="Nhiều khối cùng vị trí: số nhỏ hiện trước.">
          <input id="sortOrder" name="sortOrder" type="number" defaultValue={block?.sortOrder ?? 0} className={inputClass} />
        </Field>
      </div>
      <Checkbox
        name="framed"
        label="Đặt trong khung trắng bo góc"
        hint="Giống các phần Danh mục, Sản phẩm, Tin tức. Bỏ chọn để nội dung nằm thẳng trên nền trang."
        defaultChecked={block?.framed ?? true}
      />
      <Checkbox name="isActive" label="Hiển thị trên trang chủ" defaultChecked={block?.isActive ?? true} />

      <FormAlert state={state} />
      <div className="flex gap-3">
        <SubmitButton>{block ? "Lưu thay đổi" : "Tạo khối"}</SubmitButton>
        <LinkButton href="/home-blocks" variant="secondary">Huỷ</LinkButton>
      </div>
    </form>
  );
}
