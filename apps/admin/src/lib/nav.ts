import { hasPermission, type AuthUser, type StaffPermission } from "@frozen-fruit-shop/types";

/**
 * Menu trang quản trị + quyền cần để thấy từng mục. Dùng chung cho menu bên (client) và
 * kiểm tra quyền ở server (lib/auth.ts → requirePermission, trang đích sau đăng nhập).
 */
export interface NavItem {
  href: string;
  label: string;
  adminOnly?: boolean;
  /** Nhân viên cần quyền này mới thấy mục (ADMIN luôn thấy). */
  permission?: StaffPermission;
  badgeKey?: "orders" | "inquiries" | "comments";
}

export const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Bán hàng",
    items: [
      { href: "/", label: "Tổng quan", adminOnly: true },
      { href: "/orders", label: "Đơn hàng", permission: "orders", badgeKey: "orders" },
      { href: "/inquiries", label: "Liên hệ & báo giá", permission: "inquiries", badgeKey: "inquiries" },
    ],
  },
  {
    title: "Sản phẩm",
    items: [
      { href: "/products", label: "Sản phẩm", permission: "products" },
      { href: "/categories", label: "Danh mục", permission: "categories" },
    ],
  },
  {
    title: "Nội dung web",
    items: [
      { href: "/preview", label: "Xem trước & sửa", adminOnly: true },
      { href: "/banners", label: "Banner", permission: "banners" },
      { href: "/home-blocks", label: "Khối trang chủ", permission: "homeBlocks" },
      { href: "/posts", label: "Bài viết", permission: "posts" },
      { href: "/comments", label: "Bình luận", permission: "comments", badgeKey: "comments" },
      { href: "/pages/about", label: "Trang Giới thiệu", permission: "pages" },
      { href: "/policies", label: "Chính sách", permission: "policies" },
      { href: "/settings", label: "Thông tin cửa hàng", adminOnly: true },
    ],
  },
  {
    title: "Hệ thống",
    items: [
      { href: "/users", label: "Tài khoản nhân viên", adminOnly: true },
      { href: "/activity", label: "Lịch sử chỉnh sửa", adminOnly: true },
      { href: "/account", label: "Tài khoản của tôi" },
    ],
  },
];

/** Mục đầu tiên tài khoản được vào — trang đích khi bấm logo / bị chặn khỏi trang không có quyền. */
export function homePathFor(user: AuthUser): string {
  for (const group of NAV_GROUPS) {
    for (const item of group.items) if (canSee(user, item)) return item.href;
  }
  return "/account";
}

export function canSee(user: AuthUser, item: NavItem) {
  if (item.adminOnly) return user.role === "ADMIN";
  return !item.permission || hasPermission(user, item.permission);
}

