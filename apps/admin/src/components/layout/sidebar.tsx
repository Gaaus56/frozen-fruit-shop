"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { AuthUser } from "@frozen-fruit-shop/types";

interface NavItem {
  href: string;
  label: string;
  adminOnly?: boolean;
  badgeKey?: "orders" | "inquiries" | "comments";
}

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Bán hàng",
    items: [
      { href: "/", label: "Tổng quan", adminOnly: true },
      { href: "/orders", label: "Đơn hàng", badgeKey: "orders" },
      { href: "/inquiries", label: "Liên hệ & báo giá", badgeKey: "inquiries" },
    ],
  },
  {
    title: "Sản phẩm",
    items: [
      { href: "/products", label: "Sản phẩm" },
      { href: "/categories", label: "Danh mục" },
    ],
  },
  {
    title: "Nội dung web",
    items: [
      { href: "/preview", label: "Xem trước & sửa" },
      { href: "/banners", label: "Banner" },
      { href: "/home-blocks", label: "Khối trang chủ" },
      { href: "/posts", label: "Bài viết" },
      { href: "/comments", label: "Bình luận", badgeKey: "comments" },
      { href: "/pages/about", label: "Trang Giới thiệu" },
      { href: "/policies", label: "Chính sách" },
      { href: "/settings", label: "Thông tin cửa hàng", adminOnly: true },
    ],
  },
  {
    title: "Hệ thống",
    items: [
      { href: "/users", label: "Tài khoản nhân viên", adminOnly: true },
      { href: "/account", label: "Tài khoản của tôi" },
    ],
  },
];

export function Sidebar({ user, counts }: { user: AuthUser; counts: { orders: number; inquiries: number; comments: number } }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- đóng menu mobile sau khi chuyển trang
  useEffect(() => setIsOpen(false), [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <>
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between bg-ink px-4 text-white lg:hidden print:hidden">
        <span className="text-sm font-extrabold uppercase">Quản trị · Trái Cây 28</span>
        <button type="button" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen} className="border border-white/25 px-3 py-1.5 text-sm font-bold">
          {isOpen ? "Đóng" : "Menu"}
        </button>
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-ink text-white transition-transform print:hidden lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link href={user.role === "ADMIN" ? "/" : "/orders"} className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <span className="relative block h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-white/80">
            <Image src="/images/logo-28fruit.png" alt="" fill sizes="44px" className="object-cover" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-extrabold uppercase">Trái Cây Đông Lạnh</span>
            <span className="block text-sm font-extrabold uppercase text-accent-300">Đà Nẵng 28</span>
          </span>
        </Link>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((group) => {
            const items = group.items.filter((item) => !item.adminOnly || user.role === "ADMIN");
            if (items.length === 0) return null;
            return (
              <div key={group.title} className="mb-5">
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-white/40">{group.title}</p>
                <ul className="mt-1.5">
                  {items.map((item) => {
                    const active = isActive(item.href);
                    const count = item.badgeKey ? counts[item.badgeKey] : 0;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={`flex items-center justify-between border-l-4 px-3 py-2 text-sm font-semibold transition-colors ${
                            active ? "border-accent-600 bg-white/10 text-white" : "border-transparent text-white/70 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          {item.label}
                          {count > 0 ? (
                            <span className="min-w-5 bg-accent-600 px-1.5 text-center text-[11px] font-extrabold leading-5 text-white">{count}</span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-5 py-4">
          <p className="truncate text-sm font-bold">{user.name}</p>
          <p className="truncate text-xs text-white/50">
            {user.role === "ADMIN" ? "Quản trị viên" : "Nhân viên"} · {user.email}
          </p>
          <a href="/logout" className="mt-3 inline-block text-xs font-bold text-white/70 underline-offset-2 hover:text-accent-300 hover:underline">
            Đăng xuất
          </a>
        </div>
      </aside>

      {isOpen ? <button type="button" aria-label="Đóng menu" onClick={() => setIsOpen(false)} className="fixed inset-0 z-30 bg-black/40 lg:hidden" /> : null}
    </>
  );
}
