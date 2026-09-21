import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductGrid } from "@/components/product/product-grid";
import { categories, products } from "@frozen-fruit-shop/fixtures";

export const metadata: Metadata = {
  title: "Sản phẩm",
  description: "Danh sách trái cây đông lạnh: xoài, dâu, sầu riêng, bơ, mãng cầu, chanh dây.",
};

interface ProductsPageProps {
  searchParams: Promise<{ "category"?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const activeCategorySlug = params["category"];

  const filteredProducts = activeCategorySlug
    ? products.filter((product) => product.categorySlug === activeCategorySlug)
    : products;

  return (
    <Container className="py-10">
      <SectionHeading
        eyebrow="Sản phẩm"
        title="Tất cả trái cây đông lạnh"
        description="Chọn loại trái cây và quy cách đóng gói phù hợp với nhu cầu của bạn."
      />

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/products"
          className={`rounded-none border px-4 py-2 text-sm font-medium transition-colors ${
            !activeCategorySlug
              ? "border-accent-600 bg-accent-600 text-white"
              : "border-divider text-foreground/85 hover:border-accent-500"
          }`}
        >
          Tất cả
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className={`rounded-none border px-4 py-2 text-sm font-medium transition-colors ${
              activeCategorySlug === category.slug
                ? "border-accent-600 bg-accent-600 text-white"
                : "border-divider text-foreground/85 hover:border-accent-500"
            }`}
          >
            {category.name}
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <ProductGrid products={filteredProducts} />
      </div>
    </Container>
  );
}
