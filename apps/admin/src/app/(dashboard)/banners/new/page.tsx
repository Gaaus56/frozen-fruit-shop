import { PageHeader } from "@/components/ui/page-header";
import { BannerForm } from "../banner-form";

export const metadata = { title: "Thêm banner" };

export default function NewBannerPage() {
  return (
    <div>
      <PageHeader back={{ href: "/banners", label: "Banner" }} title="Thêm banner" />
      <BannerForm />
    </div>
  );
}
