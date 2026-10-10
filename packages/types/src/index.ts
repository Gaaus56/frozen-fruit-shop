// Kiểu dữ liệu dùng chung giữa apps/api (dữ liệu trả về), apps/web và apps/admin (dữ liệu nhận về).
// Ngày giờ luôn là chuỗi ISO 8601; tiền là số nguyên (đồng); ảnh là URL tuyệt đối.

// ───────────── Chung ─────────────

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error?: string;
}

// ───────────── Tài khoản quản trị ─────────────

export type Role = "ADMIN" | "STAFF";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface LoginResponse {
  accessToken: string;
  expiresAt: string;
  user: AuthUser;
}

export interface StaffAccount extends AuthUser {
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

// ───────────── Danh mục & sản phẩm ─────────────

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
}

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface ProductVariant {
  id: string;
  packageSize: string;
  weightGrams: number | null;
  price: number;
  compareAtPrice: number | null;
  /** Giá quy đổi theo kg, chỉ có khi nhập khối lượng. */
  pricePerKg: number | null;
  stockStatus: StockStatus;
  sku: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
}

export interface ProductStorageInfo {
  temperature: string;
  shelfLifeDays: number | null;
  thawInstructions: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: { id: string; slug: string; name: string };
  images: ProductImage[];
  shortDescription: string;
  description: string;
  storageInfo: ProductStorageInfo;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductDetail extends Product {
  relatedProducts: Product[];
}

// ───────────── Nội dung trang khách hàng ─────────────

export const POST_TYPES = ["knowledge", "recruitment"] as const;
export type PostType = (typeof POST_TYPES)[number];

export const POST_TYPE_LABELS: Record<PostType, string> = {
  knowledge: "Kiến thức",
  recruitment: "Tuyển dụng",
};

/** Đường dẫn thân thiện trên web: /news?type=kien-thuc | tuyen-dung. */
export const POST_TYPE_SLUGS: Record<PostType, string> = {
  knowledge: "kien-thuc",
  recruitment: "tuyen-dung",
};

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  type: PostType;
  isPublished: boolean;
  publishedAt: string;
}

export const BANNER_PLACEMENTS = ["home", "products", "news", "about"] as const;
export type BannerPlacement = (typeof BANNER_PLACEMENTS)[number];

export const BANNER_PLACEMENT_LABELS: Record<BannerPlacement, string> = {
  home: "Trang chủ (trình chiếu)",
  products: "Đầu trang Sản phẩm",
  news: "Đầu trang Tin tức",
  about: "Đầu trang Giới thiệu",
};

export interface Banner {
  id: string;
  placement: BannerPlacement;
  title: string;
  description: string;
  image: string;
  linkUrl: string | null;
  ctaLabel: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface Policy {
  id: string;
  slug: string;
  title: string;
  content: string;
  sortOrder: number;
  isActive: boolean;
}

/** Thẻ cam kết nhỏ dưới nút mua ở trang chi tiết sản phẩm (giao giữ lạnh, đổi trả, tư vấn...). */
export interface ProductAssurance {
  icon: string;
  title: string;
  text: string;
  /** Trang trong web ("/policies/..."), link ngoài, hoặc "tel:{phone}"; để trống = thẻ không bấm được. */
  linkUrl: string;
}

/** Số thẻ cam kết tối đa (một hàng 3 ô trên trang sản phẩm). */
export const MAX_PRODUCT_ASSURANCES = 3;

/** Biểu tượng admin chọn cho thẻ cam kết. */
export const ASSURANCE_ICONS = ["❄️", "↺", "☎", "🚚", "✅", "🌿", "⏱️", "💳", "🎁", "🛡️"] as const;

/** Dùng khi admin chưa chỉnh thẻ cam kết lần nào. `{phone}`, `{hotlineHours}` được thay bằng thông tin cửa hàng. */
export const DEFAULT_PRODUCT_ASSURANCES: ProductAssurance[] = [
  { icon: "❄️", title: "Giao hàng giữ lạnh", text: "Đóng thùng xốp + đá gel, giữ đông suốt đường đi.", linkUrl: "/policies/chinh-sach-giao-hang" },
  { icon: "↺", title: "Đổi trả khi hàng lỗi", text: "Quay video lúc mở thùng để được đổi mới hoặc hoàn tiền.", linkUrl: "/policies/chinh-sach-doi-tra" },
  { icon: "☎", title: "Tư vấn {hotlineHours}", text: "{phone}", linkUrl: "tel:{phone}" },
];

/** Thay `{phone}`, `{hotlineHours}` trong chữ admin nhập bằng thông tin cửa hàng hiện tại. */
export function fillSettingsPlaceholders(value: string, settings: Pick<SiteSettings, "phone" | "hotlineHours">): string {
  // Link gọi điện cần số liền ("tel:0396799579"); chữ hiển thị thì dùng số có khoảng cách cho dễ đọc.
  const phone = value.startsWith("tel:") ? settings.phone.replace(/\s/g, "") : formatPhone(settings.phone);
  return value.replace(/\{phone\}/g, phone).replace(/\{hotlineHours\}/g, settings.hotlineHours).replace(/\s+/g, " ").trim();
}

export interface SiteSettings {
  storeName: string;
  shortName: string;
  phone: string;
  hotlineHours: string;
  email: string;
  address: string;
  addressLandmark: string;
  mapUrl: string;
  facebookUrl: string;
  zaloPhone: string;
  taxCode: string;
  taxNote: string;
  marqueeEnabled: boolean;
  marqueeText: string;
  bankTransferInfo: string;
  productAssurances: ProductAssurance[];
}

/**
 * Thông tin cửa hàng mặc định (từ docs/01-product/business-info.md) — dùng khi ADMIN chưa lưu cài đặt lần nào,
 * hoặc khi web không kết nối được API. Đây là cấu hình doanh nghiệp, không phải dữ liệu mẫu.
 */
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  storeName: "Trái Cây Đông Lạnh Đà Nẵng 28",
  shortName: "Trái Cây Đông Lạnh 28",
  phone: "0396799579",
  hotlineHours: "24/24",
  email: "traicaydonglanhdanang28@gmail.com",
  address: "Số 49 Đặng Tất, phường Hòa Khánh, TP. Đà Nẵng",
  addressLandmark: "Chợ Đầu Mối Hòa Khánh",
  mapUrl: "https://maps.app.goo.gl/ZbaJ7F2CA8v12jGY9",
  facebookUrl: "https://www.facebook.com/traicaydonglanhdanang",
  zaloPhone: "0396799579",
  taxCode: "064196012614",
  taxNote: "Hộ kinh doanh nhóm 1",
  marqueeEnabled: true,
  marqueeText: "",
  bankTransferInfo: "",
  productAssurances: DEFAULT_PRODUCT_ASSURANCES,
};

/** "0396799579" → "0396 799 579" */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}` : phone;
}

// ───────────── Đơn hàng ─────────────

export type OrderStatus = "pending" | "confirmed" | "packing" | "shipping" | "delivered" | "cancelled";
export type PaymentMethod = "cod" | "bank_transfer";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  packing: "Đang đóng gói",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã huỷ",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cod: "Thanh toán khi nhận hàng (COD)",
  bank_transfer: "Chuyển khoản ngân hàng",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: "Chưa thanh toán",
  paid: "Đã thanh toán",
  refunded: "Đã hoàn tiền",
};

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  in_stock: "Còn hàng",
  low_stock: "Sắp hết",
  out_of_stock: "Hết hàng",
};

export interface OrderItem {
  id: string;
  productId: string | null;
  variantId: string | null;
  productName: string;
  packageSize: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderStatusLog {
  id: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  note: string;
  changedBy: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  shippingAddress: string;
  customerNote: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  internalNote: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderDetail extends Order {
  logs: OrderStatusLog[];
}

/** Dữ liệu khách tra cứu được — không lộ ghi chú nội bộ. */
export interface OrderLookupResult {
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  customerName: string;
  shippingAddress: string;
  items: Pick<OrderItem, "productName" | "packageSize" | "unitPrice" | "quantity" | "lineTotal">[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  createdAt: string;
}

export interface CartLineInput {
  variantId: string;
  quantity: number;
}

export interface QuoteLine {
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  packageSize: string;
  image: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  available: boolean;
  /** Lý do không đặt được (hết hàng, ngừng bán...) khi available = false. */
  issue: string | null;
}

export interface OrderQuote {
  lines: QuoteLine[];
  subtotal: number;
  hasUnavailableItems: boolean;
}

export interface CreateOrderResponse {
  orderNumber: string;
  total: number;
}

// ───────────── Liên hệ / báo giá sỉ ─────────────

export type InquiryType = "contact" | "wholesale";
export type InquiryStatus = "new" | "in_progress" | "done";

export const INQUIRY_TYPE_LABELS: Record<InquiryType, string> = {
  contact: "Liên hệ",
  wholesale: "Báo giá sỉ",
};

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  new: "Mới",
  in_progress: "Đang xử lý",
  done: "Đã xong",
};

export interface Inquiry {
  id: string;
  type: InquiryType;
  name: string;
  phone: string;
  email: string;
  company: string;
  quantity: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
}

// ───────────── Thống kê (chỉ ADMIN) ─────────────

export interface DashboardStats {
  range: { from: string; to: string; days: number };
  summary: {
    revenue: number;
    previousRevenue: number;
    orders: number;
    previousOrders: number;
    averageOrderValue: number;
    itemsSold: number;
    cancelledOrders: number;
    cancelRate: number;
  };
  pending: {
    ordersToConfirm: number;
    ordersInProgress: number;
    newInquiries: number;
  };
  catalog: {
    activeProducts: number;
    categories: number;
    lowStockVariants: number;
    outOfStockVariants: number;
  };
  revenueByDay: { date: string; revenue: number; orders: number }[];
  ordersByStatus: { status: OrderStatus; count: number }[];
  revenueByPaymentMethod: { method: PaymentMethod; revenue: number; orders: number }[];
  topProducts: { productId: string | null; name: string; quantity: number; revenue: number }[];
  revenueByCategory: { categoryId: string | null; name: string; revenue: number; quantity: number }[];
  stockAlerts: { productId: string; productName: string; packageSize: string; stockStatus: StockStatus }[];
  recentOrders: Pick<Order, "id" | "orderNumber" | "customerName" | "total" | "status" | "createdAt">[];
}

// ───────────── Cập nhật realtime (SSE) ─────────────

/** Nhóm dữ liệu web khách hàng cache — cũng là tên nhóm trong sự kiện "changed". */
export type CacheTag = "catalog" | "content" | "settings";

/** Sự kiện công khai (GET /events): chỉ báo nhóm dữ liệu nào vừa đổi, không chứa dữ liệu. */
export interface DataChangedEvent {
  type: "changed";
  tags: CacheTag[];
}

export type PublicRealtimeEvent = DataChangedEvent;

/** Sự kiện cho trang quản trị (GET /admin/events, cần đăng nhập). */
export type AdminRealtimeEvent =
  | DataChangedEvent
  | { type: "order.created"; id: string; orderNumber: string; customerName: string; total: number }
  | { type: "order.updated"; id: string; orderNumber: string; status: OrderStatus }
  | { type: "inquiry.created"; id: string; inquiryType: InquiryType; name: string }
  | { type: "inquiry.updated"; id: string }
  | { type: "comment.created"; id: string; postTitle: string; name: string }
  | { type: "comment.updated"; id: string };

// ───────────── Nội dung có định dạng (bài viết, chính sách, mô tả sản phẩm, trang Giới thiệu) ─────────────

/**
 * Thuộc tính đánh dấu "ô sản phẩm" trong nội dung HTML: `<div data-product-slug="xoai-cat"></div>`.
 * Web thay chỗ này bằng thẻ sản phẩm (ảnh, giá hiện tại, nút xem) lấy từ API.
 */
export const PRODUCT_EMBED_ATTR = "data-product-slug";

/** Nội dung lưu trước khi có trình soạn thảo là chữ thường; nội dung mới là HTML (bắt đầu bằng thẻ). */
export function isRichHtml(content: string): boolean {
  return /^\s*</.test(content);
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Chữ thường → HTML: dòng trống tách đoạn, xuống dòng đơn giữ bằng <br>. Nội dung đã là HTML thì giữ nguyên. */
export function plainTextToHtml(content: string): string {
  if (!content.trim()) return "";
  if (isRichHtml(content)) return content;
  return content
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

// ───────────── Trang nội dung cố định (admin sửa được) ─────────────

export const PAGE_SLUGS = ["about"] as const;
export type PageSlug = (typeof PAGE_SLUGS)[number];

export const PAGE_LABELS: Record<PageSlug, string> = {
  about: "Trang Giới thiệu",
};

export interface Page {
  slug: PageSlug;
  title: string;
  /** Dòng giới thiệu ngắn dưới tiêu đề. */
  description: string;
  /** HTML đã được API lọc. */
  content: string;
  /** null = chưa từng lưu, đang dùng nội dung mặc định. */
  updatedAt: string | null;
}

// ───────────── Bình luận bài viết ─────────────

/** pending: chờ duyệt (mặc định, chưa hiện trên web) · approved: đang hiện · hidden: admin ẩn / spam. */
export const COMMENT_STATUSES = ["pending", "approved", "hidden"] as const;
export type CommentStatus = (typeof COMMENT_STATUSES)[number];

export const COMMENT_STATUS_LABELS: Record<CommentStatus, string> = {
  pending: "Chờ duyệt",
  approved: "Đang hiện",
  hidden: "Đã ẩn",
};

/** Bình luận hiện trên web — không có email (email chỉ admin thấy). */
export interface PublicComment {
  id: string;
  name: string;
  content: string;
  /** Câu trả lời của cửa hàng ("" = chưa trả lời). */
  reply: string;
  createdAt: string;
  repliedAt: string | null;
}

export interface Comment extends PublicComment {
  email: string;
  status: CommentStatus;
  post: { id: string; slug: string; title: string };
}

export interface CreateCommentInput {
  name: string;
  email: string;
  content: string;
  /** Ô ẩn chống bot. */
  website: string;
}
