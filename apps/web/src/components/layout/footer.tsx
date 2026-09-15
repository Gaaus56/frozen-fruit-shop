import Link from "next/link";
import { Container } from "@/components/ui/container";

const POLICY_LINKS = [
  { href: "/chinh-sach/huong-dan-mua-hang", label: "Hướng dẫn mua hàng" },
  { href: "/chinh-sach/bao-mat", label: "Chính sách bảo mật" },
  { href: "/chinh-sach/thanh-toan", label: "Chính sách thanh toán" },
  { href: "/chinh-sach/van-chuyen", label: "Chính sách vận chuyển" },
  { href: "/chinh-sach/doi-tra", label: "Chính sách đổi trả" },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <Container className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="flex items-center gap-2.5 font-display text-lg font-semibold text-slate-900">
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 200deg, var(--color-mango-500), var(--color-berry-500) 55%, var(--color-teal-500) 100%)",
              }}
            />
            Frozen Fruit Shop
          </p>
          <p className="mt-3 text-sm text-slate-600">
            Trái cây đông lạnh chất lượng, cấp đông nhanh sau thu hoạch, không chất bảo quản, giao hàng lạnh toàn quốc.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">Danh mục</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li><Link href="/san-pham" className="hover:text-teal-600">Tất cả sản phẩm</Link></li>
            <li><Link href="/gioi-thieu" className="hover:text-teal-600">Giới thiệu</Link></li>
            <li><Link href="/dat-hang-si" className="hover:text-teal-600">Đặt hàng sỉ / F&B</Link></li>
            <li><Link href="/tin-tuc" className="hover:text-teal-600">Tin tức</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">Chính sách</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {POLICY_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-teal-600">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">Liên hệ</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>Hotline: 0900 000 000</li>
            <li>Email: hello@frozenfruitshop.vn</li>
            <li>Zalo: 0900 000 000</li>
            <li><Link href="/tra-cuu-don-hang" className="hover:text-teal-600">Tra cứu đơn hàng</Link></li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Frozen Fruit Shop. Bảo lưu mọi quyền.
      </div>
    </footer>
  );
}
