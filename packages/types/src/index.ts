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
  isWholesaleAvailable: boolean;
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

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  category: string;
  isPublished: boolean;
  publishedAt: string;
}

export interface Banner {
  id: string;
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
  marqueeText: string;
  bankTransferInfo: string;
}

/**
 * Thông tin cửa hàng mặc định (từ docs/info/WEB_info.md) — dùng khi ADMIN chưa lưu cài đặt lần nào,
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
  marqueeText: "",
  bankTransferInfo: "",
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
  | { type: "inquiry.updated"; id: string };
