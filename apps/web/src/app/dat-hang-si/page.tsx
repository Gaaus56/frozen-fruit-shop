import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductGrid } from "@/components/product/product-grid";
import { WholesaleForm } from "@/components/contact/wholesale-form";
import { products } from "@frozen-fruit-shop/fixtures";

export const metadata: Metadata = {
  title: "Đặt hàng sỉ / Đối tác F&B",
  description: "Chính sách giá sỉ và nguồn cung ổn định cho quán cà phê, nhà hàng, doanh nghiệp F&B.",
};

export default function WholesalePage() {
  const wholesaleProducts = products.filter((product) => product.isWholesaleAvailable);

  return (
    <Container className="py-12">
      <SectionHeading
        eyebrow="Đối tác F&B"
        title="Đặt hàng sỉ cho quán cà phê, nhà hàng & doanh nghiệp"
        description="Nguồn cung ổn định quanh năm, sản phẩm sơ chế sẵn giúp tiết kiệm thời gian và nhân lực."
      />

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          { title: "Giá sỉ ưu đãi", description: "Chiết khấu theo số lượng, có hợp đồng cung ứng dài hạn." },
          { title: "Sơ chế sẵn", description: "Rửa sạch, gọt vỏ, cắt miếng — sẵn sàng chế biến ngay." },
          { title: "Giao hàng đúng lịch", description: "Cam kết thời gian giao hàng ổn định, đóng gói giữ lạnh chuyên dụng." },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-slate-200 p-6">
            <p className="font-semibold text-slate-900">{item.title}</p>
            <p className="mt-2 text-sm text-slate-600">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold text-slate-900">Sản phẩm phù hợp mua sỉ</h2>
        <div className="mt-6">
          <ProductGrid products={wholesaleProducts} />
        </div>
      </div>

      <div className="mt-14 max-w-2xl border-t border-slate-200 pt-10">
        <h2 className="text-xl font-bold text-slate-900">Yêu cầu báo giá</h2>
        <p className="mt-2 text-slate-600">
          Điền thông tin bên dưới, đội ngũ kinh doanh sẽ liên hệ tư vấn báo giá trong vòng 24 giờ.
        </p>
        <div className="mt-6">
          <WholesaleForm />
        </div>
      </div>
    </Container>
  );
}
