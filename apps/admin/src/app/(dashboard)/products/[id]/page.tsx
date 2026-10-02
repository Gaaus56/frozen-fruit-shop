import { notFound } from "next/navigation";
import type { Category, Product } from "@frozen-fruit-shop/types";
import { PageHeader } from "@/components/ui/page-header";
import { ApiError, api } from "@/lib/api";
import { ProductForm } from "../product-form";

export const metadata = { title: "Sửa sản phẩm" };

export default async function EditProductPage({ params }: PageProps<"/products/[id]">) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    api<Product>(`/admin/products/${id}`).catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 404) notFound();
      throw error;
    }),
    api<Category[]>("/admin/categories"),
  ]);

  return (
    <div>
      <PageHeader back={{ href: "/products", label: "Sản phẩm" }} title={`Sửa: ${product.name}`} />
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
