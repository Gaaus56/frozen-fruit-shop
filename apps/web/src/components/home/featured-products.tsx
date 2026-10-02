import type { Product } from "@frozen-fruit-shop/types";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductGrid } from "@/components/product/product-grid";
import { LinkButton } from "@/components/ui/button";

export function FeaturedProducts({ products, title }: { products: Product[]; title: string }) {
  if (products.length === 0) return null;

  return (
    <section className="py-16">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Sản phẩm" title={title} />
          <LinkButton href="/products" variant="secondary">
            Xem tất cả sản phẩm
          </LinkButton>
        </div>

        <div className="mt-8">
          <ProductGrid products={products} />
        </div>
      </Container>
    </section>
  );
}
