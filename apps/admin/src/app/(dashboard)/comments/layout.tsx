import { requirePermission } from "@/lib/auth";

/** Nhân viên chưa được cấp quyền "comments" không vào được mục này (kể cả gõ thẳng đường dẫn). */
export default async function Layout({ children }: { children: React.ReactNode }) {
  await requirePermission("comments");
  return children;
}
