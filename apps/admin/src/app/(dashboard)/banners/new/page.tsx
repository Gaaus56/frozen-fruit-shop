import { PageHeader } from "@/components/ui/page-header";
import { BannerForm } from "../banner-form";
import { getLinkOptionGroups } from "../link-options";

export const metadata = { title: "Thêm banner" };

export default async function NewBannerPage() {
  return (
    <div>
      <PageHeader back={{ href: "/banners", label: "Banner" }} title="Thêm banner" />
      <BannerForm linkGroups={await getLinkOptionGroups()} />
    </div>
  );
}
