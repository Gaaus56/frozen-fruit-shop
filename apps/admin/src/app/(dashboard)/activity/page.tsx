import Link from "next/link";
import { AUDIT_RESOURCE_LABELS, type AuditLogEntry, type Paginated, type StaffAccount } from "@frozen-fruit-shop/types";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { inputClass } from "@/components/ui/form";
import { api } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { ACTION_LABELS, fieldLabel, valueLabel } from "./labels";

export const metadata = { title: "Lịch sử chỉnh sửa" };

const ACTION_TONE: Record<string, "green" | "blue" | "red" | "amber"> = {
  create: "green",
  update: "blue",
  delete: "red",
  "reset-password": "amber",
  "reset-otp": "amber",
  "otp-enable": "green",
  "otp-disable": "amber",
};

/** Mục có trang sửa riêng theo id (app/(dashboard)/<mục>/[id]) — chỉ những mục này mới có link "Mở bản ghi này". */
const HAS_DETAIL_PAGE = new Set(["banners", "categories", "home-blocks", "orders", "policies", "posts", "products"]);

/**
 * Link mở thẳng bản ghi; `null` = ẩn nút (đã xoá, hoặc mục không có trang riêng như Liên hệ & báo giá, Bình luận —
 * xử lý ngay trong danh sách) để không dẫn tới trang 404.
 */
function entityHref(entry: AuditLogEntry): string | null {
  if (entry.action === "delete") return null;
  if (entry.resource === "settings") return "/settings";
  if (entry.resource === "pages" && entry.entityId) return `/pages/${entry.entityId}`;
  if (entry.resource === "users") return "/users";
  return entry.entityId && HAS_DETAIL_PAGE.has(entry.resource) ? `/${entry.resource}/${entry.entityId}` : null;
}

export default async function ActivityPage({ searchParams }: PageProps<"/activity">) {
  await requireAdmin();
  const params = await searchParams;
  const userId = typeof params.userId === "string" ? params.userId : undefined;
  const resource = typeof params.resource === "string" ? params.resource : undefined;
  const page = Number(params.page) || 1;

  const query = new URLSearchParams({ page: String(page), pageSize: "30" });
  if (userId) query.set("userId", userId);
  if (resource) query.set("resource", resource);
  const [data, users] = await Promise.all([api<Paginated<AuditLogEntry>>(`/admin/audit-logs?${query}`), api<StaffAccount[]>("/admin/users")]);

  return (
    <div>
      <PageHeader
        title="Lịch sử chỉnh sửa"
        help="Ai đã thêm / sửa / xoá gì trong trang quản trị, lúc nào. Bấm vào một dòng để xem từng trường đã đổi (trước → sau)."
      />

      <form className="mb-4 flex flex-wrap items-end gap-3" action="/activity">
        <label className="text-sm">
          <span className="font-semibold">Người sửa</span>
          <select name="userId" defaultValue={userId ?? ""} className={`${inputClass} min-w-48`}>
            <option value="">Tất cả</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="font-semibold">Mục</span>
          <select name="resource" defaultValue={resource ?? ""} className={`${inputClass} min-w-48`}>
            <option value="">Tất cả</option>
            {Object.entries(AUDIT_RESOURCE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="bg-ink px-4 py-2 text-sm font-bold text-white hover:bg-ink/85">
          Lọc
        </button>
        {userId || resource ? (
          <Link href="/activity" className="px-2 py-2 text-sm font-semibold text-foreground/60 hover:text-accent-700">
            Bỏ lọc
          </Link>
        ) : null}
      </form>

      {data.items.length === 0 ? (
        <p className="border border-divider bg-surface px-5 py-10 text-center text-sm text-foreground/60">Chưa có thay đổi nào.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {data.items.map((entry) => {
            const href = entityHref(entry);
            return (
              <li key={entry.id} className="border border-divider bg-surface">
                <details className="group">
                  <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-muted/40">
                    <span className="w-36 shrink-0 text-xs text-foreground/60">{formatDateTime(entry.createdAt)}</span>
                    <span className="w-44 shrink-0 truncate text-sm font-bold" title={entry.userEmail}>
                      {entry.userName}
                      <span className="block text-xs font-normal text-foreground/50">{entry.userRole === "ADMIN" ? "Chủ cửa hàng" : "Nhân viên"}</span>
                    </span>
                    <Badge tone={ACTION_TONE[entry.action] ?? "neutral"}>{ACTION_LABELS[entry.action] ?? entry.action}</Badge>
                    <span className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
                      {AUDIT_RESOURCE_LABELS[entry.resource] ?? entry.resource}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm">{entry.entityLabel || "—"}</span>
                    <span className="text-xs text-foreground/50">
                      {entry.changes.length > 0 ? `${entry.changes.length} trường` : ""}
                      <span className="ml-2 inline-block transition-transform group-open:rotate-90">›</span>
                    </span>
                  </summary>
                  <div className="border-t border-divider px-4 py-3">
                    {entry.changes.length === 0 ? (
                      <p className="text-sm text-foreground/60">
                        {entry.action === "delete"
                          ? "Đã xoá bản ghi này."
                          : entry.action === "reset-password"
                            ? "Đã đặt mật khẩu mới (không lưu mật khẩu trong lịch sử)."
                            : entry.action === "reset-otp"
                              ? "Đã tắt xác thực 2 lớp của nhân viên (mất điện thoại) — nhân viên tự bật lại sau khi đăng nhập."
                              : entry.action === "otp-enable"
                                ? "Đã bật xác thực 2 lớp (mã OTP từ app trên điện thoại)."
                                : entry.action === "otp-disable"
                                  ? "Đã tắt xác thực 2 lớp."
                                  : "Không có trường nào thay đổi."}
                      </p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs uppercase text-foreground/50">
                            <th className="w-48 py-1 pr-3 font-bold">Trường</th>
                            <th className="py-1 pr-3 font-bold">{entry.action === "create" ? "" : "Trước"}</th>
                            <th className="py-1 font-bold">{entry.action === "create" ? "Giá trị" : "Sau"}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {entry.changes.map((change) => (
                            <tr key={change.field} className="border-t border-divider/60 align-top">
                              <td className="py-1.5 pr-3 font-semibold">{fieldLabel(change.field)}</td>
                              <td className="py-1.5 pr-3 text-foreground/60 line-through decoration-accent-600/40 [overflow-wrap:anywhere]">
                                {entry.action === "create" ? "" : valueLabel(entry.resource, change.field, change.before)}
                              </td>
                              <td className="py-1.5 font-semibold text-leaf-700 [overflow-wrap:anywhere]">
                                {valueLabel(entry.resource, change.field, change.after)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    {href ? (
                      <Link href={href} className="mt-3 inline-block text-xs font-bold text-accent-700 hover:underline">
                        Mở bản ghi này ›
                      </Link>
                    ) : null}
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-4">
        <Pagination page={data.page} pageSize={data.pageSize} total={data.total} basePath="/activity" params={{ userId, resource }} />
      </div>
    </div>
  );
}
