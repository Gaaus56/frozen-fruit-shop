import type { SiteSettings } from "@frozen-fruit-shop/types";
import { PageHeader } from "@/components/ui/page-header";
import { api } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { getLinkOptionGroups } from "../banners/link-options";
import { SettingsForm } from "./settings-form";

export const metadata = { title: "Thông tin cửa hàng" };

export default async function SettingsPage() {
  await requireAdmin();
  const [settings, linkGroups] = await Promise.all([api<SiteSettings>("/admin/settings"), getLinkOptionGroups()]);
  // Thêm lựa chọn "Gọi hotline" cho thẻ cam kết ({phone} được web thay bằng số hotline hiện tại).
  linkGroups.unshift({ label: "Gọi điện", options: [{ label: "Gọi hotline", value: "tel:{phone}" }] });

  return (
    <div>
      <PageHeader title="Thông tin cửa hàng" description="Thông tin liên hệ, địa chỉ, thanh toán hiển thị trên toàn bộ website khách hàng." />
      <SettingsForm settings={settings} linkGroups={linkGroups} />
    </div>
  );
}
