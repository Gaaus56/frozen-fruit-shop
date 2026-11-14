// Đọc dữ liệu từ API cho Server Components. Không import file này từ Client Component.
//
// Cache: mỗi request được cache tối đa 5 phút và gắn tag theo nhóm dữ liệu. Khi admin sửa dữ liệu,
// API gọi POST /api/revalidate để xoá cache theo tag, nên khách thấy thay đổi gần như ngay lập tức.
// Nếu API lỗi hoặc chưa chạy, trang vẫn hiển thị với dữ liệu rỗng/mặc định thay vì sập.
import {
  DEFAULT_SITE_SETTINGS,
  type Banner,
  type BannerPlacement,
  type CacheTag,
  type Category,
  type HomeBlock,
  type Page,
  type PageSlug,
  type Policy,
  type Post,
  type PostType,
  type Product,
  type PublicComment,
  type ProductDetail,
  type SiteSettings,
} from "@frozen-fruit-shop/types";

export type { CacheTag };

const API_URL = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");
const REVALIDATE_SECONDS = 300;

class NotFoundError extends Error {}

async function apiGet<T>(path: string, tag: CacheTag): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    next: { revalidate: REVALIDATE_SECONDS, tags: [tag] },
    signal: AbortSignal.timeout(8000),
  });
  if (res.status === 404) throw new NotFoundError(path);
  if (!res.ok) throw new Error(`API ${path} trả về HTTP ${res.status}`);
  return (await res.json()) as T;
}

async function withFallback<T>(promise: Promise<T>, fallback: T, label: string): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    console.error(`[api] Không tải được ${label}:`, error instanceof Error ? error.message : error);
    return fallback;
  }
}

async function orNull<T>(promise: Promise<T>, label: string): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    if (!(error instanceof NotFoundError)) {
      console.error(`[api] Không tải được ${label}:`, error instanceof Error ? error.message : error);
    }
    return null;
  }
}

function query(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

export function getSettings(): Promise<SiteSettings> {
  return withFallback(apiGet<SiteSettings>("/settings", "settings"), DEFAULT_SITE_SETTINGS, "thông tin cửa hàng");
}

export function getCategories(): Promise<Category[]> {
  return withFallback(apiGet<Category[]>("/categories", "catalog"), [], "danh mục");
}

export interface ProductFilters {
  category?: string;
  q?: string;
  featured?: boolean;
  sort?: "default" | "newest" | "price_asc" | "price_desc";
  limit?: number;
}

export function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const path = `/products${query({
    category: filters.category,
    q: filters.q,
    featured: filters.featured ? "true" : undefined,
    sort: filters.sort,
    limit: filters.limit,
  })}`;
  return withFallback(apiGet<Product[]>(path, "catalog"), [], "sản phẩm");
}

export function getProduct(slug: string): Promise<ProductDetail | null> {
  return orNull(apiGet<ProductDetail>(`/products/${encodeURIComponent(slug)}`, "catalog"), `sản phẩm ${slug}`);
}

export function getBanners(placement: BannerPlacement = "home"): Promise<Banner[]> {
  return withFallback(apiGet<Banner[]>(`/banners?placement=${placement}`, "content"), [], "banner");
}

export function getPosts(limit?: number, type?: PostType): Promise<Post[]> {
  return withFallback(apiGet<Post[]>(`/posts${query({ limit, type })}`, "content"), [], "bài viết");
}

/** Bình luận đã duyệt của bài (tag content: admin duyệt / trả lời → web làm mới ngay). */
export function getComments(slug: string): Promise<PublicComment[]> {
  return withFallback(apiGet<PublicComment[]>(`/posts/${encodeURIComponent(slug)}/comments`, "content"), [], `bình luận ${slug}`);
}

export function getPost(slug: string): Promise<Post | null> {
  return orNull(apiGet<Post>(`/posts/${encodeURIComponent(slug)}`, "content"), `bài viết ${slug}`);
}

export function getPolicies(): Promise<Policy[]> {
  return withFallback(apiGet<Policy[]>("/policies", "content"), [], "chính sách");
}

/** Trang nội dung admin sửa được (trang Giới thiệu). API luôn trả nội dung (mặc định nếu chưa lưu); null khi API lỗi. */
/** Khối nội dung admin tự soạn trên trang chủ (đã lọc khối đang ẩn). Lỗi API thì trang chủ vẫn hiện bình thường. */
export function getHomeBlocks(): Promise<HomeBlock[]> {
  return withFallback(apiGet<HomeBlock[]>("/home-blocks", "content"), [], "khối trang chủ");
}

export function getPage(slug: PageSlug): Promise<Page | null> {
  return orNull(apiGet<Page>(`/pages/${slug}`, "content"), `trang ${slug}`);
}

export function getPolicy(slug: string): Promise<Policy | null> {
  return orNull(apiGet<Policy>(`/policies/${encodeURIComponent(slug)}`, "content"), `chính sách ${slug}`);
}
