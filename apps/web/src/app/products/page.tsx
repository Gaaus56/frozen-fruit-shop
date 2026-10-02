import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductGrid } from "@/components/product/product-grid";
import { getCategories, getProducts, type ProductFilters } from "@/lib/api";

export const metadata: Metadata = {
  title: "Sản phẩm",
  description: "Danh sách trái cây đông lạnh cấp đông nhanh, đóng gói hút chân không.",
};

const SORTS: { value: NonNullable<ProductFilters["sort"]>; label: string }[] = [
  { value: "default", label: "Nổi bật" },
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá thấp → cao" },
  { value: "price_desc", label: "Giá cao → thấp" },
];

interface ProductsPageProps {
  searchParams: Promise<{ category?: string; q?: string; sort?: string }>;
}

function buildHref(params: { category?: string; q?: string; sort?: string }) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value && value !== "default") search.set(key, value);
  const text = search.toString();
  return text ? `/products?${text}` : "/products";
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() || undefined;
  const sort = SORTS.find((item) => item.value === params.sort)?.value ?? "default";

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ category: params.category, q: query, sort }),
  ]);
  const activeCategory = categories.find((category) => category.slug === params.category);

  const chip = (active: boolean) =>
    `border px-4 py-2 text-sm font-medium transition-colors ${
      active ? "border-accent-600 bg-accent-600 text-white" : "border-white/40 text-white hover:border-white hover:bg-white/10"
    }`;

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
            title={activeCategory ? activeCategory.name : "Tất cả trái cây đông lạnh"}
            tone="light"
            description={
              query
                ? `Kết quả tìm kiếm cho "${query}" — ${products.length} sản phẩm.`
                : activeCategory?.description || "Chọn loại trái cây và quy cách đóng gói phù hợp với nhu cầu của bạn."
            }
          />

          {categories.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href={buildHref({ q: query, sort })} className={chip(!activeCategory)}>
                Tất cả
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={buildHref({ category: category.slug, q: query, sort })}
                  className={chip(activeCategory?.id === category.id)}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          ) : null}
        </Container>
      </section>

      <section className="bg-accent-600/[0.06] py-12">
        <Container>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-foreground/60">{products.length} sản phẩm</p>
            <div className="flex flex-wrap items-center gap-1 text-sm" aria-label="Sắp xếp">
              <span className="mr-1 text-foreground/55">Sắp xếp:</span>
              {SORTS.map((item) => (
                <Link
                  key={item.value}
                  href={buildHref({ category: params.category, q: query, sort: item.value })}
                  aria-current={item.value === sort}
                  className={`px-2.5 py-1 font-semibold ${
                    item.value === sort ? "bg-foreground text-background" : "text-foreground/70 hover:text-accent-700"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <ProductGrid
            products={products}
            emptyMessage={
              query
                ? `Không tìm thấy sản phẩm nào khớp với "${query}".`
                : "Chưa có sản phẩm nào trong mục này. Vui lòng quay lại sau."
            }
          />
        </Container>
      </section>
    </>
  );
}
