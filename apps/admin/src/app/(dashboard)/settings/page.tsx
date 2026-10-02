import type { SiteSettings } from "@frozen-fruit-shop/types";
import { PageHeader } from "@/components/ui/page-header";
import { api } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { SettingsForm } from "./settings-form";

export const metadata = { title: "Thông tin cửa hàng" };

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await api<SiteSettings>("/admin/settings");

  return (
    <div>
      <PageHeader title="Thông tin cửa hàng" description="Thông tin liên hệ, địa chỉ, thanh toán hiển thị trên toàn bộ website khách hàng." />
      <SettingsForm settings={settings} />
    </div>
  );
}
