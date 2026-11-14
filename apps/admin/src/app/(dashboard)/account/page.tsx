import { STAFF_PERMISSION_LABELS } from "@frozen-fruit-shop/types";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/layout/logout-button";
import { ChangePasswordForm } from "./change-password-form";

export const metadata = { title: "Tài khoản của tôi" };

export default async function AccountPage() {
  const user = await getCurrentUser();

  return (
    <div>
      <PageHeader
        title="Tài khoản của tôi"
        action={
          // Đăng xuất đặt ở đây (không để ở menu) để tránh bấm nhầm.
          <LogoutButton
            className="inline-flex items-center gap-2 border border-divider bg-surface px-4 py-2 text-sm font-bold text-foreground/80 transition-colors hover:border-accent-600 hover:text-accent-700"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
              <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3" />
            </svg>
            Đăng xuất
          </LogoutButton>
        }
      />
      <div className="grid max-w-4xl grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <Section title="Thông tin">
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            <dt className="text-foreground/55">Họ tên</dt>
            <dd className="font-semibold">{user.name}</dd>
            <dt className="text-foreground/55">Email</dt>
            <dd className="font-semibold">{user.email}</dd>
            <dt className="text-foreground/55">Vai trò</dt>
            <dd className="font-semibold">{user.role === "ADMIN" ? "Quản trị viên" : "Nhân viên"}</dd>
            <dt className="text-foreground/55">Quyền</dt>
            <dd>
              {user.role === "ADMIN" ? (
                <span className="font-semibold">Toàn quyền</span>
              ) : user.permissions.length === 0 ? (
                <span className="font-semibold text-accent-700">Chưa được cấp quyền nào</span>
              ) : (
                <span className="flex flex-wrap gap-1">
                  {user.permissions.map((permission) => (
                    <Badge key={permission}>{STAFF_PERMISSION_LABELS[permission].label}</Badge>
                  ))}
                </span>
              )}
            </dd>
          </dl>
          {user.role === "STAFF" ? (
            <p className="text-xs text-foreground/55">Cần đổi họ tên, email hoặc thêm quyền? Liên hệ chủ cửa hàng.</p>
          ) : null}
        </Section>
        <Section title="Đổi mật khẩu">
          <ChangePasswordForm minLength={8} />
        </Section>
      </div>
    </div>
  );
}
