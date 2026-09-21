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
    <>
      <section
        className="relative border-b border-divider bg-[#2a2f33] bg-cover bg-center"
        style={{ backgroundImage: "url(/images/banners/banner_v3.jpg)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/20" aria-hidden />
        <Container className="relative py-12">
          <SectionHeading
            eyebrow="Sản phẩm"
            title="Tất cả trái cây đông lạnh"
          tone="light"
            description="Chọn loại trái cây và quy cách đóng gói phù hợp với nhu cầu của bạn."
          />

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/products"
              className={`rounded-none border px-4 py-2 text-sm font-medium transition-colors ${
                !activeCategorySlug
                  ? "border-accent-600 bg-accent-600 text-white"
                  : "border-white/40 text-white hover:border-white hover:bg-white/10"
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
                    : "border-white/40 text-white hover:border-white hover:bg-white/10"
                }`}
              >
                {category.name}
              </Link>
            ))}
          </div>

        </Container>
      </section>

      <section className="bg-accent-600/[0.06] py-12">
        <Container>
          <ProductGrid products={filteredProducts} />
        </Container>
      </section>
    </>
  );
}
