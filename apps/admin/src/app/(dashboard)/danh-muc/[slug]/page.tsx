import type { Category } from '@frozen-fruit-shop/types';
import { apiGet } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { CategoryForm } from '@/components/category/category-form';
import { updateCategoryAction } from '../actions';

export default async function EditCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await apiGet<Category>(`/categories/${slug}`);
  const boundAction = updateCategoryAction.bind(null, slug);

  return (
    <div>
      <PageHeader title={`Sửa danh mục: ${category.name}`} />
      <CategoryForm action={boundAction} initial={category} />
    </div>
  );
}
