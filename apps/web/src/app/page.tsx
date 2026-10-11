import { BannerSlider } from "@/components/home/banner-slider";
import { Hero } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { FeaturedProducts } from "@/components/home/featured-products";
import { BlogPreview } from "@/components/home/blog-preview";
import { HomeBlocks } from "@/components/home/home-blocks";
import { Container } from "@/components/ui/container";
import { getBanners, getCategories, getHomeBlocks, getPosts, getProducts } from "@/lib/api";

export default async function HomePage() {
  const [banners, categories, featured, posts, blocks] = await Promise.all([
    getBanners(),
    getCategories(),
    getProducts({ featured: true, limit: 8 }),
    getPosts(6),
    getHomeBlocks(),
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
      <div>
        <Hero />
        <section className="pb-10 pt-2 sm:pb-16 sm:pt-4">
          {/* Khối nội dung admin tự soạn (mục "Khối trang chủ") xen giữa các phần có sẵn. */}
          <Container className="flex flex-col gap-3 sm:gap-4">
            <HomeBlocks blocks={blocks} position="after_hero" />
            <CategoryGrid categories={categories.filter((category) => category.productCount > 0)} />
            <HomeBlocks blocks={blocks} position="after_categories" />
            <FeaturedProducts
              products={showcase}
              title={featured.length > 0 ? "Trái cây đông lạnh" : "Trái cây đông lạnh"}
            />
            <HomeBlocks blocks={blocks} position="after_products" />
            <BlogPreview posts={posts} />
            <HomeBlocks blocks={blocks} position="after_news" />
          </Container>
        </section>
      </div>
    </>
  );
}
