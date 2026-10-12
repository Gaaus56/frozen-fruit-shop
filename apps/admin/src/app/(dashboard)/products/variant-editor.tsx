"use client";

import { useState } from "react";
import { STOCK_STATUS_LABELS, type ProductVariant, type StockStatus } from "@frozen-fruit-shop/types";
import { buttonClass } from "@/components/ui/button";
import { inputClass } from "@/components/ui/form";
import { formatCurrency } from "@/lib/format";

interface VariantDraft {
  key: string;
  id?: string;
  packageSize: string;
  weightGrams: string;
  price: string;
  compareAtPrice: string;
  stockStatus: StockStatus;
  sku: string;
  isActive: boolean;
}

let counter = 0;
const newKey = () => `new-${++counter}`;

function toDraft(variant: ProductVariant): VariantDraft {
  return {
    key: variant.id,
    id: variant.id,
    packageSize: variant.packageSize,
    weightGrams: variant.weightGrams ? String(variant.weightGrams) : "",
    price: String(variant.price),
    compareAtPrice: variant.compareAtPrice ? String(variant.compareAtPrice) : "",
    stockStatus: variant.stockStatus,
    sku: variant.sku ?? "",
    isActive: variant.isActive,
  };
}

const empty = (): VariantDraft => ({
  key: newKey(),
  packageSize: "",
  weightGrams: "",
  price: "",
  compareAtPrice: "",
  stockStatus: "in_stock",
  sku: "",
  isActive: true,
});

const num = (value: string) => (value.trim() === "" ? null : Number(value));

/** Bảng quy cách đóng gói. Dữ liệu gửi kèm form dạng JSON trong input ẩn `name`. */
export function VariantEditor({ name, initial }: { name: string; initial: ProductVariant[] }) {
  const [variants, setVariants] = useState<VariantDraft[]>(initial.length > 0 ? initial.map(toDraft) : [empty()]);

  const update = (key: string, patch: Partial<VariantDraft>) =>
    setVariants((current) => current.map((variant) => (variant.key === key ? { ...variant, ...patch } : variant)));

  const serialized = variants.map((variant) => ({
    id: variant.id,
    packageSize: variant.packageSize.trim(),
    weightGrams: num(variant.weightGrams),
    price: num(variant.price) ?? 0,
    compareAtPrice: num(variant.compareAtPrice),
    stockStatus: variant.stockStatus,
    sku: variant.sku.trim() || null,
    isActive: variant.isActive,
  }));

  const small = "text-[11px] font-bold uppercase tracking-wide text-foreground/50";

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={name} value={JSON.stringify(serialized)} />

      {variants.map((variant, index) => {
        const price = num(variant.price);
        const weight = num(variant.weightGrams);
        const perKg = price && weight ? Math.round((price * 1000) / weight) : null;
        return (
          <div key={variant.key} className={`border p-4 ${variant.isActive ? "border-divider" : "border-dashed border-divider bg-muted/50"}`}>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
              <label className="col-span-2 md:col-span-1">
                <span className={small}>Quy cách *</span>
                <input value={variant.packageSize} onChange={(e) => update(variant.key, { packageSize: e.target.value })} placeholder="500g" required className={inputClass} />
              </label>
              <label>
                <span className={small}>Khối lượng (g)</span>
                <input type="number" min={1} value={variant.weightGrams} onChange={(e) => update(variant.key, { weightGrams: e.target.value })} placeholder="500" className={inputClass} />
              </label>
              <label>
                <span className={small}>Giá bán (đ) *</span>
                <input type="number" min={0} step={500} value={variant.price} onChange={(e) => update(variant.key, { price: e.target.value })} required className={inputClass} />
              </label>
              <label>
                <span className={small}>Giá gốc (đ)</span>
                <input type="number" min={0} step={500} value={variant.compareAtPrice} onChange={(e) => update(variant.key, { compareAtPrice: e.target.value })} placeholder="Nếu đang giảm giá" className={inputClass} />
              </label>
              <label>
                <span className={small}>Tồn kho</span>
                <select value={variant.stockStatus} onChange={(e) => update(variant.key, { stockStatus: e.target.value as StockStatus })} className={inputClass}>
                  {(Object.keys(STOCK_STATUS_LABELS) as StockStatus[]).map((status) => (
                    <option key={status} value={status}>{STOCK_STATUS_LABELS[status]}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className={small}>Mã SKU</span>
                <input value={variant.sku} onChange={(e) => update(variant.key, { sku: e.target.value })} placeholder="Không bắt buộc" className={inputClass} />
              </label>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-foreground/55">
                {perKg ? `≈ ${formatCurrency(perKg)}/kg` : null}
              </span>
              <span className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 font-semibold">
                  <input type="checkbox" checked={variant.isActive} onChange={(e) => update(variant.key, { isActive: e.target.checked })} className="accent-[#ec3013]" />
                  Đang bán
                </label>
                <button type="button" onClick={() => setVariants((current) => current.filter((item) => item.key !== variant.key))} disabled={variants.length === 1} className={buttonClass("ghost", "sm")}>
                  Xoá quy cách
                </button>
                <button
                  type="button"
                  onClick={() => setVariants((current) => {
                    const next = [...current];
                    if (index > 0) [next[index - 1], next[index]] = [next[index], next[index - 1]];
                    return next;
                  })}
                  disabled={index === 0}
                  className={buttonClass("ghost", "sm")}
                  aria-label="Chuyển lên"
                >
                  ↑
                </button>
              </span>
            </div>
          </div>
        );
      })}

      <button type="button" onClick={() => setVariants((current) => [...current, empty()])} className={buttonClass("secondary", "sm", "w-fit")}>
        + Thêm quy cách
      </button>
    </div>
  );
}
