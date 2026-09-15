import type { Product } from "@frozen-fruit-shop/types";

export const products: Product[] = [
  {
    id: "prod-xoai-cat",
    slug: "xoai-cat-dong-lanh",
    name: "Xoài cát đông lạnh",
    categorySlug: "xoai-dong-lanh",
    images: ["/images/products/xoai-cat.svg"],
    shortDescription: "Xoài cát chín cây, cắt miếng vuông, cấp đông nhanh.",
    description:
      "Xoài cát được tuyển chọn từ vùng nguyên liệu đạt chuẩn, chín tự nhiên, gọt vỏ và cắt miếng trước khi cấp đông nhanh ở -35°C để giữ trọn hương vị và dinh dưỡng. Phù hợp làm sinh tố, chè, hoặc ăn trực tiếp sau khi rã đông nhẹ.",
    storageInfo: {
      temperature: "Bảo quản ở -18°C trở xuống",
      shelfLifeDays: 365,
      thawInstructions: "Rã đông tự nhiên trong ngăn mát 2-3 giờ hoặc dùng trực tiếp cho sinh tố khi còn đông đá.",
    },
    rating: 4.8,
    reviewCount: 124,
    tags: ["ban-chay"],
    isWholesaleAvailable: true,
    relatedProductIds: ["prod-chanh-day", "prod-mang-cau"],
    variants: [
      { id: "var-xoai-250", packageSize: "250g", price: 37500, pricePerKg: 150000, stockStatus: "in_stock", sku: "XOA-250" },
      { id: "var-xoai-500", packageSize: "500g", price: 69000, pricePerKg: 138000, stockStatus: "in_stock", sku: "XOA-500" },
      { id: "var-xoai-1000", packageSize: "1kg", price: 129000, pricePerKg: 129000, stockStatus: "in_stock", sku: "XOA-1000" },
    ],
  },
  {
    id: "prod-dau-tay",
    slug: "dau-tay-dong-lanh",
    name: "Dâu tây đông lạnh nguyên trái",
    categorySlug: "dau-dong-lanh",
    images: ["/images/products/dau-tay.svg"],
    shortDescription: "Dâu tây nguyên trái, cấp đông ngay sau thu hoạch.",
    description:
      "Dâu tây được thu hoạch và cấp đông trong vòng vài giờ để giữ nguyên vị chua ngọt tự nhiên và màu sắc tươi đẹp. Không sử dụng chất bảo quản, đóng gói hút chân không.",
    storageInfo: {
      temperature: "Bảo quản ở -18°C trở xuống",
      shelfLifeDays: 300,
      thawInstructions: "Rã đông trong ngăn mát 1-2 giờ trước khi dùng, hoặc xay trực tiếp làm sinh tố.",
    },
    rating: 4.9,
    reviewCount: 98,
    tags: ["ban-chay", "moi"],
    isWholesaleAvailable: true,
    relatedProductIds: ["prod-xoai-cat", "prod-chanh-day"],
    variants: [
      { id: "var-dau-250", packageSize: "250g", price: 45000, pricePerKg: 180000, stockStatus: "in_stock", sku: "DAU-250" },
      { id: "var-dau-500", packageSize: "500g", price: 85000, pricePerKg: 170000, stockStatus: "in_stock", sku: "DAU-500" },
      { id: "var-dau-1000", packageSize: "1kg", price: 159000, pricePerKg: 159000, stockStatus: "low_stock", sku: "DAU-1000" },
    ],
  },
  {
    id: "prod-sau-rieng",
    slug: "com-sau-rieng-dong-lanh",
    name: "Cơm sầu riêng đông lạnh",
    categorySlug: "sau-rieng-dong-lanh",
    images: ["/images/products/sau-rieng.svg"],
    shortDescription: "Cơm sầu riêng nguyên múi, béo thơm, đóng gói hút chân không.",
    description:
      "Cơm sầu riêng Ri6/Monthong được tách múi nguyên vẹn, cấp đông nhanh để giữ độ béo và mùi thơm đặc trưng. Đóng gói hút chân không, tiện lợi bảo quản lâu dài.",
    storageInfo: {
      temperature: "Bảo quản ở -18°C trở xuống",
      shelfLifeDays: 365,
      thawInstructions: "Rã đông tự nhiên ở nhiệt độ phòng khoảng 30-45 phút trước khi dùng.",
    },
    rating: 4.7,
    reviewCount: 210,
    tags: ["ban-chay", "so-che-san"],
    isWholesaleAvailable: true,
    relatedProductIds: ["prod-bo-sap", "prod-mang-cau"],
    variants: [
      { id: "var-sr-250", packageSize: "250g", price: 65000, pricePerKg: 260000, stockStatus: "in_stock", sku: "SR-250" },
      { id: "var-sr-500", packageSize: "500g", price: 115000, pricePerKg: 230000, stockStatus: "in_stock", sku: "SR-500" },
    ],
  },
  {
    id: "prod-bo-sap",
    slug: "bo-sap-dong-lanh",
    name: "Bơ sáp cắt miếng đông lạnh",
    categorySlug: "bo-dong-lanh",
    images: ["/images/products/bo-sap.svg"],
    shortDescription: "Bơ sáp cắt miếng, béo mịn, tiện lợi cho sinh tố.",
    description:
      "Bơ sáp chín tự nhiên, gọt vỏ bỏ hạt, cắt miếng vừa ăn và cấp đông nhanh. Thích hợp làm sinh tố bơ, kem bơ, hoặc các món tráng miệng.",
    storageInfo: {
      temperature: "Bảo quản ở -18°C trở xuống",
      shelfLifeDays: 270,
      thawInstructions: "Rã đông trong ngăn mát 2 giờ hoặc xay trực tiếp khi còn đông đá.",
    },
    rating: 4.6,
    reviewCount: 76,
    tags: ["so-che-san"],
    isWholesaleAvailable: true,
    relatedProductIds: ["prod-sau-rieng", "prod-xoai-cat"],
    variants: [
      { id: "var-bo-250", packageSize: "250g", price: 42000, pricePerKg: 168000, stockStatus: "in_stock", sku: "BO-250" },
      { id: "var-bo-500", packageSize: "500g", price: 78000, pricePerKg: 156000, stockStatus: "in_stock", sku: "BO-500" },
    ],
  },
  {
    id: "prod-mang-cau",
    slug: "mang-cau-xiem-dong-lanh",
    name: "Mãng cầu xiêm tách hạt đông lạnh",
    categorySlug: "mang-cau-dong-lanh",
    images: ["/images/products/mang-cau.svg"],
    shortDescription: "Mãng cầu xiêm tách hạt, cấp đông giữ nguyên hương vị.",
    description:
      "Mãng cầu xiêm chín được tách hạt, giữ nguyên phần thịt quả, cấp đông nhanh để giữ vị chua ngọt đặc trưng. Phù hợp làm nước ép, sinh tố, mứt.",
    storageInfo: {
      temperature: "Bảo quản ở -18°C trở xuống",
      shelfLifeDays: 300,
      thawInstructions: "Rã đông trong ngăn mát 2-3 giờ trước khi chế biến.",
    },
    rating: 4.7,
    reviewCount: 54,
    tags: ["so-che-san"],
    isWholesaleAvailable: false,
    relatedProductIds: ["prod-sau-rieng", "prod-chanh-day"],
    variants: [
      { id: "var-mc-500", packageSize: "500g", price: 55000, pricePerKg: 110000, stockStatus: "in_stock", sku: "MC-500" },
      { id: "var-mc-1000", packageSize: "1kg", price: 99000, pricePerKg: 99000, stockStatus: "in_stock", sku: "MC-1000" },
    ],
  },
  {
    id: "prod-chanh-day",
    slug: "thit-chanh-day-dong-lanh",
    name: "Thịt chanh dây đông lạnh",
    categorySlug: "chanh-day-dong-lanh",
    images: ["/images/products/chanh-day.svg"],
    shortDescription: "Thịt chanh dây nguyên chất, không pha tạp, cấp đông tươi.",
    description:
      "Thịt chanh dây nguyên chất được tách vỏ và cấp đông ngay sau thu hoạch, không pha loãng, không thêm đường. Thích hợp pha nước, làm topping, sốt chanh dây.",
    storageInfo: {
      temperature: "Bảo quản ở -18°C trở xuống",
      shelfLifeDays: 300,
      thawInstructions: "Rã đông trong ngăn mát 30-60 phút hoặc ngâm túi trong nước lạnh 15 phút.",
    },
    rating: 4.8,
    reviewCount: 87,
    tags: ["moi"],
    isWholesaleAvailable: true,
    relatedProductIds: ["prod-xoai-cat", "prod-dau-tay"],
    variants: [
      { id: "var-cd-250", packageSize: "250g", price: 32000, pricePerKg: 128000, stockStatus: "in_stock", sku: "CD-250" },
      { id: "var-cd-500", packageSize: "500g", price: 58000, pricePerKg: 116000, stockStatus: "in_stock", sku: "CD-500" },
    ],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter((product) => product.categorySlug === categorySlug);
}

export function getRelatedProducts(product: Product): Product[] {
  return product.relatedProductIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));
}

export function getFeaturedProducts(): Product[] {
  return products.filter((product) => product.tags.includes("ban-chay"));
}
