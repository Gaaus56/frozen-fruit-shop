import type { Category, Policy, Post } from "@frozen-fruit-shop/types";
import { api } from "@/lib/api";

export interface LinkOption {
  label: string;
  value: string;
}

export interface LinkOptionGroup {
  label: string;
  options: LinkOption[];
}

const PAGES: LinkOption[] = [
  { label: "Trang chủ", value: "/" },
  { label: "Tất cả sản phẩm", value: "/products" },
  { label: "Giới thiệu", value: "/about" },
  { label: "Tin tức", value: "/news" },
  { label: "Tin tức — Kiến thức", value: "/news?type=kien-thuc" },
  { label: "Tin tức — Tuyển dụng", value: "/news?type=tuyen-dung" },
  { label: "Liên hệ", value: "/contact" },
  { label: "Tra cứu đơn hàng", value: "/order-lookup" },
];

/** Các trang có sẵn trên website, để admin chọn thay vì tự gõ đường dẫn. */
export async function getLinkOptionGroups(): Promise<LinkOptionGroup[]> {
  const [categories, policies, posts] = await Promise.all([
    api<Category[]>("/admin/categories").catch(() => []),
    api<Policy[]>("/admin/policies").catch(() => []),
    api<Post[]>("/admin/posts").catch(() => []),
  ]);

  const groups: LinkOptionGroup[] = [{ label: "Trang chính", options: PAGES }];
  const activeCategories = categories.filter((c) => c.isActive);
  if (activeCategories.length) {
    groups.push({
      label: "Danh mục sản phẩm",
      options: activeCategories.map((c) => ({ label: c.name, value: `/products?category=${c.slug}` })),
    });
  }
  const activePolicies = policies.filter((p) => p.isActive);
  if (activePolicies.length) {
    groups.push({
      label: "Chính sách",
      options: activePolicies.map((p) => ({ label: p.title, value: `/policies/${p.slug}` })),
    });
  }
  const published = posts.filter((p) => p.isPublished);
  if (published.length) {
    groups.push({
      label: "Bài viết",
      options: published.map((p) => ({ label: p.title, value: `/news/${p.slug}` })),
    });
  }
  return groups;
}
