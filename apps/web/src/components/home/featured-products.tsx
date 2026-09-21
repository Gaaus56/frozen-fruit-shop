import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductGrid } from "@/components/product/product-grid";
import { LinkButton } from "@/components/ui/button";
import { getFeaturedProducts } from "@frozen-fruit-shop/fixtures";

export function FeaturedProducts() {
  const featured = getFeaturedProducts();

  return (
    <section className="py-16">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Sản phẩm nổi bật" title="Được khách hàng yêu thích nhất" />
          <LinkButton href="/products" variant="secondary">
            Xem tất cả sản phẩm
          </LinkButton>
        </div>

        <div className="mt-8">
          <ProductGrid products={featured} />
        </div>
      </Container>
    </section>
  );
}
