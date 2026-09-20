"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Container } from "@/components/ui/container";
import { useCart } from "@/lib/cart-context";
import { useTheme } from "@/lib/theme-context";

const NAV_LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/san-pham", label: "Sản phẩm" },
  { href: "/gioi-thieu", label: "Giới thiệu" },
  { href: "/dat-hang-si", label: "Đặt hàng sỉ" },
  { href: "/tin-tuc", label: "Tin tức" },
  { href: "/lien-he", label: "Liên hệ" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalQuantity } = useCart();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <div className="overflow-hidden bg-accent-700 text-white">
        <div className="marquee py-2 text-[13px] font-semibold">
          <span className="marquee-track">
            Chào mừng bạn đến với Trái Cây Đông Lạnh 28 — Trái cây đông lạnh cấp đông nhanh, không chất bảo quản — Hotline:
            0934 568 196 — Giao hàng lạnh toàn quốc
          </span>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-divider bg-background/95 backdrop-blur">
        <Container className="relative flex h-20 items-center justify-between gap-4 lg:pl-40">
          <Link
            href="/"
            aria-label="Trái Cây Đông Lạnh 28 — Trang chủ"
            className="absolute left-4 top-0 z-50 flex h-[8.5rem] w-32 justify-center rounded-b-full bg-white pt-3 shadow-lg sm:left-6 lg:left-8"
          >
            <span className="logo-shine relative block h-[6.5rem] w-[6.5rem] overflow-hidden rounded-full">
              <Image
                src="/images/logo.jpg"
                alt="Logo Trái Cây Đông Lạnh 28"
                width={1024}
                height={1024}
                priority
                className="h-full w-full scale-[1.22] object-cover"
              />
            </span>
          </Link>

          <Link
            href="/"
            className="ml-28 hidden text-center leading-tight text-accent-700 sm:block lg:ml-0 xl:block"
          >
            <span className="block text-lg font-extrabold uppercase tracking-tight">Trái Cây Đông Lạnh 28</span>
            <span className="block text-sm font-extrabold">0934 568 196</span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-bold uppercase text-foreground/85 transition-colors hover:text-accent-600"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-9 w-9 items-center justify-center border border-divider text-foreground/85 hover:border-accent-600 hover:text-accent-600"
              aria-label={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
              title="Chuyển giao diện sáng/tối"
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>

            <Link
              href="/gio-hang"
              className="relative inline-flex h-9 w-9 items-center justify-center border border-divider text-foreground/85 transition-colors hover:border-accent-600 hover:text-accent-600"
              aria-label="Giỏ hàng"
            >
              <CartIcon />
              {totalQuantity > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center bg-accent-600 text-xs font-bold text-white">
                  {totalQuantity}
                </span>
              ) : null}
            </Link>

            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center border border-divider text-foreground/85 lg:hidden"
              aria-label="Mở menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              <MenuIcon />
            </button>
          </div>
        </Container>

      {isMenuOpen ? (
        <div className="border-t border-divider bg-background lg:hidden">
          <Container className="flex flex-col gap-1 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-foreground/85 hover:bg-accent-50 hover:text-accent-600"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </Container>
        </div>
      ) : null}
      </header>
    </>
  );
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}
