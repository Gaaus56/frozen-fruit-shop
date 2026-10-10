import type { Product } from "@frozen-fruit-shop/types";
import { ProductCard } from "@/components/product/product-card";

export function ProductGrid({
  products,
  emptyMessage = "Chưa có sản phẩm nào trong danh mục này.",
}: {
  products: Product[];
  emptyMessage?: string;
}) {
  if (products.length === 0) {
    return <p className="rounded-xl bg-card px-6 py-10 text-center text-foreground/70 ring-1 ring-divider/70">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
