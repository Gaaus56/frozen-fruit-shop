import { STAFF_PERMISSIONS, STAFF_PERMISSION_LABELS, type StaffAccount } from "@frozen-fruit-shop/types";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/ui/delete-button";
import { Section } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { Table, Td, Th } from "@/components/ui/table";
import { api } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { deleteStaffAction } from "./actions";
import { CreateStaffForm, EditPermissionsForm, ResetPasswordForm, ResetStaffOtpButton, ToggleActiveButton } from "./staff-forms";

export const metadata = { title: "Tài khoản nhân viên" };

export default async function UsersPage() {
  await requireAdmin();
  const users = await api<StaffAccount[]>("/admin/users");

  return (
    <div>
      <PageHeader
        title="Tài khoản nhân viên"
        help="Mỗi nhân viên chỉ thấy và dùng được các mục bạn cấp quyền (bấm «Phân quyền»). Tổng quan doanh thu, thông tin cửa hàng và trang này luôn chỉ dành cho chủ cửa hàng."
      />
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Table
            head={
              <>
                <Th>Tài khoản</Th>
                <Th>Vai trò</Th>
                <Th>Quyền</Th>
                <Th>Đăng nhập gần nhất</Th>
                <Th />
              </>
            }
          >
            {users.map((user) => (
              <tr key={user.id} className={user.isActive ? "" : "bg-muted/40"}>
                <Td>
                  <span className="font-bold">{user.name}</span>
                  <span className="block text-xs text-foreground/55">{user.email}</span>
                </Td>
                <Td>
                  {user.role === "ADMIN" ? <Badge tone="red">Quản trị</Badge> : <Badge tone="blue">Nhân viên</Badge>}{" "}
                  {!user.isActive ? <Badge>Đã khoá</Badge> : null}{" "}
                  {user.otpEnabled ? <Badge tone="green">OTP</Badge> : null}
                </Td>
                <Td className="max-w-xs">
                  {user.role === "ADMIN" ? (
                    <span className="text-xs text-foreground/60">Toàn quyền</span>
                  ) : user.permissions.length === 0 ? (
                    <span className="text-xs font-semibold text-accent-700">Chưa cấp quyền nào</span>
                  ) : user.permissions.length === STAFF_PERMISSIONS.length ? (
                    <span className="text-xs text-foreground/60">Mọi mục nhân viên</span>
                  ) : (
                    <span className="flex flex-wrap gap-1">
                      {user.permissions.map((permission) => (
                        <Badge key={permission}>{STAFF_PERMISSION_LABELS[permission].label}</Badge>
                      ))}
                    </span>
                  )}
                </Td>
                <Td className="whitespace-nowrap text-foreground/70">{formatDateTime(user.lastLoginAt)}</Td>
                <Td>
                  {user.role === "STAFF" ? (
                    <div className="flex flex-col items-end gap-1.5">
                      <EditPermissionsForm id={user.id} name={user.name} permissions={user.permissions} />
                      <ResetPasswordForm id={user.id} />
                      <ToggleActiveButton id={user.id} isActive={user.isActive} />
                      {user.otpEnabled ? <ResetStaffOtpButton id={user.id} name={user.name} /> : null}
                      <DeleteButton
                        action={deleteStaffAction.bind(null, user.id)}
                        itemLabel={user.name}
                        confirmText={`Xoá tài khoản "${user.name}"? Lịch sử xử lý đơn vẫn được giữ. Nếu chỉ tạm ngừng, hãy dùng "Khoá".`}
                      />
                    </div>
                  ) : (
                    <span className="block text-right text-xs text-foreground/50">Đổi mật khẩu ở “Tài khoản của tôi”</span>
                  )}
                </Td>
              </tr>
            ))}
          </Table>
        </div>
        <Section title="Thêm nhân viên">
          <CreateStaffForm />
        </Section>
      </div>
    </div>
  );
}
