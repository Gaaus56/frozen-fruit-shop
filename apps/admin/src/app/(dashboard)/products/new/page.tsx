import type { Category } from "@frozen-fruit-shop/types";
import { PageHeader } from "@/components/ui/page-header";
import { api } from "@/lib/api";
import { ProductForm } from "../product-form";

export const metadata = { title: "Thêm sản phẩm" };

export default async function NewProductPage() {
  const categories = await api<Category[]>("/admin/categories");
  return (
    <div>
      <PageHeader back={{ href: "/products", label: "Sản phẩm" }} title="Thêm sản phẩm" />
      <ProductForm categories={categories} />
    </div>
  );
}
