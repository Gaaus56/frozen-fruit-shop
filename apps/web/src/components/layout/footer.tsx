import Link from "next/link";
import { Container } from "@/components/ui/container";

const POLICY_LINKS = [
  { href: "/policies/how-to-order", label: "Hướng dẫn mua hàng" },
  { href: "/policies/privacy", label: "Chính sách bảo mật" },
  { href: "/policies/payment", label: "Chính sách thanh toán" },
  { href: "/policies/shipping", label: "Chính sách vận chuyển" },
  { href: "/policies/returns", label: "Chính sách đổi trả" },
];

export function Footer() {
  return (
    <footer style={{ background: "#201e1d", color: "#f3f2f2" }}>
      <Container className="grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-extrabold">Trái Cây Đông Lạnh 28</p>
          <p className="mt-3 max-w-[26ch] text-sm" style={{ color: "rgba(243,242,242,.65)" }}>
            Trái cây đông lạnh chất lượng, cấp đông nhanh sau thu hoạch, không chất bảo quản, giao hàng lạnh toàn quốc.
          </p>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "rgba(243,242,242,.5)" }}>
            Danh mục
          </p>
          <ul className="mt-4 space-y-2.5 text-sm" style={{ color: "rgba(243,242,242,.8)" }}>
            <li><Link href="/products" className="hover:text-accent-400">Tất cả sản phẩm</Link></li>
            <li><Link href="/about" className="hover:text-accent-400">Giới thiệu</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "rgba(243,242,242,.5)" }}>
            Chính sách
          </p>
          <ul className="mt-4 space-y-2.5 text-sm" style={{ color: "rgba(243,242,242,.8)" }}>
            {POLICY_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-accent-400">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "rgba(243,242,242,.5)" }}>
            Liên hệ
          </p>
          <ul className="mt-4 space-y-2.5 text-sm" style={{ color: "rgba(243,242,242,.8)" }}>
            <li>Hotline: 0934 568 196</li>
            <li>Email: hello@frozenfruitshop.vn</li>
            <li>Zalo: 0934 568 196</li>
            <li><Link href="/order-lookup" className="hover:text-accent-400">Tra cứu đơn hàng</Link></li>
          </ul>
        </div>
      </Container>

      <div
        className="border-t py-5 text-center text-xs"
        style={{ borderColor: "rgba(243,242,242,.15)", color: "rgba(243,242,242,.5)" }}
      >
        © {new Date().getFullYear()} Trái Cây Đông Lạnh 28. Bảo lưu mọi quyền.
      </div>
    </footer>
  );
}
