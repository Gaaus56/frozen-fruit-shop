import { Section } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentUser } from "@/lib/auth";
import { ChangePasswordForm } from "./change-password-form";

export const metadata = { title: "Tài khoản của tôi" };

export default async function AccountPage() {
  const user = await getCurrentUser();

  return (
    <div>
      <PageHeader title="Tài khoản của tôi" />
      <div className="grid max-w-4xl grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <Section title="Thông tin">
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            <dt className="text-foreground/55">Họ tên</dt>
            <dd className="font-semibold">{user.name}</dd>
            <dt className="text-foreground/55">Email</dt>
            <dd className="font-semibold">{user.email}</dd>
            <dt className="text-foreground/55">Vai trò</dt>
            <dd className="font-semibold">{user.role === "ADMIN" ? "Quản trị viên" : "Nhân viên"}</dd>
          </dl>
          {user.role === "STAFF" ? (
            <p className="text-xs text-foreground/55">Cần đổi họ tên hoặc email? Liên hệ quản trị viên.</p>
          ) : null}
        </Section>
        <Section title="Đổi mật khẩu">
          <ChangePasswordForm minLength={8} />
        </Section>
      </div>
    </div>
  );
}
