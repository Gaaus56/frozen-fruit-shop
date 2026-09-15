import { Container } from "@/components/ui/container";

const FEATURES = [
  {
    icon: "🌱",
    title: "Chuẩn VietGAP",
    description: "Nguồn nguyên liệu rõ ràng, đạt tiêu chuẩn an toàn thực phẩm.",
  },
  {
    icon: "🚫",
    title: "Không chất bảo quản",
    description: "Cấp đông tự nhiên, không phụ gia, giữ nguyên hương vị thật.",
  },
  {
    icon: "📦",
    title: "Hút chân không",
    description: "Đóng gói giữ trọn dinh dưỡng, hạn chế oxy hóa trong bảo quản.",
  },
  {
    icon: "🚚",
    title: "Giao hàng lạnh toàn quốc",
    description: "Đóng thùng giữ lạnh chuyên dụng, giao nhanh tận nơi.",
  },
];

export function FeatureHighlights() {
  return (
    <section className="py-12">
      <Container>
        <div
          className="grid grid-cols-1 overflow-hidden rounded-3xl shadow-lg shadow-berry-900/10 sm:grid-cols-2 lg:grid-cols-4"
          style={{
            background:
              "linear-gradient(115deg, var(--color-teal-600), var(--color-berry-600) 68%, var(--color-mango-500))",
          }}
        >
          {FEATURES.map((feature) => (
            <div key={feature.title} className="flex flex-col gap-2 p-6 text-white">
              <div className="text-2xl" aria-hidden>
                {feature.icon}
              </div>
              <p className="font-display text-base font-semibold">{feature.title}</p>
              <p className="text-[13px] leading-snug text-white/85">{feature.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
