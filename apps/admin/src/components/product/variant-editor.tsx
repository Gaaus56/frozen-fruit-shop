'use client';

import { useState } from 'react';
import type { ProductVariant } from '@frozen-fruit-shop/types';
import { inputClassName } from '@/components/ui/field';

type VariantDraft = Pick<ProductVariant, 'packageSize' | 'price' | 'pricePerKg' | 'stockStatus' | 'sku'>;

const EMPTY_VARIANT: VariantDraft = {
  packageSize: '',
  price: 0,
  pricePerKg: 0,
  stockStatus: 'in_stock',
  sku: '',
};

const STOCK_STATUS_LABELS: Record<VariantDraft['stockStatus'], string> = {
  in_stock: 'Còn hàng',
  low_stock: 'Sắp hết',
  out_of_stock: 'Hết hàng',
};

export function VariantEditor({ initial }: { initial: VariantDraft[] }) {
  const [variants, setVariants] = useState<VariantDraft[]>(initial.length > 0 ? initial : [{ ...EMPTY_VARIANT }]);

  function updateVariant(index: number, patch: Partial<VariantDraft>) {
    setVariants((current) => current.map((variant, i) => (i === index ? { ...variant, ...patch } : variant)));
  }

  function addVariant() {
    setVariants((current) => [...current, { ...EMPTY_VARIANT }]);
  }

  function removeVariant(index: number) {
    setVariants((current) => current.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="variantsJson" value={JSON.stringify(variants)} />

      {variants.map((variant, index) => (
        <div key={index} className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-6">
          <div className="col-span-2 sm:col-span-1">
            <label className="text-xs font-medium text-slate-500">Quy cách</label>
            <input
              value={variant.packageSize}
              onChange={(e) => updateVariant(index, { packageSize: e.target.value })}
              placeholder="500g"
              className={inputClassName}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Giá (VNĐ)</label>
            <input
              type="number"
              min={0}
              value={variant.price}
              onChange={(e) => updateVariant(index, { price: Number(e.target.value) })}
              className={inputClassName}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Giá/kg (VNĐ)</label>
            <input
              type="number"
              min={0}
              value={variant.pricePerKg}
              onChange={(e) => updateVariant(index, { pricePerKg: Number(e.target.value) })}
              className={inputClassName}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Tồn kho</label>
            <select
              value={variant.stockStatus}
              onChange={(e) => updateVariant(index, { stockStatus: e.target.value as VariantDraft['stockStatus'] })}
              className={inputClassName}
            >
              {Object.entries(STOCK_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">SKU</label>
            <input
              value={variant.sku}
              onChange={(e) => updateVariant(index, { sku: e.target.value })}
              className={inputClassName}
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => removeVariant(index)}
              disabled={variants.length <= 1}
              className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-40"
            >
              Xoá
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addVariant}
        className="w-fit rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 hover:border-emerald-500 hover:text-emerald-700"
      >
        + Thêm quy cách đóng gói
      </button>
    </div>
  );
}
