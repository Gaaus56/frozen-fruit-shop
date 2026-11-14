import "server-only";
import type { Product } from "@frozen-fruit-shop/types";
import type { ProductOption } from "@/components/editor/extensions";
import { api } from "@/lib/api";

/** Sản phẩm đang bán để chèn "ô sản phẩm" vào bài viết / chính sách / trang Giới thiệu. */
export async function getProductOptions(): Promise<ProductOption[]> {
  const products = await api<Product[]>("/admin/products?status=active");
  return products.map((product) => ({
    slug: product.slug,
    name: product.name,
    image: product.images[0]?.url ?? null,
    price: Math.min(...product.variants.map((variant) => variant.price)),
    category: product.category.name,
  }));
}
