"use client";

import { useActionState } from "react";
import type { Post } from "@frozen-fruit-shop/types";
import { LinkButton, SubmitButton } from "@/components/ui/button";
import { Checkbox, Field, FormAlert, Section, inputClass } from "@/components/ui/form";
import { ImageUpload } from "@/components/ui/image-upload";
import { savePostAction } from "./actions";

/** ISO → giá trị cho <input type="datetime-local"> theo giờ Việt Nam. */
function toLocalInput(iso: string | undefined): string {
  if (!iso) return "";
  const date = new Date(new Date(iso).getTime() + 7 * 3600_000);
  return date.toISOString().slice(0, 16);
}

export function PostForm({ post, categories }: { post?: Post; categories: string[] }) {
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
          <Field label="Nội dung bài viết" htmlFor="content" hint="Xuống dòng sẽ được giữ nguyên khi hiển thị.">
            <textarea id="content" name="content" rows={16} maxLength={50000} defaultValue={post?.content} className={inputClass} />
          </Field>
        </Section>
      </div>

      <div className="flex flex-col gap-6">
        <Section title="Xuất bản">
          <Checkbox name="isPublished" label="Hiển thị trên website" defaultChecked={post?.isPublished ?? true} />
          <Field label="Ngày đăng" htmlFor="publishedAt" hint="Đặt ngày trong tương lai để hẹn giờ đăng. Để trống = ngay bây giờ.">
            <input id="publishedAt" name="publishedAt" type="datetime-local" defaultValue={toLocalInput(post?.publishedAt)} className={inputClass} />
          </Field>
          <Field label="Chuyên mục" htmlFor="category" hint="Ví dụ: Công thức, Mẹo bảo quản, Tin cửa hàng.">
            <input id="category" name="category" list="post-categories" maxLength={60} defaultValue={post?.category} className={inputClass} />
            <datalist id="post-categories">
              {categories.map((category) => <option key={category} value={category} />)}
            </datalist>
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
