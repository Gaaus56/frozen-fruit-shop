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
  searchParams: Promise<{ "danh-muc"?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const activeCategorySlug = params["danh-muc"];

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
          href="/san-pham"
          className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            !activeCategorySlug
              ? "border-mango-600 bg-mango-600 text-white"
              : "border-slate-300 text-slate-700 hover:border-mango-500"
          }`}
        >
          Tất cả
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/san-pham?danh-muc=${category.slug}`}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              activeCategorySlug === category.slug
                ? "border-mango-600 bg-mango-600 text-white"
                : "border-slate-300 text-slate-700 hover:border-mango-500"
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
