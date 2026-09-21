import type { Category } from '@frozen-fruit-shop/types';
import { apiGet } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { LinkButton } from '@/components/ui/button';
import { DeleteButton } from '@/components/ui/delete-button';
import { deleteCategoryAction } from './actions';

export default async function CategoriesPage() {
  const categories = await apiGet<Category[]>('/categories');

  return (
    <div>
      <PageHeader
        title="Danh mục"
        description="Các nhóm trái cây hiển thị trên website."
        action={<LinkButton href="/categories/new">+ Thêm danh mục</LinkButton>}
      />

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Tên</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Mô tả</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{category.name}</td>
                <td className="px-4 py-3 text-slate-500">{category.slug}</td>
                <td className="max-w-xs truncate px-4 py-3 text-slate-500">{category.description}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <LinkButton href={`/categories/${category.slug}`} variant="secondary">
                      Sửa
                    </LinkButton>
                    <DeleteButton
                      action={deleteCategoryAction.bind(null, category.slug)}
                      itemLabel={category.name}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  Chưa có danh mục nào.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
