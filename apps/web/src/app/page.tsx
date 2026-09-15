import { Hero } from "@/components/home/hero";
import { FeatureHighlights } from "@/components/home/feature-highlights";
import { CategoryGrid } from "@/components/home/category-grid";
import { FeaturedProducts } from "@/components/home/featured-products";
import { BlogPreview } from "@/components/home/blog-preview";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeatureHighlights />
      <CategoryGrid />
      <FeaturedProducts />
      <BlogPreview />
    </>
  );
}
