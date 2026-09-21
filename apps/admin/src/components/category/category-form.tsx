'use client';

import { useActionState } from 'react';
import type { Category } from '@frozen-fruit-shop/types';
import { Field, inputClassName } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import type { CategoryFormState } from '@/app/(dashboard)/categories/actions';

type CategoryAction = (
  prevState: CategoryFormState | undefined,
  formData: FormData,
) => Promise<CategoryFormState>;

export function CategoryForm({ action, initial }: { action: CategoryAction; initial?: Category }) {
  const [state, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <Field label="Slug (dùng trong URL)" htmlFor="slug" hint="Chỉ chữ thường, số và dấu gạch ngang, ví dụ: xoai-dong-lanh">
        <input
          id="slug"
          name="slug"
          defaultValue={initial?.slug}
          required
          pattern="[a-z0-9-]+"
          className={inputClassName}
        />
      </Field>

      <Field label="Tên danh mục" htmlFor="name">
        <input id="name" name="name" defaultValue={initial?.name} required className={inputClassName} />
      </Field>

      <Field label="Đường dẫn ảnh" htmlFor="image" hint="Ví dụ: /images/categories/xoai.svg hoặc một link ảnh đầy đủ">
        <input id="image" name="image" defaultValue={initial?.image} required className={inputClassName} />
      </Field>

      <Field label="Mô tả ngắn" htmlFor="description">
        <textarea
          id="description"
          name="description"
          defaultValue={initial?.description}
          required
          rows={3}
          className={inputClassName}
        />
      </Field>

      {state?.error ? <p className="text-sm font-medium text-red-600">{state.error}</p> : null}

      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? 'Đang lưu...' : 'Lưu danh mục'}
      </Button>
    </form>
  );
}
