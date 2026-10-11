import { PageHeader } from "@/components/ui/page-header";
import { getProductOptions } from "@/lib/product-options";
import { HomeBlockForm } from "../home-block-form";

export const metadata = { title: "Thêm khối trang chủ" };

export default async function NewHomeBlockPage() {
  return (
    <div>
      <PageHeader back={{ href: "/home-blocks", label: "Khối trang chủ" }} title="Thêm khối trang chủ" />
      <HomeBlockForm products={await getProductOptions()} />
    </div>
  );
}
