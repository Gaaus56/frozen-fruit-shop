import { BannerSlider } from "@/components/home/banner-slider";
import { Hero } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { FeaturedProducts } from "@/components/home/featured-products";
import { BlogPreview } from "@/components/home/blog-preview";
import { getBanners, getCategories, getPosts, getProducts } from "@/lib/api";

export default async function HomePage() {
  const [banners, categories, featured, posts] = await Promise.all([
    getBanners(),
    getCategories(),
    getProducts({ featured: true, limit: 8 }),
    getPosts(3),
  ]);

  // Chưa đánh dấu sản phẩm nổi bật nào thì hiển thị các sản phẩm mới nhất.
  const showcase = featured.length > 0 ? featured : await getProducts({ sort: "newest", limit: 8 });

  return (
    <>
      <BannerSlider banners={banners} />
      <Hero />
      <CategoryGrid categories={categories.filter((category) => category.productCount > 0)} />
      <FeaturedProducts
        products={showcase}
        title={featured.length > 0 ? "Được khách hàng yêu thích nhất" : "Sản phẩm mới"}
      />
      <BlogPreview posts={posts} />
    </>
  );
}
