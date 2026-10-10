import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";
import { PageHero } from "@/components/ui/page-hero";
import { ClearFilterChip, FilterChip, FilterChips } from "@/components/ui/filter-chips";
import { ProductGrid } from "@/components/product/product-grid";
import { getBanners, getCategories, getProducts, type ProductFilters } from "@/lib/api";

export const metadata: Metadata = {
  title: "Sản phẩm",
  description: "Danh sách trái cây đông lạnh cấp đông nhanh, đóng gói hút chân không.",
};

/** Ảnh nền khi admin chưa tạo banner nào cho trang Sản phẩm. */
const FALLBACK_BANNER = "/images/banners/banner_v3.jpg";
const DEFAULT_TITLE = "Tất cả trái cây đông lạnh";
const DEFAULT_DESCRIPTION = "Chọn loại trái cây và quy cách đóng gói phù hợp với nhu cầu của bạn.";

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

  const [categories, products, banners] = await Promise.all([
    getCategories(),
    getProducts({ category: params.category, q: query, sort }),
    getBanners("products"),
  ]);
  const activeCategory = categories.find((category) => category.slug === params.category);
  const banner = banners[0];
  const isFiltered = Boolean(activeCategory || query);

  return (
    <>
      <PageHero
        image={banner?.image ?? FALLBACK_BANNER}
        eyebrow="Sản phẩm"
        title={activeCategory ? activeCategory.name : banner?.title || DEFAULT_TITLE}
        description={
          query
            ? `Kết quả tìm kiếm cho "${query}" — ${products.length} sản phẩm.`
            : activeCategory
              ? activeCategory.description || DEFAULT_DESCRIPTION
              : banner?.description || DEFAULT_DESCRIPTION
        }
      >
        {categories.length > 0 || query ? (
          <FilterChips label="Danh mục sản phẩm">
            {query ? (
              <ClearFilterChip href={buildHref({ category: params.category, sort })} label={`Xoá từ khoá tìm kiếm "${query}"`}>
                “{query}”
              </ClearFilterChip>
            ) : null}
            <FilterChip href={buildHref({ q: query, sort })} active={!activeCategory}>
              Tất cả
            </FilterChip>
            {categories.map((category) => (
              <FilterChip
                key={category.id}
                href={buildHref({ category: category.slug, q: query, sort })}
                active={activeCategory?.id === category.id}
              >
                {category.name}
              </FilterChip>
            ))}
          </FilterChips>
        ) : null}
      </PageHero>

      <section className="pb-12 pt-6 sm:pt-8" aria-labelledby="product-list-heading">
        <Container>
          {/* Tiêu đề cho trình đọc màn hình: giữ đúng thứ tự h1 → h2 → h3 (tên sản phẩm trong thẻ). */}
          <h2 id="product-list-heading" className="sr-only">
            Danh sách sản phẩm
          </h2>
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-1 text-sm sm:flex sm:flex-wrap sm:items-center" aria-label="Sắp xếp">
              <span className="col-span-2 mr-1 text-foreground/65 sm:col-span-1">Sắp xếp:</span>
              {SORTS.map((item) => (
                <Link
                  key={item.value}
                  href={buildHref({ category: params.category, q: query, sort: item.value })}
                  aria-current={item.value === sort}
                  className={`rounded-full px-3 py-1 text-center font-semibold transition-colors ${
                    item.value === sort ? "bg-leaf text-white" : "text-foreground/70 hover:bg-leaf/10 hover:text-leaf"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-xl bg-card px-6 py-14 text-center ring-1 ring-divider/70">
              <span className="text-4xl" aria-hidden>
                {query ? "🔍" : "🧊"}
              </span>
              <p className="max-w-md text-foreground/70">
                {query
                  ? `Không tìm thấy sản phẩm nào khớp với "${query}". Thử từ khoá ngắn hơn, ví dụ "xoài" hoặc "dâu".`
                  : "Chưa có sản phẩm nào trong mục này. Vui lòng quay lại sau."}
              </p>
              {isFiltered ? <LinkButton href="/products" className="rounded-lg">Xem tất cả sản phẩm</LinkButton> : null}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
