import { PageHeader } from "@/components/ui/page-header";
import { CategoryForm } from "../category-form";

export const metadata = { title: "Thêm danh mục" };

export default function NewCategoryPage() {
  return (
    <div>
      <PageHeader back={{ href: "/categories", label: "Danh mục" }} title="Thêm danh mục" />
      <CategoryForm />
    </div>
  );
}
