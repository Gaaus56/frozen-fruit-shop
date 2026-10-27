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

/**
 * Quyền admin cấp cho từng nhân viên (STAFF) — mỗi quyền mở một mục trong trang quản trị.
 * ADMIN luôn có mọi quyền. Tổng quan bán hàng, Thông tin cửa hàng, Tài khoản nhân viên chỉ ADMIN.
 */
export const STAFF_PERMISSIONS = [
  "orders",
  "inquiries",
  "products",
  "categories",
  "banners",
  "homeBlocks",
  "posts",
  "comments",
  "pages",
  "policies",
] as const;
export type StaffPermission = (typeof STAFF_PERMISSIONS)[number];

export const STAFF_PERMISSION_LABELS: Record<StaffPermission, { label: string; hint: string }> = {
  orders: { label: "Đơn hàng", hint: "Xem, xác nhận, cập nhật trạng thái đơn" },
  inquiries: { label: "Liên hệ & báo giá", hint: "Xem và xử lý tin nhắn khách gửi" },
  products: { label: "Sản phẩm", hint: "Thêm, sửa giá, tồn kho, ảnh sản phẩm" },
  categories: { label: "Danh mục", hint: "Thêm, sửa, ẩn danh mục sản phẩm" },
  banners: { label: "Banner", hint: "Banner trang chủ và đầu các trang" },
  homeBlocks: { label: "Khối trang chủ", hint: "Nội dung tự soạn trên trang chủ" },
  posts: { label: "Bài viết", hint: "Kiến thức, tuyển dụng" },
  comments: { label: "Bình luận", hint: "Duyệt, trả lời, xoá bình luận" },
  pages: { label: "Trang Giới thiệu", hint: "Nội dung trang Giới thiệu" },
  policies: { label: "Chính sách", hint: "Đổi trả, giao hàng, bảo mật…" },
};

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  /** Quyền của nhân viên; ADMIN trả về đủ mọi quyền. */
  permissions: StaffPermission[];
  /** Đã bật xác thực 2 lớp (mã OTP từ app Authenticator). */
  otpEnabled: boolean;
}

// ───────────── Xác thực 2 lớp (OTP) ─────────────

/** Đăng nhập đúng mật khẩu nhưng tài khoản đã bật OTP → nhập mã 6 số với `otpToken` (hết hạn sau 5 phút). */
export interface OtpChallenge {
  otpRequired: true;
  otpToken: string;
  expiresAt: string;
}

/** Mã lỗi (403) khi thao tác nhạy cảm cần nhập lại mã OTP. */
export const OTP_REQUIRED = "OTP_REQUIRED";
/** Nhập mã OTP xong được làm thao tác nhạy cảm trong bấy nhiêu phút mà không phải nhập lại. */
export const OTP_STEP_UP_MINUTES = 10;

export interface OtpStatus {
  enabled: boolean;
  enabledAt: string | null;
  /** Số mã dự phòng chưa dùng. */
  recoveryCodesLeft: number;
}

/** Bật OTP bước 1: quét QR (hoặc gõ tay khoá `secret`) trong app Authenticator. */
export interface OtpSetup {
  secret: string;
  uri: string;
  qrDataUrl: string;
}

/** Mã dự phòng — chỉ hiện đúng một lần lúc tạo. */
export interface OtpRecoveryCodes {
  recoveryCodes: string[];
}

/** ADMIN có mọi quyền; STAFF chỉ có quyền được admin cấp. */
export function hasPermission(user: Pick<AuthUser, "role" | "permissions">, permission: StaffPermission): boolean {
  return user.role === "ADMIN" || user.permissions.includes(permission);
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

/**
 * Biểu tượng admin chọn cho thẻ cam kết — icon nét (SVG, vẽ bằng `currentColor`) nên đổi màu theo chủ đề web,
 * khác emoji (màu cố định, mỗi máy vẽ một kiểu). Lưu tên icon trong DB; `d` là đường vẽ trên khung 24×24.
 */
export const ASSURANCE_ICONS = ["snowflake", "refresh", "phone", "truck", "check", "leaf", "clock", "card", "gift", "shield"] as const;
export type AssuranceIcon = (typeof ASSURANCE_ICONS)[number];

export const ASSURANCE_ICON_INFO: Record<AssuranceIcon, { label: string; d: string }> = {
  snowflake: { label: "Bông tuyết (giữ lạnh)", d: "M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 2.5L15 4M9 20l3-2.5 3 2.5M3.6 10.6l3.7.9-1.2 3.6M20.4 13.4l-3.7-.9 1.2-3.6M6.1 8.9 7.3 12.5M17.9 15.1l-1.2-3.6" },
  refresh: { label: "Mũi tên vòng (đổi trả)", d: "M3 12a9 9 0 0 1 15.4-6.4L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.4 6.4L3 16M3 21v-5h5" },
  phone: { label: "Điện thoại", d: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" },
  truck: { label: "Xe giao hàng", d: "M2 5h12v11H2zM14 9h4l4 4v3h-8M6.5 19.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17.5 19.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" },
  check: { label: "Dấu tích (đảm bảo)", d: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM7.5 12.5l3 3 6-6.5" },
  leaf: { label: "Lá (tự nhiên)", d: "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10zM2 21c0-3 1.9-5.4 5.1-6 2.4-.5 4.9-2 5.9-3" },
  clock: { label: "Đồng hồ (giao nhanh)", d: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2" },
  card: { label: "Thẻ (thanh toán)", d: "M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM2 10h20M6 15h4" },
  gift: { label: "Hộp quà", d: "M3 8h18v4H3zM12 8v13M19 12v9H5v-9M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5" },
  shield: { label: "Khiên (an toàn)", d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4" },
};

/** Biểu tượng emoji đã lưu trước đây → tên icon tương ứng. */
const LEGACY_ASSURANCE_ICONS: Record<string, AssuranceIcon> = {
  "❄️": "snowflake", "❄": "snowflake", "↺": "refresh", "☎": "phone", "📞": "phone", "🚚": "truck", "✅": "check",
  "🌿": "leaf", "⏱️": "clock", "⏱": "clock", "💳": "card", "🎁": "gift", "🛡️": "shield", "🛡": "shield",
};

/** Tên icon hợp lệ cho một giá trị đã lưu (emoji cũ hoặc giá trị lạ → icon gần nhất / dấu tích). */
export function normalizeAssuranceIcon(value: string): AssuranceIcon {
  const text = value.trim();
  if ((ASSURANCE_ICONS as readonly string[]).includes(text)) return text as AssuranceIcon;
  return LEGACY_ASSURANCE_ICONS[text] ?? "check";
}

/** Dùng khi admin chưa chỉnh thẻ cam kết lần nào. `{phone}`, `{hotlineHours}` được thay bằng thông tin cửa hàng. */
export const DEFAULT_PRODUCT_ASSURANCES: ProductAssurance[] = [
  { icon: "snowflake", title: "Giao hàng giữ lạnh", text: "Đóng thùng xốp + đá gel, giữ đông suốt đường đi.", linkUrl: "/policies/chinh-sach-giao-hang" },
  { icon: "refresh", title: "Đổi trả khi hàng lỗi", text: "Quay video lúc mở thùng để được đổi mới hoặc hoàn tiền.", linkUrl: "/policies/chinh-sach-doi-tra" },
  { icon: "phone", title: "Tư vấn {hotlineHours}", text: "{phone}", linkUrl: "tel:{phone}" },
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
  productAssurances: DEFAULT_PRODUCT_ASSURANCES,
};

/** "0396799579" → "0396 799 579" */
/**
 * "0396799579" → "0396 799 579". Các cụm nối bằng dấu cách không ngắt dòng (U+00A0) để số điện thoại
 * luôn nằm trọn một dòng ở mọi nơi hiển thị (hết chỗ thì cả số xuống dòng, không bị bẻ đôi).
 * Link `tel:` vẫn bỏ khoảng trắng bằng `.replace(/\s/g, "")` (\s khớp cả U+00A0).
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const grouped = digits.length === 10 ? `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}` : phone.trim();
  return grouped.replace(/ /g, "\u00a0");
}

// ───────────── Đơn hàng ─────────────

export type OrderStatus = "pending" | "confirmed" | "packing" | "shipping" | "delivered" | "cancelled";
/** Cửa hàng chỉ nhận thanh toán khi giao hàng (đã bỏ chuyển khoản). */
export type PaymentMethod = "cod";
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
};

/** Nhãn hình thức thanh toán; giá trị cũ không còn (bill "bank_transfer" lưu trên máy khách) → COD, khớp database đã đổi. */
export function paymentMethodLabel(method: string): string {
  return PAYMENT_METHOD_LABELS[method as PaymentMethod] ?? PAYMENT_METHOD_LABELS.cod;
}

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

/**
 * Bố cục chia đôi: `<div data-columns="2"><div data-column>…</div><div data-column>…</div></div>`.
 * Mỗi cột chứa đoạn văn / tiêu đề / ảnh / danh sách / khung ghi chú — không lồng cột, không ô sản phẩm.
 * Web: 2 cột cạnh nhau từ màn hình vừa trở lên, điện thoại xếp dọc.
 */
export const COLUMNS_ATTR = "data-columns";
export const COLUMN_ATTR = "data-column";

/**
 * Màu chữ admin được chọn — chỉ các màu trong chủ đề web, lưu dạng `<span data-color="red">`
 * (không lưu mã màu) để đổi màu chủ đề thì nội dung cũ đổi theo.
 */
export const TEXT_COLORS = ["red", "green", "gray"] as const;
export type TextColor = (typeof TEXT_COLORS)[number];
export const TEXT_COLOR_LABELS: Record<TextColor, string> = { red: "Đỏ", green: "Xanh lá", gray: "Xám" };

/** Căn ngang đoạn văn / tiêu đề / hàng nút: `data-align="center|right"` (không có = căn trái). */
export const TEXT_ALIGNS = ["left", "center", "right"] as const;
export type TextAlign = (typeof TEXT_ALIGNS)[number];

/** Căn dọc nội dung hai cột so với nhau: `data-valign="top|bottom"` trên khung cột (không có = giữa). */
export const COLUMN_VALIGNS = ["top", "center", "bottom"] as const;
export type ColumnValign = (typeof COLUMN_VALIGNS)[number];

/**
 * Hàng nút điều hướng trong nội dung: `<p data-buttons><a data-button="red" href="/products">Xem sản phẩm</a>…</p>`.
 * Màu nút chỉ chọn trong chủ đề web, giống các nút có sẵn của trang.
 */
export const BUTTON_STYLES = ["red", "dark", "light", "green"] as const;
export type ButtonStyle = (typeof BUTTON_STYLES)[number];
export const BUTTON_STYLE_LABELS: Record<ButtonStyle, string> = {
  red: "Đỏ (nút chính)",
  dark: "Đỏ đậm",
  light: "Trắng viền",
  green: "Xanh lá",
};
export const MAX_BUTTONS_PER_ROW = 3;

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

// ───────────── Khối nội dung tự soạn trên trang chủ ─────────────

/** Vị trí khối trên trang chủ, xen giữa các phần có sẵn. */
export const HOME_BLOCK_POSITIONS = ["after_hero", "after_categories", "after_products", "after_news"] as const;
export type HomeBlockPosition = (typeof HOME_BLOCK_POSITIONS)[number];

export const HOME_BLOCK_POSITION_LABELS: Record<HomeBlockPosition, string> = {
  after_hero: "Đầu trang chủ (ngay dưới banner)",
  after_categories: "Sau Danh mục sản phẩm",
  after_products: "Sau Sản phẩm",
  after_news: "Cuối trang (sau Tin tức)",
};

export interface HomeBlock {
  id: string;
  /** Tiêu đề khối (không bắt buộc) — hiện giống tiêu đề các phần khác của trang chủ. */
  title: string;
  /** HTML đã được API lọc. */
  content: string;
  /** true = nằm trong khung trắng bo góc như các phần khác; false = nằm thẳng trên nền trang. */
  framed: boolean;
  position: HomeBlockPosition;
  sortOrder: number;
  isActive: boolean;
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

// ───────────── Xem trước & sửa (admin mở web trong khung, bấm vào phần nào thì sửa phần đó) ─────────────

/**
 * Loại nội dung web gắn được nút "Sửa" khi admin xem trước. Web gắn `data-edit="<kind>:<id>"` lên phần tử;
 * admin đổi thành trang sửa tương ứng (editTargetPath).
 */
export const EDIT_KINDS = [
  "banner",
  "bannerNew",
  "homeBlock",
  "category",
  "product",
  "post",
  "policy",
  "page",
  "settings",
] as const;
export type EditKind = (typeof EDIT_KINDS)[number];

/** Mục trong trang "Thông tin cửa hàng" (id của khung trên trang admin, để nhảy thẳng tới). */
export const SETTINGS_SECTIONS = ["brand", "contact", "address", "assurances", "legal"] as const;
export type SettingsSection = (typeof SETTINGS_SECTIONS)[number];

/** Thông điệp qua lại giữa trang admin và web trong khung xem trước (window.postMessage). */
export type PreviewMessage =
  /** Admin → web: bật xem trước, chọn chế độ sửa (hiện viền + nút Sửa) hoặc duyệt (bấm như khách). */
  | { type: "tc28:preview"; mode: "edit" | "browse" }
  /** Web → admin: code trên web đã chạy xong, sẵn sàng nhận chế độ (tránh lỡ lệnh gửi lúc trang còn đang tải). */
  | { type: "tc28:ready" }
  /** Web → admin: đang ở trang nào (để admin hiện đường dẫn và quay lại đúng chỗ). */
  | { type: "tc28:path"; path: string }
  /** Web → admin: admin bấm "Sửa" trên một phần. */
  | { type: "tc28:edit"; kind: EditKind; id: string; path: string };

/** Đường dẫn trang sửa trong admin cho một phần trên web; null nếu không nhận ra. */
export function editTargetPath(kind: string, id: string): string | null {
  const safeId = encodeURIComponent(id);
  switch (kind) {
    case "banner":
      return `/banners/${safeId}`;
    case "bannerNew":
      return `/banners/new?placement=${safeId}`;
    case "homeBlock":
      return `/home-blocks/${safeId}`;
    case "category":
      return `/categories/${safeId}`;
    case "product":
      return `/products/${safeId}`;
    case "post":
      return `/posts/${safeId}`;
    case "policy":
      return `/policies/${safeId}`;
    case "page":
      return `/pages/${safeId}`;
    case "settings":
      return (SETTINGS_SECTIONS as readonly string[]).includes(id) ? `/settings#${id}` : "/settings";
    default:
      return null;
  }
}

// ───────────── Lịch sử chỉnh sửa (chỉ ADMIN xem) ─────────────

export interface AuditChange {
  field: string;
  before: string | null;
  after: string | null;
}

export interface AuditLogEntry {
  id: string;
  userId: string | null;
  userName: string;
  userEmail: string;
  userRole: Role;
  /** create | update | delete | reset-password | reset-otp | otp-enable | otp-disable */
  action: string;
  /** Mục bị sửa (đoạn đường dẫn sau /admin/): products, orders, settings… */
  resource: string;
  entityId: string | null;
  entityLabel: string;
  changes: AuditChange[];
  createdAt: string;
}

export const AUDIT_RESOURCE_LABELS: Record<string, string> = {
  orders: "Đơn hàng",
  inquiries: "Liên hệ & báo giá",
  products: "Sản phẩm",
  categories: "Danh mục",
  banners: "Banner",
  "home-blocks": "Khối trang chủ",
  posts: "Bài viết",
  comments: "Bình luận",
  pages: "Trang nội dung",
  policies: "Chính sách",
  settings: "Thông tin cửa hàng",
  users: "Tài khoản nhân viên",
};
