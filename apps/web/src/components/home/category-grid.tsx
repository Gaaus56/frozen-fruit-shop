import Link from "next/link";
import type { Category } from "@frozen-fruit-shop/types";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductImage } from "@/components/product/product-image";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="py-16">
      <Container>
        <SectionHeading eyebrow="Danh mục" title="Chọn theo loại trái cây yêu thích" />

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group flex flex-col items-center gap-3 bg-surface p-4 text-center transition-colors hover:bg-accent-100"
            >
              <div className="relative aspect-square w-full max-w-28 overflow-hidden">
                <ProductImage
                  src={category.image}
                  alt={category.name}
                  sizes="112px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <span className="text-sm font-bold text-foreground group-hover:text-accent-700">{category.name}</span>
              <span className="text-xs text-foreground/55">{category.productCount} sản phẩm</span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
