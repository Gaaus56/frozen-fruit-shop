"use client";

import { useActionState } from "react";
import { POST_TYPES, POST_TYPE_LABELS, type Post, type PostType } from "@frozen-fruit-shop/types";
import { LinkButton, SubmitButton } from "@/components/ui/button";
import { Checkbox, Field, FormAlert, Section, inputClass } from "@/components/ui/form";
import { ImageUpload } from "@/components/ui/image-upload";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import type { ProductOption } from "@/components/editor/extensions";
import { savePostAction } from "./actions";

/** ISO → giá trị cho <input type="datetime-local"> theo giờ Việt Nam. */
function toLocalInput(iso: string | undefined): string {
  if (!iso) return "";
  const date = new Date(new Date(iso).getTime() + 7 * 3600_000);
  return date.toISOString().slice(0, 16);
}

export function PostForm({
  post,
  defaultType = "knowledge",
  products,
}: {
  post?: Post;
  defaultType?: PostType;
  products: ProductOption[];
}) {
  const [state, formAction] = useActionState(savePostAction.bind(null, post?.id ?? null), undefined);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="flex flex-col gap-6 xl:col-span-2">
        <Section title="Nội dung">
          <Field label="Tiêu đề" htmlFor="title" required>
            <input id="title" name="title" required maxLength={200} defaultValue={post?.title} className={inputClass} />
          </Field>
          <Field label="Tóm tắt" htmlFor="excerpt" hint="Hiện ở thẻ bài viết và khi chia sẻ lên mạng xã hội.">
            <textarea id="excerpt" name="excerpt" rows={2} maxLength={500} defaultValue={post?.excerpt} className={inputClass} />
          </Field>
          <Field label="Nội dung bài viết" hint="Chèn ảnh (kèm chú thích) và ô sản phẩm ở bất cứ đâu trong bài. Kéo để đổi vị trí.">
            <RichTextEditor name="content" defaultValue={post?.content} products={products} />
          </Field>
        </Section>
      </div>

      <div className="flex flex-col gap-6">
        <Section title="Xuất bản">
          <Checkbox name="isPublished" label="Hiển thị trên website" defaultChecked={post?.isPublished ?? true} />
          <Field label="Ngày đăng" htmlFor="publishedAt" hint="Đặt ngày trong tương lai để hẹn giờ đăng. Để trống = ngay bây giờ.">
            <input id="publishedAt" name="publishedAt" type="datetime-local" defaultValue={toLocalInput(post?.publishedAt)} className={inputClass} />
          </Field>
          <Field label="Loại bài viết" htmlFor="type" required hint="Kiến thức: bảo quản, công thức, tin cửa hàng. Tuyển dụng: có thêm khối «Ứng tuyển» (Zalo, gọi, email) cuối bài.">
            <select id="type" name="type" required defaultValue={post?.type ?? defaultType} className={inputClass}>
              {POST_TYPES.map((type) => (
                <option key={type} value={type}>{POST_TYPE_LABELS[type]}</option>
              ))}
            </select>
          </Field>
          <Field label="Đường dẫn (slug)" htmlFor="slug" hint="Để trống để tự tạo từ tiêu đề.">
            <input id="slug" name="slug" defaultValue={post?.slug} pattern="[a-z0-9]+(-[a-z0-9]+)*" className={inputClass} />
          </Field>
        </Section>
        <Section title="Ảnh bìa">
          <ImageUpload name="coverImage" defaultValue={post?.coverImage} frame="w-full aspect-[4/3]" />
        </Section>
        <div className="flex flex-col gap-3">
          <FormAlert state={state} />
          <SubmitButton className="w-full py-3">{post ? "Lưu bài viết" : "Đăng bài viết"}</SubmitButton>
          <LinkButton href="/posts" variant="secondary" className="w-full">Huỷ</LinkButton>
        </div>
      </div>
    </form>
  );
}
