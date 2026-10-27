import type { Comment, Inquiry, Order, Paginated } from "@frozen-fruit-shop/types";
import { LiveUpdates } from "@/components/layout/live-updates";
import { PreviewReturn } from "@/components/layout/preview-return";
import { Suspense } from "react";
import { hasPermission, type AuthUser } from "@frozen-fruit-shop/types";
import Link from "next/link";
import { EnterAnimation } from "@/components/layout/enter-animation";
import { OtpStepUpDialog } from "@/components/layout/otp-step-up-dialog";
import { ForbiddenNotice } from "@/components/layout/forbidden-notice";
import { Sidebar } from "@/components/layout/sidebar";
import { api } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

/** Số việc cần xử lý cạnh menu — chỉ hỏi mục tài khoản có quyền; lỗi một mục không làm hỏng mục khác. */
async function loadCounts(user: AuthUser) {
  const count = async <T,>(allowed: boolean, path: string) =>
    allowed ? api<Paginated<T>>(path).then((page) => page.total).catch(() => 0) : 0;
  const [orders, inquiries, comments] = await Promise.all([
    count<Order>(hasPermission(user, "orders"), "/admin/orders?status=pending&pageSize=1"),
    count<Inquiry>(hasPermission(user, "inquiries"), "/admin/inquiries?status=new&pageSize=1"),
    count<Comment>(hasPermission(user, "comments"), "/admin/comments?status=pending&pageSize=1"),
  ]);
  return { orders, inquiries, comments };
}

export default async function DashboardLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  const counts = await loadCounts(user);

  return (
    <div className="lg:flex">
      <Sidebar user={user} counts={counts} />
      <main className="enter-main min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8 print:p-0">
        <Suspense fallback={null}>
          <ForbiddenNotice />
        </Suspense>
        {/* Chủ cửa hàng chưa bật xác thực 2 lớp: nhắc ở mọi trang tới khi bật. */}
        {user.role === "ADMIN" && !user.otpEnabled ? (
          <p className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 border-l-4 border-amber-500 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
            <strong>Tài khoản chủ cửa hàng chưa bật xác thực 2 lớp (OTP).</strong>
            <span>Lộ mật khẩu là người khác vào được toàn bộ trang quản trị.</span>
            <Link href="/account#otp" className="font-bold underline">
              Bật ngay ›
            </Link>
          </p>
        ) : null}
        {children}
      </main>
      <LiveUpdates />
      <EnterAnimation />
      <OtpStepUpDialog />
      <PreviewReturn />
    </div>
  );
}
