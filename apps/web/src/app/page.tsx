import { BannerSlider } from "@/components/home/banner-slider";
import { Hero } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { FeaturedProducts } from "@/components/home/featured-products";
import { BlogPreview } from "@/components/home/blog-preview";
import { Container } from "@/components/ui/container";
import { getBanners, getCategories, getPosts, getProducts } from "@/lib/api";

export default async function HomePage() {
  const [banners, categories, featured, posts] = await Promise.all([
    getBanners(),
    getCategories(),
    getProducts({ featured: true, limit: 8 }),
    getPosts(6),
  ]);

  // Đủ 8 ô (2 hàng trên màn hình lớn, 4 hàng trên điện thoại): sản phẩm nổi bật trước, thiếu thì lấy sản phẩm mới nhất.
  const SHOWCASE_COUNT = 8;
  let showcase = featured;
  if (featured.length < SHOWCASE_COUNT) {
    const featuredIds = new Set(featured.map((product) => product.id));
    const newest = await getProducts({ sort: "newest", limit: SHOWCASE_COUNT });
    showcase = [...featured, ...newest.filter((product) => !featuredIds.has(product.id))].slice(0, SHOWCASE_COUNT);
  }

  return (
    <>
      <BannerSlider banners={banners} />
      <div className="bg-accent-600/[0.06]">
        <Hero />
        <section className="pb-10 pt-2 sm:pb-16 sm:pt-4">
          <Container className="flex flex-col gap-3 sm:gap-4">
            <CategoryGrid categories={categories.filter((category) => category.productCount > 0)} />
            <FeaturedProducts
              products={showcase}
              title={featured.length > 0 ? "Sản phẩm bán chạy" : "Sản phẩm mới"}
            />
            <BlogPreview posts={posts} />
          </Container>
        </section>
      </div>
    </>
  );
}
