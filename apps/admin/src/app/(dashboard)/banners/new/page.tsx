import { BANNER_PLACEMENTS } from "@frozen-fruit-shop/types";
import { PageHeader } from "@/components/ui/page-header";
import { BannerForm } from "../banner-form";
import { getLinkOptionGroups } from "../link-options";

export const metadata = { title: "Thêm banner" };

export default async function NewBannerPage({ searchParams }: PageProps<"/banners/new">) {
  const { placement } = await searchParams;
  return (
    <div>
      <PageHeader back={{ href: "/banners", label: "Banner" }} title="Thêm banner" />
      <BannerForm linkGroups={await getLinkOptionGroups()} defaultPlacement={BANNER_PLACEMENTS.find((value) => value === placement) ?? "home"} />
    </div>
  );
}
