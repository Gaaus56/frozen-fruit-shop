"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import type { AuthUser } from "@frozen-fruit-shop/types";
import { NAV_GROUPS, canSee, homePathFor } from "@/lib/nav";
import { LogoBadge } from "./logo-badge";
import { FadingScrollArea } from "@/components/ui/fading-scroll-area";

export function Sidebar({ user, counts }: { user: AuthUser; counts: { orders: number; inquiries: number; comments: number } }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- đóng menu mobile sau khi chuyển trang
  useEffect(() => setIsOpen(false), [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <>
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between bg-ink px-4 text-white lg:hidden print:hidden">
        <Link href={homePathFor(user)} className="flex items-center gap-2.5">
          <LogoBadge className="h-9 w-9 shrink-0" label="Logo Trái Cây Đông Lạnh Đà Nẵng 28" />
          <span className="text-sm font-extrabold uppercase">Quản trị</span>
        </Link>
        {/* Nút 3 gạch (☰) / dấu × khi menu đang mở. */}
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Đóng menu" : "Mở menu"}
          className="flex h-10 w-10 items-center justify-center rounded-md text-white hover:bg-white/10"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="h-6 w-6" aria-hidden>
            {isOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      <aside
        className={`enter-sidebar fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-ink text-white transition-transform print:hidden lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link href={homePathFor(user)} className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          {/* Huy hiệu SVG có nền kem riêng (ảnh PNG cũ nền trong suốt nên chìm vào nền tối). */}
          <LogoBadge className="h-12 w-12 shrink-0 drop-shadow" label="Logo Trái Cây Đông Lạnh Đà Nẵng 28" />
          <span className="leading-tight">
            <span className="block text-sm font-extrabold uppercase">Trái Cây Đông Lạnh</span>
            <span className="block text-sm font-extrabold uppercase text-accent-300">Đà Nẵng 28</span>
          </span>
        </Link>

        {/* Thanh cuộn kiểu Facebook: hiện khi cuộn / rê chuột, tự mờ đi khi ngừng. */}
        <FadingScrollArea>
          <nav className="px-3 py-4">
            {NAV_GROUPS.map((group, groupIndex) => {
              const items = group.items.filter((item) => canSee(user, item));
              if (items.length === 0) return null;
              return (
                <div key={group.title} className="mb-5">
                  <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-white/40">{group.title}</p>
                  <ul className="mt-1.5">
                    {items.map((item, itemIndex) => {
                      const active = isActive(item.href);
                      const count = item.badgeKey ? counts[item.badgeKey] : 0;
                      return (
                        // --i: thứ tự hiện lần lượt khi vừa đăng nhập (globals.css "Hiệu ứng sau đăng nhập").
                        <li key={item.href} className="enter-nav-item" style={{ "--i": groupIndex * 3 + itemIndex } as CSSProperties}>
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
        </FadingScrollArea>

        {/* Bấm vào tên → Tài khoản của tôi (đổi mật khẩu, đăng xuất). */}
        <Link
          href="/account"
          className={`block border-t border-white/10 px-5 py-4 transition-colors hover:bg-white/5 ${isActive("/account") ? "bg-white/10" : ""}`}
        >
          <span className="block min-w-0">
            <span className="block truncate text-sm font-bold">{user.name}</span>
            <span className="block truncate text-xs text-white/50">{user.role === "ADMIN" ? "Quản trị viên" : "Nhân viên"} · {user.email}</span>
          </span>
        </Link>
      </aside>

      {isOpen ? <button type="button" aria-label="Đóng menu" onClick={() => setIsOpen(false)} className="fixed inset-0 z-30 bg-black/40 lg:hidden" /> : null}
    </>
  );
}
