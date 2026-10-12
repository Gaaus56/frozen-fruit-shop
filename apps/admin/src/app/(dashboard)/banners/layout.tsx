import { requirePermission } from "@/lib/auth";

/** Nhân viên chưa được cấp quyền "banners" không vào được mục này (kể cả gõ thẳng đường dẫn). */
export default async function Layout({ children }: { children: React.ReactNode }) {
  await requirePermission("banners");
  return children;
}
