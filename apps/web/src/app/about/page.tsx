import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getSettings } from "@/lib/api";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description: "Câu chuyện thương hiệu, tiêu chuẩn chất lượng và quy trình cấp đông trái cây.",
};

const STANDARDS = [
  {
    title: "Nguồn nguyên liệu chuẩn VietGAP",
    description: "Trái cây được thu mua từ các vùng trồng đạt chuẩn VietGAP, kiểm soát chặt chẽ từ khâu canh tác.",
  },
  {
    title: "Cấp đông nhanh (IQF)",
    description: "Trái cây được cấp đông nhanh ở nhiệt độ -35°C ngay sau sơ chế, giữ trọn cấu trúc và dinh dưỡng.",
  },
  {
    title: "Đóng gói hút chân không",
    description: "Hạn chế oxy hóa, giữ hương vị tươi ngon trong suốt thời gian bảo quản.",
  },
  {
    title: "Không chất bảo quản",
    description: "Sản phẩm hoàn toàn tự nhiên, không sử dụng chất bảo quản hay phụ gia.",
  },
];

export default async function AboutPage() {
  const { storeName } = await getSettings();

  return (
    <Container className="py-12">
      <SectionHeading
        eyebrow="Giới thiệu"
        title={`Về ${storeName}`}
        description="Chúng tôi mang đến trái cây đông lạnh chất lượng, tiện lợi cho mọi gia đình và đối tác F&B."
      />

      <div className="mt-8 max-w-3xl space-y-4 text-foreground/70">
        <p>
          {storeName} ra đời với sứ mệnh mang đến nguồn trái cây đông lạnh chất lượng cao, được
          cấp đông ngay sau thu hoạch để giữ trọn hương vị và dinh dưỡng tự nhiên. Chúng tôi tin rằng
          trái cây đông lạnh không chỉ tiện lợi mà còn có thể ngon và bổ dưỡng không kém trái cây tươi.
        </p>
        <p>
          Với quy trình sơ chế, cấp đông và đóng gói khép kín, sản phẩm của chúng tôi phù hợp cho cả
          nhu cầu sử dụng hàng ngày của gia đình lẫn nhu cầu kinh doanh của các quán cà phê, nhà hàng
          cần nguồn nguyên liệu ổn định quanh năm.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {STANDARDS.map((item) => (
          <div key={item.title} className="border border-divider p-6">
            <p className="font-semibold text-foreground">{item.title}</p>
            <p className="mt-2 text-sm text-foreground/70">{item.description}</p>
          </div>
        ))}
      </div>
    </Container>
  );
}
