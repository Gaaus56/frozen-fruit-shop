import Link from "next/link";
import { formatPhone, type Policy, type SiteSettings } from "@frozen-fruit-shop/types";
import { Container } from "@/components/ui/container";

const muted = { color: "rgba(243,242,242,.65)" };
const heading = { color: "rgba(243,242,242,.5)" };
const body = { color: "rgba(243,242,242,.8)" };

export function Footer({ settings, policies }: { settings: SiteSettings; policies: Policy[] }) {
  return (
    <footer style={{ background: "#201e1d", color: "#f3f2f2" }}>
      <Container className="grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-extrabold">{settings.storeName}</p>
          <p className="mt-3 max-w-[30ch] text-sm" style={muted}>
            Trái cây đông lạnh cấp đông nhanh sau thu hoạch, đóng gói hút chân không, giữ trọn hương vị.
          </p>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={heading}>
            Danh mục
          </p>
          <ul className="mt-4 space-y-2.5 text-sm" style={body}>
            <li><Link href="/products" className="hover:text-accent-400">Tất cả sản phẩm</Link></li>
            <li><Link href="/about" className="hover:text-accent-400">Giới thiệu</Link></li>
            <li><Link href="/wholesale" className="hover:text-accent-400">Đặt hàng sỉ / F&B</Link></li>
            <li><Link href="/news" className="hover:text-accent-400">Tin tức</Link></li>
            <li><Link href="/order-lookup" className="hover:text-accent-400">Tra cứu đơn hàng</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={heading}>
            Chính sách
          </p>
          {policies.length > 0 ? (
            <ul className="mt-4 space-y-2.5 text-sm" style={body}>
              {policies.map((policy) => (
                <li key={policy.id}>
                  <Link href={`/policies/${policy.slug}`} className="hover:text-accent-400">
                    {policy.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm" style={muted}>Đang cập nhật.</p>
          )}
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={heading}>
            Liên hệ
          </p>
          <ul className="mt-4 space-y-2.5 text-sm" style={body}>
            <li>
              Hotline{settings.hotlineHours ? ` ${settings.hotlineHours}` : ""}:{" "}
              <a href={`tel:${settings.phone}`} className="hover:text-accent-400">{formatPhone(settings.phone)}</a>
            </li>
            {settings.zaloPhone ? <li>Zalo: {formatPhone(settings.zaloPhone)}</li> : null}
            {settings.email ? (
              <li>
                Email: <a href={`mailto:${settings.email}`} className="hover:text-accent-400">{settings.email}</a>
              </li>
            ) : null}
            {settings.facebookUrl ? (
              <li>
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent-400">
                  Facebook
                </a>
              </li>
            ) : null}
            {settings.address ? (
              <li>
                {settings.mapUrl ? (
                  <a href={settings.mapUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent-400">
                    {settings.address}
                  </a>
                ) : (
                  settings.address
                )}
              </li>
            ) : null}
          </ul>
        </div>
      </Container>

      <div
        className="border-t px-4 py-5 text-center text-xs"
        style={{ borderColor: "rgba(243,242,242,.15)", color: "rgba(243,242,242,.5)" }}
      >
        © {new Date().getFullYear()} {settings.storeName}.
        {settings.taxCode ? ` MST ${settings.taxCode}${settings.taxNote ? ` — ${settings.taxNote}` : ""}.` : ""} Bảo lưu
        mọi quyền.
      </div>
    </footer>
  );
}
