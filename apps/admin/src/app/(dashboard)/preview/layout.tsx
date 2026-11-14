import { requireAdmin } from "@/lib/auth";

/** Xem trước & sửa chỉ dành cho ADMIN (bấm "Sửa" có thể mở mục nhân viên chưa được cấp quyền). */
export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return children;
}
