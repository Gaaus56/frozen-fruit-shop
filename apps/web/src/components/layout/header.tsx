"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { categories } from "@frozen-fruit-shop/fixtures";
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
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isDropdownSuppressed, setIsDropdownSuppressed] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMenuOpen]);

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

      <div className="relative h-0 bg-background lg:h-auto">
        <Container className="hidden h-16 items-center gap-6 lg:flex lg:pl-52">
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
          className="absolute left-3 top-0 z-50 flex h-[5.75rem] w-20 justify-center rounded-b-full bg-[#1f6b3f] pt-2 shadow-xl lg:left-8 lg:h-[9.5rem] lg:w-36 lg:pt-3"
        >
          <span className="logo-shine relative block h-16 w-16 overflow-hidden rounded-full ring-2 ring-white lg:h-28 lg:w-28 lg:ring-4">
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
          className={`flex h-16 items-center justify-between gap-3 transition-[padding] duration-300 lg:h-12 ${
            isScrolled ? "pl-4 sm:pl-6 lg:pl-8" : "pl-28 sm:pl-28 lg:pl-52"
          }`}
        >
          <div className={`min-w-0 leading-tight lg:hidden ${isScrolled ? "hidden" : "block"}`}>
            <Link
              href="/"
              className="block truncate text-[13px] font-extrabold uppercase tracking-tight text-accent-700 min-[420px]:text-[15px]"
            >
              Trái Cây Đông Lạnh 28
            </Link>
            <a
              href="tel:0934568196"
              className="mt-0.5 flex items-center gap-1 text-xs font-extrabold text-[#1f6b3f] min-[420px]:text-sm"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.3.2 2.5.6 3.6a1 1 0 0 1-.25 1z" />
              </svg>
              0934 568 196
            </a>
          </div>

          <Link
            href="/"
            aria-label="Trang chủ"
            tabIndex={isScrolled ? 0 : -1}
            aria-hidden={!isScrolled}
            className={`flex items-center gap-2.5 overflow-hidden whitespace-nowrap transition-all duration-300 ${
              isScrolled ? "max-w-[15rem] opacity-100" : "pointer-events-none max-w-0 opacity-0"
            }`}
          >
            <span className="logo-shine relative block h-10 w-10 shrink-0 overflow-hidden rounded-full">
              <LogoBadge className="h-full w-full" />
            </span>
            <span className="text-sm font-extrabold uppercase text-accent-700">Trái Cây Đông Lạnh 28</span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              const hasDropdown = link.href === "/products";
              return (
                <div
                  key={link.href}
                  className="group/nav relative"
                  onMouseLeave={() => setIsDropdownSuppressed(false)}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsDropdownSuppressed(true)}
                    aria-current={active ? "page" : undefined}
                    aria-haspopup={hasDropdown ? "menu" : undefined}
                    className={`group relative flex items-center gap-0.5 py-0.5 text-[15px] font-bold uppercase transition-colors hover:text-accent-700 ${
                      active ? "text-accent-700" : "text-foreground/85"
                    }`}
                  >
                    <span className="relative">
                      {link.label}
                      <span
                        aria-hidden
                        className={`absolute -bottom-0.5 left-0 h-[3px] w-full bg-accent-700 transition-opacity ${
                          active ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    </span>
                    {hasDropdown ? <ChevronIcon /> : null}
                  </Link>

                  {hasDropdown ? (
                    <div className={`invisible absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 pt-4 opacity-0 transition-all duration-200 ${
                        isDropdownSuppressed
                          ? ""
                          : "group-has-[:focus-visible]/nav:visible group-has-[:focus-visible]/nav:opacity-100 group-hover/nav:visible group-hover/nav:opacity-100"
                      }`}>
                      <ul className="border-t-2 border-accent-700 bg-background py-2 shadow-2xl ring-1 ring-divider" role="menu">
                        {categories.map((category) => (
                          <li key={category.id} role="none">
                            <Link
                              role="menuitem"
                              href={`/products?category=${category.slug}`}
                              onClick={() => setIsDropdownSuppressed(true)}
                              className="block border-b border-divider px-5 py-3 text-sm font-semibold normal-case text-foreground/75 last:border-b-0 hover:bg-surface hover:text-accent-700"
                            >
                              {category.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="hidden h-9 w-9 items-center justify-center border border-divider text-foreground/85 hover:border-accent-600 hover:text-accent-600 sm:inline-flex"
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
              aria-controls="mobile-menu"
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              <MenuIcon />
            </button>
          </div>
        </Container>
      </header>

      <div
        className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 lg:hidden ${
          isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden
      />
      <aside
        id="mobile-menu"
        aria-label="Menu"
        aria-hidden={!isMenuOpen}
        className="fixed inset-y-0 left-0 z-[70] flex w-80 max-w-[85vw] flex-col bg-background shadow-2xl lg:hidden"
        style={{
          transform: isMenuOpen ? "translateX(0)" : "translateX(-105%)",
          visibility: isMenuOpen ? "visible" : "hidden",
          transition: `transform 300ms cubic-bezier(0.22, 1, 0.36, 1), visibility 0s linear ${isMenuOpen ? "0s" : "300ms"}`,
        }}
      >
        <div className="flex h-16 shrink-0 items-center justify-between gap-3 bg-[#1f6b3f] px-4 text-white">
          <span className="flex min-w-0 items-center gap-3">
            <span className="logo-shine relative block h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-white">
              <LogoBadge className="h-full w-full" />
            </span>
            <span className="truncate text-sm font-extrabold uppercase">Trái Cây Đông Lạnh 28</span>
          </span>
          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Đóng menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center hover:bg-white/15"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {NAV_LINKS.map((link) => (
            <div key={link.href} className="border-b border-divider">
              <div className="flex items-stretch">
                <Link
                  href={link.href}
                  className={`flex-1 border-l-4 px-4 py-3.5 text-sm font-bold uppercase hover:bg-surface hover:text-accent-700 ${
                    isActive(link.href) ? "border-accent-700 text-accent-700" : "border-transparent text-foreground/85"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
                {link.href === "/products" ? (
                  <button
                    type="button"
                    onClick={() => setIsProductsOpen((open) => !open)}
                    aria-expanded={isProductsOpen}
                    aria-label="Xem các loại sản phẩm"
                    className="px-5 text-foreground/70 hover:text-accent-700"
                  >
                    <ChevronIcon open={isProductsOpen} />
                  </button>
                ) : null}
              </div>
              {link.href === "/products" && isProductsOpen ? (
                <ul className="bg-surface/60 pb-2">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Link
                        href={`/products?category=${category.slug}`}
                        className="block px-9 py-2.5 text-sm text-foreground/75 hover:text-accent-700"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </nav>

        <div className="flex flex-col gap-3 border-t border-divider p-4">
          <a
            href="tel:0934568196"
            className="flex items-center justify-center gap-2 bg-[#1f6b3f] px-4 py-3 text-sm font-extrabold text-white hover:bg-[#154d2d]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.3.2 2.5.6 3.6a1 1 0 0 1-.25 1z" />
            </svg>
            Gọi 0934 568 196
          </a>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center justify-center gap-2 border border-divider px-4 py-2.5 text-sm font-bold text-foreground/85 hover:border-accent-600 hover:text-accent-600"
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            {theme === "dark" ? "Giao diện sáng" : "Giao diện tối"}
          </button>
        </div>
      </aside>
    </>
  );
}

function ChevronIcon({ open = false }: { open?: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`transition-transform duration-200 group-hover/nav:rotate-180 ${open ? "rotate-180" : ""}`}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
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
