import Link from "next/link";
import type { Category } from "@frozen-fruit-shop/types";
import { SectionCard } from "@/components/ui/section-card";
import { ProductImage } from "@/components/product/product-image";
import { AutoScrollTrack } from "@/components/home/auto-scroll-track";

/** Ô hiện đủ cố định: 2 (điện thoại) · 3 (tablet) · 6 (máy tính), không ô nào bị cắt nửa. */
const ITEM_CLASS =
  "group flex-col items-center gap-3 bg-card p-4 text-center transition-colors hover:bg-accent-100 shrink-0 snap-start w-[calc((100%-0.75rem)/2)] sm:w-[calc((100%-1.5rem)/3)] lg:w-[calc((100%-3.75rem)/6)]";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  // Bản sao để vòng lặp liền mạch; chỉ hiện ở breakpoint mà số ô vượt quá số ô hiển thị.
  const n = categories.length;
  const copyVisibility = [n > 2 ? "flex" : "hidden", n > 3 ? "sm:flex" : "sm:hidden", n > 6 ? "lg:flex" : "lg:hidden"].join(" ");

  const renderItem = (category: Category, isCopy: boolean) => (
    <Link
      key={isCopy ? `${category.id}-copy` : category.id}
      href={`/products?category=${category.slug}`}
      aria-hidden={isCopy || undefined}
      tabIndex={isCopy ? -1 : undefined}
      className={`${isCopy ? copyVisibility : "flex"} ${ITEM_CLASS}`}
    >
      <div className="relative aspect-square w-full max-w-28 overflow-hidden">
        <ProductImage
          src={category.image}
          alt={category.name}
          sizes="112px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-sm font-bold text-foreground group-hover:text-accent-700">{category.name}</span>
        <span className="text-xs text-foreground/55">{category.productCount} sản phẩm</span>
      </div>
    </Link>
  );

  return (
    <SectionCard title="Danh mục sản phẩm">
      <AutoScrollTrack className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((category) => renderItem(category, false))}
        {categories.map((category) => renderItem(category, true))}
      </AutoScrollTrack>
    </SectionCard>
  );
}
