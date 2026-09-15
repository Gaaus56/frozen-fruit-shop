import type { Category, Product } from '@frozen-fruit-shop/types';
import { apiGet } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { ProductForm } from '@/components/product/product-form';
import { updateProductAction } from '../actions';

export default async function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, categories] = await Promise.all([
    apiGet<Product>(`/products/${slug}`),
    apiGet<Category[]>('/categories'),
  ]);
  const boundAction = updateProductAction.bind(null, slug);

  return (
    <div>
      <PageHeader title={`Sửa sản phẩm: ${product.name}`} />
      <ProductForm action={boundAction} categories={categories} initial={product} />
    </div>
  );
}
