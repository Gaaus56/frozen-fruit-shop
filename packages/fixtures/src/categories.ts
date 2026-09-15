import type { Category } from "@frozen-fruit-shop/types";

export const categories: Category[] = [
  {
    id: "cat-xoai",
    slug: "xoai-dong-lanh",
    name: "Xoài đông lạnh",
    image: "/images/categories/xoai.svg",
    description: "Xoài chín cắt miếng, cấp đông nhanh giữ trọn vị ngọt tự nhiên.",
  },
  {
    id: "cat-dau",
    slug: "dau-dong-lanh",
    name: "Dâu đông lạnh",
    image: "/images/categories/dau.svg",
    description: "Dâu tây nguyên trái, cấp đông ngay sau thu hoạch.",
  },
  {
    id: "cat-sau-rieng",
    slug: "sau-rieng-dong-lanh",
    name: "Sầu riêng đông lạnh",
    image: "/images/categories/sau-rieng.svg",
    description: "Cơm sầu riêng nguyên múi, đóng gói hút chân không.",
  },
  {
    id: "cat-bo",
    slug: "bo-dong-lanh",
    name: "Bơ đông lạnh",
    image: "/images/categories/bo.svg",
    description: "Bơ sáp cắt miếng, tiện lợi cho sinh tố và món tráng miệng.",
  },
  {
    id: "cat-mang-cau",
    slug: "mang-cau-dong-lanh",
    name: "Mãng cầu đông lạnh",
    image: "/images/categories/mang-cau.svg",
    description: "Mãng cầu xiêm tách hạt, cấp đông giữ nguyên hương vị.",
  },
  {
    id: "cat-chanh-day",
    slug: "chanh-day-dong-lanh",
    name: "Chanh dây đông lạnh",
    image: "/images/categories/chanh-day.svg",
    description: "Thịt chanh dây nguyên chất, không pha tạp, cấp đông tươi.",
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}
