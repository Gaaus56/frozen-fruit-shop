import type { Inquiry, Order, Paginated } from "@frozen-fruit-shop/types";
import { LiveUpdates } from "@/components/layout/live-updates";
import { Sidebar } from "@/components/layout/sidebar";
import { api } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

async function loadCounts() {
  // Số việc cần xử lý hiển thị cạnh menu; lỗi ở đây không được làm hỏng cả trang.
  try {
    const [orders, inquiries] = await Promise.all([
      api<Paginated<Order>>("/admin/orders?status=pending&pageSize=1"),
      api<Paginated<Inquiry>>("/admin/inquiries?status=new&pageSize=1"),
    ]);
    return { orders: orders.total, inquiries: inquiries.total };
  } catch {
    return { orders: 0, inquiries: 0 };
  }
}

export default async function DashboardLayout({ children }: LayoutProps<"/">) {
  const [user, counts] = await Promise.all([getCurrentUser(), loadCounts()]);

  return (
    <div className="lg:flex">
      <Sidebar user={user} counts={counts} />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8 print:p-0">{children}</main>
      <LiveUpdates />
    </div>
  );
}
