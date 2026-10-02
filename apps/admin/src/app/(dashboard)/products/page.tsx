import Link from "next/link";
import type { Category, Product } from "@frozen-fruit-shop/types";
import { Badge } from "@/components/ui/badge";
import { LinkButton, buttonClass } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import { inputClass } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { Table, Td, Th } from "@/components/ui/table";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { deleteProductAction, toggleProductActiveAction } from "./actions";

export const metadata = { title: "Sản phẩm" };

function priceRange(product: Product) {
  const prices = product.variants.map((variant) => variant.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? formatCurrency(min) : `${formatCurrency(min)} – ${formatCurrency(max)}`;
}

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const categoryId = typeof params.categoryId === "string" ? params.categoryId : "";
  const status = params.status === "active" || params.status === "inactive" ? params.status : "all";

  const search = new URLSearchParams({ status });
  if (q) search.set("q", q);
  if (categoryId) search.set("categoryId", categoryId);
  const [products, categories] = await Promise.all([
    api<Product[]>(`/admin/products?${search.toString()}`),
    api<Category[]>("/admin/categories"),
  ]);

  return (
    <div>
      <PageHeader
        title="Sản phẩm"
        description={`${products.length} sản phẩm`}
        action={
          categories.length > 0 ? (
            <LinkButton href="/products/new">+ Thêm sản phẩm</LinkButton>
          ) : (
            <LinkButton href="/categories/new" variant="secondary">Tạo danh mục trước</LinkButton>
          )
        }
      />

      <form action="/products" className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
        <input name="q" defaultValue={q} placeholder="Tìm theo tên sản phẩm" className={`${inputClass} mt-0`} />
        <select name="categoryId" defaultValue={categoryId} className={`${inputClass} mt-0`}>
          <option value="">Mọi danh mục</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        <select name="status" defaultValue={status} className={`${inputClass} mt-0`}>
          <option value="all">Mọi trạng thái</option>
          <option value="active">Đang bán</option>
          <option value="inactive">Đang ẩn</option>
        </select>
        <button type="submit" className={buttonClass("secondary")}>Lọc</button>
      </form>

      <Table
        empty={products.length === 0 && (q || categoryId || status !== "all" ? "Không có sản phẩm khớp bộ lọc." : "Chưa có sản phẩm nào.")}
        head={
          <>
            <Th>Sản phẩm</Th>
            <Th>Danh mục</Th>
            <Th>Giá</Th>
            <Th>Tồn kho</Th>
            <Th>Hiển thị</Th>
            <Th />
          </>
        }
      >
        {products.map((product) => {
          const outOfStock = product.variants.filter((variant) => variant.stockStatus === "out_of_stock").length;
          const lowStock = product.variants.filter((variant) => variant.stockStatus === "low_stock").length;
          return (
            <tr key={product.id} className={product.isActive ? "" : "bg-muted/40"}>
              <Td>
                <div className="flex items-center gap-3">
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden bg-muted">
                    {product.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element -- ảnh nhỏ từ API
                      <img src={product.images[0].url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    ) : null}
                  </span>
                  <span className="min-w-44">
                    <Link href={`/products/${product.id}`} className="font-bold hover:text-accent-700">{product.name}</Link>
                    <span className="mt-0.5 flex flex-wrap gap-1">
                      {product.isFeatured ? <Badge tone="red">Nổi bật</Badge> : null}
                      {product.isWholesaleAvailable ? <Badge tone="blue">Bán sỉ</Badge> : null}
                      {product.images.length === 0 ? <Badge tone="amber">Chưa có ảnh</Badge> : null}
                    </span>
                  </span>
                </div>
              </Td>
              <Td className="text-foreground/70">{product.category.name}</Td>
              <Td className="whitespace-nowrap">
                {priceRange(product)}
                <span className="block text-xs text-foreground/50">{product.variants.length} quy cách</span>
              </Td>
              <Td>
                {outOfStock > 0 ? <Badge tone="red">{outOfStock} hết hàng</Badge> : null}{" "}
                {lowStock > 0 ? <Badge tone="amber">{lowStock} sắp hết</Badge> : null}
                {outOfStock + lowStock === 0 ? <Badge tone="green">Còn hàng</Badge> : null}
              </Td>
              <Td>
                <form action={toggleProductActiveAction.bind(null, product.id, !product.isActive)}>
                  <button type="submit" className={`text-xs font-bold underline-offset-2 hover:underline ${product.isActive ? "text-leaf-700" : "text-foreground/50"}`}>
                    {product.isActive ? "● Đang bán" : "○ Đang ẩn"}
                  </button>
                </form>
              </Td>
              <Td>
                <div className="flex justify-end gap-2">
                  <LinkButton href={`/products/${product.id}`} variant="secondary" size="sm">Sửa</LinkButton>
                  <DeleteButton
                    action={deleteProductAction.bind(null, product.id)}
                    itemLabel={product.name}
                    confirmText={`Xoá vĩnh viễn "${product.name}"? Đơn hàng cũ vẫn giữ tên và giá. Nếu chỉ muốn tạm ngừng bán, hãy bấm "Đang bán" để ẩn.`}
                  />
                </div>
              </Td>
            </tr>
          );
        })}
      </Table>
    </div>
  );
}
