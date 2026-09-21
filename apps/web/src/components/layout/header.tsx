"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Container } from "@/components/ui/container";
import { useCart } from "@/lib/cart-context";
import { useTheme } from "@/lib/theme-context";
import { LogoBadge } from "./logo-badge";

const NAV_LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/products", label: "Sản phẩm" },
  { href: "/about", label: "Giới thiệu" },
  { href: "/wholesale", label: "Đặt hàng sỉ" },
  { href: "/news", label: "Tin tức" },
  { href: "/contact", label: "Liên hệ" },
];

const FEATURES = [
  {
    title: "Chuẩn VietGAP",
    description: "Đạt tiêu chuẩn an toàn thực phẩm",
    path: "M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z M9 12l2 2 4-4",
  },
  {
    title: "Không chất bảo quản",
    description: "Cấp đông tự nhiên, giữ vị thật",
    path: "M4 20c8-1 14-7 15-16-9 1-15 7-16 16z M4 20c2-4 5-7 9-9",
  },
  {
    title: "Hút chân không",
    description: "Giữ trọn dinh dưỡng",
    path: "M3 7l9-4 9 4-9 4-9-4z M3 7v10l9 4 9-4V7 M12 11v10",
  },
  {
    title: "Giao hàng lạnh toàn quốc",
    description: "Thùng giữ lạnh chuyên dụng",
    path: "M2 7h13v9H2z M15 10h4l3 3v3h-7z",
  },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalQuantity } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 150);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="overflow-hidden bg-accent-700 text-white">
        <div className="marquee py-2 text-[13px] font-semibold">
          <span className="marquee-track">
            Chào mừng bạn đến với Trái Cây Đông Lạnh 28 — Trái cây đông lạnh cấp đông nhanh, không chất bảo quản —
            Hotline: 0934 568 196 — Giao hàng lạnh toàn quốc
          </span>
        </div>
      </div>

      <div className="relative bg-background">
        <Container className="flex h-[4.5rem] items-center gap-6 pl-44 sm:pl-48 lg:pl-56">
          <Link href="/" className="text-accent-700 lg:hidden">
            <span className="block text-base font-extrabold uppercase leading-tight tracking-tight">
              Trái Cây Đông Lạnh 28
            </span>
            <span className="block text-sm font-extrabold">0934 568 196</span>
          </Link>

          <ul className="hidden flex-1 items-center lg:flex">
            {FEATURES.map((feature, index) => (
              <li
                key={feature.title}
                className={`flex flex-1 items-center gap-3 border-divider px-4 ${
                  index > 0 ? "border-l" : ""
                } ${index === FEATURES.length - 1 ? "hidden xl:flex" : ""}`}
              >
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  className="shrink-0 text-leaf"
                >
                  <path d={feature.path} />
                </svg>
                <span>
                  <span className="block text-sm font-extrabold leading-tight text-foreground">{feature.title}</span>
                  <span className="block text-xs leading-snug text-foreground/65">{feature.description}</span>
                </span>
              </li>
            ))}
          </ul>
        </Container>

        <Link
          href="/"
          aria-label="Trái Cây Đông Lạnh 28 — Trang chủ"
          className="absolute left-4 top-0 z-50 flex h-[10.5rem] w-40 justify-center rounded-b-full bg-[#1f6b3f] pt-4 shadow-xl sm:left-6 lg:left-8"
        >
          <span className="logo-shine relative block h-32 w-32 overflow-hidden rounded-full ring-4 ring-white">
            <LogoBadge className="h-full w-full" />
          </span>
        </Link>
      </div>

      <header
        className={`sticky top-0 z-40 border-b border-divider backdrop-blur transition-shadow duration-300 ${
          isScrolled ? "bg-background shadow-lg shadow-black/15" : "bg-background/95"
        }`}
      >
        <Container
          className={`flex h-14 items-center justify-end gap-4 transition-[padding] duration-300 lg:justify-between ${
            isScrolled ? "pl-4" : "pl-44 sm:pl-48 lg:pl-56"
          }`}
        >
          <Link
            href="/"
            aria-label="Trang chủ"
            tabIndex={isScrolled ? 0 : -1}
            aria-hidden={!isScrolled}
            className={`mr-auto flex items-center gap-2.5 overflow-hidden whitespace-nowrap transition-all duration-300 lg:mr-2 ${
              isScrolled ? "max-w-[15rem] opacity-100" : "pointer-events-none max-w-0 opacity-0"
            }`}
          >
            <span className="logo-shine relative block h-10 w-10 shrink-0 overflow-hidden rounded-full">
              <LogoBadge className="h-full w-full" />
            </span>
            <span className="text-sm font-extrabold uppercase text-accent-700">Trái Cây Đông Lạnh 28</span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
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
              href="/cart"
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
