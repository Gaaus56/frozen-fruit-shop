import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductGrid } from "@/components/product/product-grid";
import { WholesaleForm } from "@/components/contact/wholesale-form";
import { getProducts } from "@/lib/api";

export const metadata: Metadata = {
  title: "Đặt hàng sỉ / Đối tác F&B",
  description: "Chính sách giá sỉ và nguồn cung ổn định cho quán cà phê, nhà hàng, doanh nghiệp F&B.",
};

export default async function WholesalePage() {
  const wholesaleProducts = await getProducts({ wholesale: true });

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
          <div key={item.title} className="border border-divider p-6">
            <p className="font-semibold text-foreground">{item.title}</p>
            <p className="mt-2 text-sm text-foreground/70">{item.description}</p>
          </div>
        ))}
      </div>

      {wholesaleProducts.length > 0 ? (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-foreground">Sản phẩm phù hợp mua sỉ</h2>
          <div className="mt-6">
            <ProductGrid products={wholesaleProducts} />
          </div>
        </div>
      ) : null}

      <div className="mt-14 max-w-2xl border-t border-divider pt-10">
        <h2 className="text-xl font-bold text-foreground">Yêu cầu báo giá</h2>
        <p className="mt-2 text-foreground/70">
          Điền thông tin bên dưới, cửa hàng sẽ liên hệ tư vấn và báo giá sớm nhất.
        </p>
        <div className="mt-6">
          <WholesaleForm />
        </div>
      </div>
    </Container>
  );
}
