import type { MetadataRoute } from "next";
import { getPolicies, getPosts, getProducts } from "@/lib/api";
import { SITE_URL } from "@/lib/site-url";

/** /sitemap.xml cho Google: trang tĩnh + mọi sản phẩm, bài viết, chính sách đang hiện trên web. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts, policies] = await Promise.all([getProducts(), getPosts(), getPolicies()]);
  const page = (path: string, priority: number, lastModified?: string): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${path}`,
    priority,
    ...(lastModified ? { lastModified } : {}),
  });

  return [
    page("/", 1),
    page("/products", 0.9),
    page("/news", 0.6),
    page("/about", 0.5),
    page("/contact", 0.5),
    ...products.map((product) => page(`/products/${product.slug}`, 0.8, product.updatedAt)),
    ...posts.map((post) => page(`/news/${post.slug}`, 0.6, post.publishedAt)),
    ...policies.map((policy) => page(`/policies/${policy.slug}`, 0.3)),
  ];
}
