import { notFound } from "next/navigation";
import type { Banner } from "@frozen-fruit-shop/types";
import { PageHeader } from "@/components/ui/page-header";
import { ApiError, api } from "@/lib/api";
import { BannerForm } from "../banner-form";

export const metadata = { title: "Sửa banner" };

export default async function EditBannerPage({ params }: PageProps<"/banners/[id]">) {
  const { id } = await params;
  const banner = await api<Banner>(`/admin/banners/${id}`).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });

  return (
    <div>
      <PageHeader back={{ href: "/banners", label: "Banner" }} title="Sửa banner" />
      <BannerForm banner={banner} />
    </div>
  );
}
