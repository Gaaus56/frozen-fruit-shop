import Link from "next/link";
import type { ReactNode } from "react";
import { formatPhone, type Policy, type SiteSettings } from "@frozen-fruit-shop/types";
import { Container } from "@/components/ui/container";
import { LogoBadge } from "./logo-badge";
import { editSettings, editTarget } from "@/lib/edit-target";

/** Xanh lá đậm cùng tông huy hiệu logo (#1f6b3f), đủ tối để chữ trắng dễ đọc. */
const FOOTER_BG = "#143f29";

/** Dòng "Thiết kế bởi ..." cuối trang, link về portfolio người làm web. Đặt trong apps/web/.env.local; để trống thì ẩn. */
const DESIGNER_NAME = process.env.DESIGNER_NAME?.trim() ?? "";
const DESIGNER_URL = process.env.DESIGNER_URL?.trim() ?? "";

const ICONS = {
  pin: "M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  phone:
    "M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.3.2 2.5.6 3.6a1 1 0 0 1-.25 1z",
  mail: "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm0 1.5 8 6 8-6",
  doc: "M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm7 0v5h5M9 13h6M9 17h6",
};

function Icon({ path, className = "h-4 w-4" }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={path} />
    </svg>
  );
}

/** Dòng liên hệ: biểu tượng tròn viền mảnh + nội dung. */
function ContactRow({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20">
        <Icon path={icon} />
      </span>
      <span className="min-w-0 pt-1.5 [overflow-wrap:anywhere]">{children}</span>
    </li>
  );
}

function ColumnTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-white">
      <span className="h-3.5 w-1 rounded-full bg-accent-500" aria-hidden />
      {children}
    </h2>
  );
}

const linkClass = "text-white/80 transition-colors hover:text-white hover:underline";

/** Bề ngang khung Fanpage (px). Plugin dạng iframe không tự co theo khung nên đặt cố định, vừa cả màn điện thoại. */
const FANPAGE_WIDTH = 280;
const FANPAGE_HEIGHT = 300;

/** Khung Fanpage (Facebook Page Plugin dạng iframe). */
function facebookPageEmbedUrl(pageUrl: string) {
  const params = new URLSearchParams({
    href: pageUrl,
    tabs: "timeline",
    width: String(FANPAGE_WIDTH),
    height: String(FANPAGE_HEIGHT),
    small_header: "true",
    adapt_container_width: "true",
    hide_cover: "false",
    show_facepile: "true",
    locale: "vi_VN",
  });
  return `https://www.facebook.com/plugins/page.php?${params}`;
}

export function Footer({ settings, policies }: { settings: SiteSettings; policies: Policy[] }) {
  return (
    <footer className="text-white" style={{ background: FOOTER_BG }}>
      <Container className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
        {/* Thương hiệu */}
        {/* Logo + tên + giới thiệu căn giữa trong cột thương hiệu. */}
        <div {...editSettings("brand", "Tên & thương hiệu cửa hàng")} className="text-center lg:col-span-3">
          <span className="mx-auto block h-28 w-28 overflow-hidden rounded-full shadow-xl shadow-black/30 ring-4 ring-white">
            <LogoBadge className="h-full w-full" label={`Logo ${settings.storeName}`} />
          </span>
          <p className="mt-5 text-lg font-extrabold leading-snug">{settings.storeName}</p>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-white/75">
            Trái cây đông lạnh cấp đông nhanh sau thu hoạch, đóng gói hút chân không, giữ trọn hương vị và dinh dưỡng.
          </p>
        </div>

        {/* Liên hệ */}
        <div {...editSettings("contact", "Thông tin liên hệ")} className="lg:col-span-4">
          <ColumnTitle>Liên hệ</ColumnTitle>
          <ul className="mt-5 space-y-3 text-sm text-white/80">
            {settings.address ? (
              <ContactRow icon={ICONS.pin}>
                {settings.mapUrl ? (
                  <a href={settings.mapUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    {settings.address}
                  </a>
                ) : (
                  settings.address
                )}
                {settings.addressLandmark ? <span className="block text-white/60">{settings.addressLandmark}</span> : null}
              </ContactRow>
            ) : null}
            <ContactRow icon={ICONS.phone}>
              Hotline{settings.hotlineHours ? ` ${settings.hotlineHours}` : ""}:{" "}
              <a href={`tel:${settings.phone}`} className="font-bold text-white hover:underline">
                {formatPhone(settings.phone)}
              </a>
            </ContactRow>
            {settings.email ? (
              <ContactRow icon={ICONS.mail}>
                <a href={`mailto:${settings.email}`} className={linkClass}>
                  {settings.email}
                </a>
              </ContactRow>
            ) : null}
            {settings.taxCode ? (
              <ContactRow icon={ICONS.doc}>
                MST {settings.taxCode}
                {settings.taxNote ? <span className="block text-white/60">{settings.taxNote}</span> : null}
              </ContactRow>
            ) : null}
          </ul>
        </div>

        {/* Chính sách */}
        <nav aria-label="Chính sách" className="lg:col-span-2">
          <ColumnTitle>Chính sách</ColumnTitle>
          {policies.length > 0 ? (
            <ul className="mt-5 space-y-2.5 text-sm">
              {policies.map((policy) => (
                <li key={policy.id} {...editTarget("policy", policy.id, `Chính sách: ${policy.title}`)}>
                  <Link href={`/policies/${policy.slug}`} className={linkClass}>
                    {policy.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/order-lookup" className={linkClass}>
                  Tra cứu đơn hàng
                </Link>
              </li>
            </ul>
          ) : (
            <p className="mt-5 text-sm text-white/60">Đang cập nhật.</p>
          )}
        </nav>

        {/* Fanpage — theo link Facebook trong Thông tin cửa hàng */}
        {settings.facebookUrl ? (
          <div {...editSettings("contact", "Link Fanpage Facebook")} className="lg:col-span-3 lg:justify-self-end">
            <ColumnTitle>Fanpage</ColumnTitle>
            <div className="mt-5 max-w-full overflow-hidden rounded-xl bg-white" style={{ width: FANPAGE_WIDTH, height: FANPAGE_HEIGHT }}>
              <iframe
                title={`Fanpage Facebook ${settings.storeName}`}
                src={facebookPageEmbedUrl(settings.facebookUrl)}
                className="h-full w-full border-0"
                loading="lazy"
                allow="encrypted-media"
              />
            </div>
          </div>
        ) : null}
      </Container>

      {/* Thanh cuối: một dòng căn giữa "Copyright © ... Designed by ...". Mobile chừa chỗ cho thanh điều hướng dưới (nền kéo tới đáy). */}
      <div className="border-t border-white/15 bg-black/25 pb-24 lg:pb-0">
        <Container className="py-5 text-center text-xs text-white/60">
          <p>
            Copyright © {new Date().getFullYear()} {settings.storeName}.
            {DESIGNER_NAME ? (
              <>
                {" "}
                {/* Giữ "Designed by <tên>" liền một cụm, không để tên rơi xuống dòng riêng. */}
                <span className="whitespace-nowrap">
                  Designed by{" "}
                  {DESIGNER_URL ? (
                    <a href={DESIGNER_URL} target="_blank" rel="noopener" className="font-semibold text-white/85 hover:text-white hover:underline">
                      {DESIGNER_NAME}
                    </a>
                  ) : (
                    <span className="font-semibold text-white/85">{DESIGNER_NAME}</span>
                  )}
                </span>
              </>
            ) : null}
          </p>
        </Container>
      </div>
    </footer>
  );
}
