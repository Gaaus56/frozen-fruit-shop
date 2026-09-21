import { BannerSlider } from "@/components/home/banner-slider";
import { Hero } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { FeaturedProducts } from "@/components/home/featured-products";
import { BlogPreview } from "@/components/home/blog-preview";

export default function HomePage() {
  return (
    <>
      <BannerSlider />
      <Hero />
      <CategoryGrid />
      <FeaturedProducts />
      <BlogPreview />
    </>
  );
}
