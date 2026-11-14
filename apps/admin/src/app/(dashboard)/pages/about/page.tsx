import type { Page } from "@frozen-fruit-shop/types";
import { PageHeader } from "@/components/ui/page-header";
import { api } from "@/lib/api";
import { getProductOptions } from "@/lib/product-options";
import { PageForm } from "../page-form";

export const metadata = { title: "Trang Giới thiệu" };

export default async function AboutPageEditor() {
  const [page, products] = await Promise.all([api<Page>("/admin/pages/about"), getProductOptions()]);
  return (
    <div>
      <PageHeader title="Trang Giới thiệu" help="Nội dung trang /about trên website: câu chuyện cửa hàng, cam kết chất lượng, hình ảnh." />
      <PageForm page={page} products={products} />
    </div>
  );
}
