'use client';

import { useActionState } from 'react';
import type { BlogPost } from '@frozen-fruit-shop/types';
import { Field, inputClassName } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import type { BlogPostFormState } from '@/app/(dashboard)/bai-viet/actions';

type BlogPostAction = (
  prevState: BlogPostFormState | undefined,
  formData: FormData,
) => Promise<BlogPostFormState>;

function toDateInputValue(iso?: string) {
  if (!iso) return '';
  return iso.slice(0, 10);
}

export function BlogPostForm({ action, initial }: { action: BlogPostAction; initial?: BlogPost }) {
  const [state, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      <Field label="Slug (dùng trong URL)" htmlFor="slug">
        <input
          id="slug"
          name="slug"
          defaultValue={initial?.slug}
          required
          pattern="[a-z0-9-]+"
          className={inputClassName}
        />
      </Field>

      <Field label="Tiêu đề" htmlFor="title">
        <input id="title" name="title" defaultValue={initial?.title} required className={inputClassName} />
      </Field>

      <Field label="Ảnh đại diện" htmlFor="coverImage" hint="Đường dẫn hoặc link ảnh">
        <input
          id="coverImage"
          name="coverImage"
          defaultValue={initial?.coverImage}
          required
          className={inputClassName}
        />
      </Field>

      <Field label="Danh mục bài viết" htmlFor="category" hint="Ví dụ: Mẹo bảo quản, Công thức, Kiến thức">
        <input id="category" name="category" defaultValue={initial?.category} required className={inputClassName} />
      </Field>

      <Field label="Ngày đăng" htmlFor="publishedAt">
        <input
          id="publishedAt"
          name="publishedAt"
          type="date"
          defaultValue={toDateInputValue(initial?.publishedAt)}
          required
          className={inputClassName}
        />
      </Field>

      <Field label="Trích đoạn" htmlFor="excerpt" hint="Đoạn ngắn hiển thị ở trang danh sách">
        <textarea
          id="excerpt"
          name="excerpt"
          defaultValue={initial?.excerpt}
          required
          rows={2}
          className={inputClassName}
        />
      </Field>

      <Field label="Nội dung bài viết" htmlFor="content">
        <textarea
          id="content"
          name="content"
          defaultValue={initial?.content}
          required
          rows={8}
          className={inputClassName}
        />
      </Field>

      {state?.error ? <p className="text-sm font-medium text-red-600">{state.error}</p> : null}

      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? 'Đang lưu...' : 'Lưu bài viết'}
      </Button>
    </form>
  );
}
