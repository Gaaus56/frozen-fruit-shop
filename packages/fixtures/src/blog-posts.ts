import type { BlogPost } from "@frozen-fruit-shop/types";

export const blogPosts: BlogPost[] = [
  {
    id: "post-bao-quan",
    slug: "cach-bao-quan-trai-cay-dong-lanh-dung-cach",
    title: "Cách bảo quản trái cây đông lạnh đúng cách để giữ trọn dinh dưỡng",
    coverImage: "/images/blog/bao-quan.svg",
    excerpt: "Bảo quản đúng nhiệt độ và cách rã đông giúp trái cây giữ nguyên hương vị, tránh mất chất dinh dưỡng.",
    content:
      "Trái cây đông lạnh cần được bảo quản liên tục ở nhiệt độ -18°C trở xuống để đảm bảo an toàn thực phẩm và giữ trọn dinh dưỡng. Tránh rã đông rồi cấp đông lại nhiều lần vì sẽ làm giảm chất lượng và kết cấu của trái cây...",
    category: "Mẹo bảo quản",
    publishedAt: "2026-08-01",
  },
  {
    id: "post-so-sanh",
    slug: "so-sanh-trai-cay-tuoi-va-dong-lanh",
    title: "Trái cây tươi và trái cây đông lạnh: nên chọn loại nào?",
    coverImage: "/images/blog/so-sanh.svg",
    excerpt: "Trái cây đông lạnh được cấp đông ngay sau thu hoạch, nhiều trường hợp còn giữ dinh dưỡng tốt hơn trái cây tươi để lâu.",
    content:
      "Nhiều người cho rằng trái cây tươi luôn tốt hơn trái cây đông lạnh, tuy nhiên nếu trái cây tươi phải trải qua quá trình vận chuyển và bảo quản dài ngày, hàm lượng vitamin có thể giảm đáng kể so với trái cây được cấp đông ngay sau thu hoạch...",
    category: "Kiến thức",
    publishedAt: "2026-07-20",
  },
  {
    id: "post-cong-thuc",
    slug: "3-cong-thuc-sinh-to-tu-trai-cay-dong-lanh",
    title: "3 công thức sinh tố ngon từ trái cây đông lạnh",
    coverImage: "/images/blog/cong-thuc.svg",
    excerpt: "Chỉ với vài bước đơn giản, bạn đã có ngay ly sinh tố mát lạnh từ trái cây đông lạnh chất lượng.",
    content:
      "Sinh tố xoài dừa, sinh tố dâu chuối, sinh tố bơ sữa chua là những công thức đơn giản, nhanh gọn mà vẫn đảm bảo dinh dưỡng khi sử dụng trái cây đông lạnh sơ chế sẵn...",
    category: "Công thức",
    publishedAt: "2026-07-05",
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getLatestBlogPosts(count: number): BlogPost[] {
  return [...blogPosts]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, count);
}
