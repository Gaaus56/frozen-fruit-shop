import { notFound } from "next/navigation";
import type { Category } from "@frozen-fruit-shop/types";
import { PageHeader } from "@/components/ui/page-header";
import { ApiError, api } from "@/lib/api";
import { CategoryForm } from "../category-form";

export const metadata = { title: "Sửa danh mục" };

export default async function EditCategoryPage({ params }: PageProps<"/categories/[id]">) {
  const { id } = await params;
  const category = await api<Category>(`/admin/categories/${id}`).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });

  return (
    <div>
      <PageHeader back={{ href: "/categories", label: "Danh mục" }} title={`Sửa: ${category.name}`} />
      <CategoryForm category={category} />
    </div>
  );
}
