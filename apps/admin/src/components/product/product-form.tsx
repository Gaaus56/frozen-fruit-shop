'use client';

import { useActionState } from 'react';
import type { Category, Product } from '@frozen-fruit-shop/types';
import { Field, inputClassName } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { VariantEditor } from './variant-editor';
import type { ProductFormState } from '@/app/(dashboard)/san-pham/actions';

type ProductAction = (
  prevState: ProductFormState | undefined,
  formData: FormData,
) => Promise<ProductFormState>;

export function ProductForm({
  action,
  categories,
  initial,
}: {
  action: ProductAction;
  categories: Category[];
  initial?: Product;
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

        <Field label="Tên sản phẩm" htmlFor="name">
          <input id="name" name="name" defaultValue={initial?.name} required className={inputClassName} />
        </Field>

        <Field label="Danh mục" htmlFor="categorySlug">
          <select
            id="categorySlug"
            name="categorySlug"
            defaultValue={initial?.categorySlug}
            required
            className={inputClassName}
          >
            <option value="" disabled>
              -- Chọn danh mục --
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Nhãn (phân cách bằng dấu phẩy)" htmlFor="tags" hint="Ví dụ: ban-chay, moi, so-che-san">
          <input id="tags" name="tags" defaultValue={initial?.tags?.join(', ')} className={inputClassName} />
        </Field>
      </div>

      <Field label="Ảnh sản phẩm (mỗi dòng một đường dẫn)" htmlFor="images">
        <textarea
          id="images"
          name="images"
          defaultValue={initial?.images?.join('\n')}
          required
          rows={2}
          className={inputClassName}
        />
      </Field>

      <Field label="Mô tả ngắn" htmlFor="shortDescription">
        <textarea
          id="shortDescription"
          name="shortDescription"
          defaultValue={initial?.shortDescription}
          required
          rows={2}
          className={inputClassName}
        />
      </Field>

      <Field label="Mô tả chi tiết" htmlFor="description">
        <textarea
          id="description"
          name="description"
          defaultValue={initial?.description}
          required
          rows={4}
          className={inputClassName}
        />
      </Field>

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
        <p className="mb-3 text-sm font-semibold text-emerald-900">Bảo quản & sử dụng</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nhiệt độ bảo quản" htmlFor="temperature">
            <input
              id="temperature"
              name="temperature"
              defaultValue={initial?.storageInfo?.temperature}
              required
              className={inputClassName}
            />
          </Field>
          <Field label="Hạn sử dụng (ngày)" htmlFor="shelfLifeDays">
            <input
              id="shelfLifeDays"
              name="shelfLifeDays"
              type="number"
              min={1}
              defaultValue={initial?.storageInfo?.shelfLifeDays}
              required
              className={inputClassName}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Hướng dẫn rã đông / sử dụng" htmlFor="thawInstructions">
              <textarea
                id="thawInstructions"
                name="thawInstructions"
                defaultValue={initial?.storageInfo?.thawInstructions}
                required
                rows={2}
                className={inputClassName}
              />
            </Field>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Quy cách đóng gói & giá</p>
        <VariantEditor initial={initial?.variants ?? []} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Sản phẩm liên quan (ID, phân cách bằng dấu phẩy)"
          htmlFor="relatedProductIds"
          hint="Tuỳ chọn — để trống nếu chưa cần"
        >
          <input
            id="relatedProductIds"
            name="relatedProductIds"
            defaultValue={initial?.relatedProductIds?.join(', ')}
            className={inputClassName}
          />
        </Field>

        <div className="flex items-center gap-2 pt-6">
          <input
            id="isWholesaleAvailable"
            name="isWholesaleAvailable"
            type="checkbox"
            defaultChecked={initial?.isWholesaleAvailable}
            className="h-4 w-4 rounded border-slate-300"
          />
          <label htmlFor="isWholesaleAvailable" className="text-sm text-slate-700">
            Cho phép đặt hàng sỉ
          </label>
        </div>
      </div>

      {state?.error ? <p className="text-sm font-medium text-red-600">{state.error}</p> : null}

      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? 'Đang lưu...' : 'Lưu sản phẩm'}
      </Button>
    </form>
  );
}
