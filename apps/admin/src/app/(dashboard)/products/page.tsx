import type { Product } from '@frozen-fruit-shop/types';
import { apiGet } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { LinkButton } from '@/components/ui/button';
import { DeleteButton } from '@/components/ui/delete-button';
import { deleteProductAction } from './actions';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(
    amount,
  );
}

export default async function ProductsPage() {
  const products = await apiGet<Product[]>('/products');

  return (
    <div>
      <PageHeader
        title="Sản phẩm"
        description="Toàn bộ sản phẩm hiển thị trên website."
        action={<LinkButton href="/products/new">+ Thêm sản phẩm</LinkButton>}
      />

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Tên sản phẩm</th>
              <th className="px-4 py-3 font-medium">Danh mục</th>
              <th className="px-4 py-3 font-medium">Giá từ</th>
              <th className="px-4 py-3 font-medium">Biến thể</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => {
              const lowestPrice = Math.min(...product.variants.map((v) => v.price));
              return (
                <tr key={product.id}>
                  <td className="max-w-xs truncate px-4 py-3 font-medium text-slate-900">{product.name}</td>
                  <td className="px-4 py-3 text-slate-500">{product.categorySlug}</td>
                  <td className="px-4 py-3 text-slate-500">{formatCurrency(lowestPrice)}</td>
                  <td className="px-4 py-3 text-slate-500">{product.variants.length}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <LinkButton href={`/products/${product.slug}`} variant="secondary">
                        Sửa
                      </LinkButton>
                      <DeleteButton action={deleteProductAction.bind(null, product.slug)} itemLabel={product.name} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  Chưa có sản phẩm nào.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
