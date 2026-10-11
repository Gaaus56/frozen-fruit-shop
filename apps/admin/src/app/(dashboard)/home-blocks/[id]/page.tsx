import { notFound } from "next/navigation";
import type { HomeBlock } from "@frozen-fruit-shop/types";
import { PageHeader } from "@/components/ui/page-header";
import { ApiError, api } from "@/lib/api";
import { getProductOptions } from "@/lib/product-options";
import { HomeBlockForm } from "../home-block-form";

export const metadata = { title: "Sửa khối trang chủ" };

export default async function EditHomeBlockPage({ params }: PageProps<"/home-blocks/[id]">) {
  const { id } = await params;
  const block = await api<HomeBlock>(`/admin/home-blocks/${id}`).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });

  return (
    <div>
      <PageHeader back={{ href: "/home-blocks", label: "Khối trang chủ" }} title={`Sửa: ${block.title || "Khối không tiêu đề"}`} />
      <HomeBlockForm block={block} products={await getProductOptions()} />
    </div>
  );
}
