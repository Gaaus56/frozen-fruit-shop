const FEATURES = [
  {
    title: "Chuẩn VietGAP",
    description: "Nguồn nguyên liệu rõ ràng, đạt tiêu chuẩn an toàn thực phẩm.",
    path: "M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z M9 12l2 2 4-4",
  },
  {
    title: "Không chất bảo quản",
    description: "Cấp đông tự nhiên, không phụ gia, giữ nguyên hương vị thật.",
    path: "M4 20c8-1 14-7 15-16-9 1-15 7-16 16z M4 20c2-4 5-7 9-9",
  },
  {
    title: "Hút chân không",
    description: "Đóng gói giữ trọn dinh dưỡng, hạn chế oxy hóa trong bảo quản.",
    path: "M3 7l9-4 9 4-9 4-9-4z M3 7v10l9 4 9-4V7 M12 11v10",
  },
  {
    title: "Giao hàng lạnh toàn quốc",
    description: "Đóng thùng giữ lạnh chuyên dụng, giao nhanh tận nơi.",
    path: "M2 7h13v9H2z M15 10h4l3 3v3h-7z",
  },
];

export function FeatureHighlights() {
  return (
    <div className="grid grid-cols-1 divide-y divide-divider border-y border-divider sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
      {FEATURES.map((feature, index) => (
        <div key={feature.title} className={`p-10 ${index > 0 ? "sm:border-l sm:border-divider" : ""}`}>
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            className="text-accent-600"
          >
            <path d={feature.path} />
          </svg>
          <p className="mt-4 text-base font-bold text-foreground">{feature.title}</p>
          <p className="mt-1.5 text-[13px] text-foreground/70">{feature.description}</p>
        </div>
      ))}
    </div>
  );
}
