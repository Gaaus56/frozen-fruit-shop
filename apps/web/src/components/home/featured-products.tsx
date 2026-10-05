import type { Product } from "@frozen-fruit-shop/types";
import { SectionCard } from "@/components/ui/section-card";
import { ProductGrid } from "@/components/product/product-grid";
import { LinkButton } from "@/components/ui/button";

export function FeaturedProducts({ products, title }: { products: Product[]; title: string }) {
  if (products.length === 0) return null;

  return (
    <SectionCard
      title={title}
      action={
        <LinkButton href="/products" variant="dark" className="rounded-full !px-8 !py-2.5 !text-sm">
          Xem thêm
        </LinkButton>
      }
    >
      <ProductGrid products={products} />
    </SectionCard>
  );
}
