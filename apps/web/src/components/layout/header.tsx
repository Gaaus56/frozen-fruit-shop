"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { categories } from "@frozen-fruit-shop/fixtures";
import { Container } from "@/components/ui/container";
import { useCart } from "@/lib/cart-context";
import { useTheme } from "@/lib/theme-context";
import { LogoBadge } from "./logo-badge";

const NAV_LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/products", label: "Sản phẩm" },
  { href: "/about", label: "Giới thiệu" },
  { href: "/contact", label: "Liên hệ" },
];

const FEATURES = [
  {
    title: "Chuẩn VietGAP",
    path: "M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z M9 12l2 2 4-4",
  },
  {
    title: "Không chất bảo quản",
    path: "M4 20c8-1 14-7 15-16-9 1-15 7-16 16z M4 20c2-4 5-7 9-9",
  },
  {
    title: "Hút chân không",
    path: "M3 7l9-4 9 4-9 4-9-4z M3 7v10l9 4 9-4V7 M12 11v10",
  },
  {
    title: "Giao hàng lạnh toàn quốc",
    path: "M2 7h13v9H2z M15 10h4l3 3v3h-7z",
  },
];

export function Header() {
  const { totalQuantity } = useCart();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownSuppressed, setIsDropdownSuppressed] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 150);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = searchValue.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  };

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
        <Container
          className="hidden h-16 items-center gap-6 pt-2.5 lg:flex lg:pl-[max(0px,13rem_-_max(0px,(100vw_-_80rem)/2))]"
        >
          <Link href="/" className="shrink-0 whitespace-nowrap leading-tight">
            <span className="block text-xl font-extrabold uppercase tracking-tight text-accent-700">
              Trái Cây Đông Lạnh 28
            </span>
            <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-foreground/55">
              Trái cây đông lạnh chất lượng
            </span>
          </Link>

          <ul className="hidden flex-1 items-center justify-between border-l border-divider pl-6 lg:flex">
            {FEATURES.map((feature, index) => (
              <li
                key={feature.title}
                className={`flex items-center gap-2.5 ${index === FEATURES.length - 1 ? "hidden xl:flex" : ""}`}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  className="shrink-0 text-leaf"
                >
                  <path d={feature.path} />
                </svg>
                <span className="block max-w-32 text-sm font-extrabold leading-tight text-foreground">
                  {feature.title}
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
          className={`flex h-16 items-center justify-between gap-3 transition-[padding] duration-300 lg:h-11 ${
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
                        className={`absolute bottom-0 left-0 h-[3px] w-full bg-accent-700 transition-opacity ${
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
            <form
              onSubmit={submitSearch}
              className="hidden items-center border border-divider focus-within:border-accent-600 lg:flex"
            >
              <input
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Tìm sản phẩm..."
                aria-label="Tìm sản phẩm"
                className="h-9 w-44 bg-background pl-3 text-sm text-foreground outline-none placeholder:text-foreground/45 xl:w-64"
              />
              <button
                type="submit"
                aria-label="Tìm kiếm"
                className="flex h-9 w-9 shrink-0 items-center justify-center text-foreground/85 hover:text-accent-600"
              >
                <SearchIcon />
              </button>
            </form>

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

          </div>
        </Container>
      </header>

      <nav
        aria-label="Điều hướng chính"
        className="fixed inset-x-3 bottom-3 z-50 flex items-center justify-between rounded-full border border-divider bg-background/95 p-1.5 shadow-xl shadow-black/15 backdrop-blur lg:hidden"
      >
        <TabLink href="/" label="Trang chủ" active={isActive("/")} icon={<HomeIcon />} />
        <TabLink href="/products" label="Sản phẩm" active={isActive("/products")} icon={<GridIcon />} />
        {/* Chỗ trống cho nút liên hệ nổi (FloatingContact) nằm giữa thanh. */}
        <span aria-hidden className="w-14 shrink-0" />
        <TabLink href="/about" label="Giới thiệu" active={isActive("/about")} icon={<InfoIcon />} />
        <TabLink href="/contact" label="Liên hệ" active={isActive("/contact")} icon={<ContactIcon />} />
      </nav>
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

function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
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

function TabLink({ href, label, active, icon }: { href: string; label: string; active: boolean; icon: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-1.5 text-[11px] font-bold transition-colors ${
        active ? "text-accent-700" : "text-foreground/65"
      }`}
    >
      {icon}
      <span className="truncate">{label}</span>
    </Link>
  );
}

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V11z" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  );
}

function ContactIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.6-.8L3 21l1.9-5.2A8.4 8.4 0 1 1 21 11.5z" />
    </svg>
  );
}
