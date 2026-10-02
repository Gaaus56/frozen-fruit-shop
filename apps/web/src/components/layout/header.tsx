"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { formatPhone, type Category, type SiteSettings } from "@frozen-fruit-shop/types";
import { Container } from "@/components/ui/container";
import { useCart } from "@/lib/cart-context";
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

interface HeaderProps {
  settings: SiteSettings;
  categories: Category[];
}

export function Header({ settings, categories }: HeaderProps) {
  const { totalQuantity } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownSuppressed, setIsDropdownSuppressed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  useEffect(() => {
    if (!isSearchOpen) return;
    const focusTimer = window.setTimeout(() => searchInputRef.current?.focus(), 60);
    const onPointerDown = (event: PointerEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) {
        setIsSearchOpen(false);
        setSearchValue("");
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSearchOpen(false);
        setSearchValue("");
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isSearchOpen]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = searchValue.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
    setIsSearchOpen(false);
    setSearchValue("");
  };

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
            {settings.marqueeText ||
              [
                `Chào mừng bạn đến với ${settings.storeName}`,
                `Hotline ${settings.hotlineHours}: ${formatPhone(settings.phone)}`,
                [settings.addressLandmark, settings.address].filter(Boolean).join(", "),
              ]
                .filter(Boolean)
                .join(" — ")}
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
          aria-label={`${settings.storeName} — Trang chủ`}
          className="absolute left-3 top-0 z-50 flex h-[5.75rem] w-20 justify-center rounded-b-full bg-[#1f6b3f] pt-2 shadow-xl lg:left-8 lg:h-[9.5rem] lg:w-36 lg:pt-3"
        >
          <span className="logo-shine relative block h-16 w-16 overflow-hidden rounded-full ring-2 ring-white lg:h-28 lg:w-28 lg:ring-4">
            <LogoBadge className="h-full w-full" label={`Logo ${settings.storeName}`} />
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
              aria-label={settings.storeName}
              className="block text-[13px] font-extrabold uppercase leading-tight tracking-tight text-accent-700 max-[340px]:text-[11px] min-[400px]:text-sm min-[440px]:text-base"
            >
              <span className="block">Trái Cây Đông Lạnh</span>
              <span className="block">Đà Nẵng 28</span>
            </Link>
          </div>

          <Link
            href="/"
            aria-label="Trang chủ"
            tabIndex={isScrolled ? 0 : -1}
            aria-hidden={!isScrolled}
            className={`flex min-w-0 items-center gap-2.5 overflow-hidden transition-all duration-300 ${
              isScrolled ? "max-w-[20rem] opacity-100" : "pointer-events-none max-w-0 opacity-0"
            }`}
          >
            <span className="logo-shine relative block h-10 w-10 shrink-0 overflow-hidden rounded-full">
              <LogoBadge className="h-full w-full" label={`Logo ${settings.storeName}`} />
            </span>
            <span className="text-[13px] font-extrabold uppercase leading-tight text-accent-700 sm:whitespace-nowrap sm:text-sm">
              <span className="block sm:inline">Trái Cây Đông Lạnh</span>{" "}
              <span className="block sm:inline">Đà Nẵng 28</span>
            </span>
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
            <div ref={searchRef} className="lg:relative">
              <button
                type="button"
                onClick={() => {
                  if (isSearchOpen) setSearchValue("");
                  setIsSearchOpen((open) => !open);
                }}
                aria-expanded={isSearchOpen}
                aria-controls="header-search"
                aria-label="Tìm kiếm sản phẩm"
                title="Tìm kiếm"
                className={`inline-flex h-9 w-9 items-center justify-center border transition-colors hover:border-accent-600 hover:text-accent-600 ${
                  isSearchOpen ? "border-accent-600 text-accent-600" : "border-divider text-foreground/85"
                }`}
              >
                <SearchIcon />
              </button>

              <form
                id="header-search"
                onSubmit={submitSearch}
                className={`absolute right-[3.75rem] top-full z-50 mt-2 flex w-[min(18rem,calc(100%-10.25rem))] items-center sm:right-[4.25rem] sm:w-72 lg:right-0 lg:mt-3 border-t-2 border-accent-700 bg-background shadow-2xl ring-1 ring-divider transition-all duration-200 ${
                  isSearchOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"
                }`}
              >
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  tabIndex={isSearchOpen ? 0 : -1}
                  placeholder="Tìm sản phẩm..."
                  aria-label="Tìm sản phẩm"
                  className="h-9 min-w-0 flex-1 bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-foreground/45"
                />
                <button
                  type="submit"
                  tabIndex={isSearchOpen ? 0 : -1}
                  aria-label="Tìm"
                  className="flex h-9 w-9 shrink-0 items-center justify-center bg-accent-600 text-white hover:bg-accent-700"
                >
                  <SearchIcon />
                </button>
              </form>
            </div>

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

