import type { Product } from "@frozen-fruit-shop/types";
import { ProductCard } from "@/components/product/product-card";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return <p className="text-slate-600">Chưa có sản phẩm nào trong danh mục này.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
