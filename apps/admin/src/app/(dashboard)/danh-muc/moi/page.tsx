import { PageHeader } from '@/components/ui/page-header';
import { CategoryForm } from '@/components/category/category-form';
import { createCategoryAction } from '../actions';

export default function NewCategoryPage() {
  return (
    <div>
      <PageHeader title="Thêm danh mục" />
      <CategoryForm action={createCategoryAction} />
    </div>
  );
}
