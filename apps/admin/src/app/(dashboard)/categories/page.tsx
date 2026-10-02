import Link from "next/link";
import type { Category } from "@frozen-fruit-shop/types";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import { PageHeader } from "@/components/ui/page-header";
import { Table, Td, Th } from "@/components/ui/table";
import { api } from "@/lib/api";
import { deleteCategoryAction } from "./actions";

export const metadata = { title: "Danh mục" };

export default async function CategoriesPage() {
  const categories = await api<Category[]>("/admin/categories");

  return (
    <div>
      <PageHeader
        title="Danh mục"
        description="Nhóm sản phẩm hiển thị ở trang chủ, menu và bộ lọc trang sản phẩm."
        action={<LinkButton href="/categories/new">+ Thêm danh mục</LinkButton>}
      />
      <Table
        empty={categories.length === 0 && "Chưa có danh mục nào. Hãy tạo danh mục trước khi thêm sản phẩm."}
        head={
          <>
            <Th>Danh mục</Th>
            <Th>Số sản phẩm</Th>
            <Th>Thứ tự</Th>
            <Th>Trạng thái</Th>
            <Th />
          </>
        }
      >
        {categories.map((category) => (
          <tr key={category.id}>
            <Td>
              <div className="flex items-center gap-3">
                <span className="relative h-11 w-11 shrink-0 overflow-hidden bg-muted">
                  {category.image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- ảnh nhỏ từ API
                    <img src={category.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  ) : null}
                </span>
                <span>
                  <Link href={`/categories/${category.id}`} className="font-bold hover:text-accent-700">{category.name}</Link>
                  <span className="block text-xs text-foreground/50">/{category.slug}</span>
                </span>
              </div>
            </Td>
            <Td>{category.productCount}</Td>
            <Td>{category.sortOrder}</Td>
            <Td>{category.isActive ? <Badge tone="green">Đang hiển thị</Badge> : <Badge>Đang ẩn</Badge>}</Td>
            <Td>
              <div className="flex justify-end gap-2">
                <LinkButton href={`/categories/${category.id}`} variant="secondary" size="sm">Sửa</LinkButton>
                <DeleteButton action={deleteCategoryAction.bind(null, category.id)} itemLabel={category.name} />
              </div>
            </Td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
