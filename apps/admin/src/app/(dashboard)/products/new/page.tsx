import type { Category } from '@frozen-fruit-shop/types';
import { apiGet } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { ProductForm } from '@/components/product/product-form';
import { createProductAction } from '../actions';

export default async function NewProductPage() {
  const categories = await apiGet<Category[]>('/categories');

  return (
    <div>
      <PageHeader title="Thêm sản phẩm" />
      <ProductForm action={createProductAction} categories={categories} />
    </div>
  );
}
