import {
  BANNER_PLACEMENT_LABELS,
  COMMENT_STATUS_LABELS,
  HOME_BLOCK_POSITION_LABELS,
  INQUIRY_STATUS_LABELS,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  POST_TYPE_LABELS,
  STAFF_PERMISSION_LABELS,
} from "@frozen-fruit-shop/types";

export const ACTION_LABELS: Record<string, string> = {
  create: "Thêm mới",
  update: "Sửa",
  delete: "Xoá",
  "reset-password": "Đặt lại mật khẩu",
  "reset-otp": "Tắt OTP nhân viên",
  "otp-enable": "Bật OTP",
  "otp-disable": "Tắt OTP",
};

/** Tên trường trong database → tên tiếng Việt. Trường lạ hiện nguyên tên. */
const FIELD_LABELS: Record<string, string> = {
  name: "Tên",
  title: "Tiêu đề",
  slug: "Đường dẫn",
  description: "Mô tả",
  shortDescription: "Mô tả ngắn",
  content: "Nội dung",
  excerpt: "Tóm tắt",
  coverImage: "Ảnh bìa",
  image: "Ảnh",
  images: "Ảnh sản phẩm",
  variants: "Quy cách & giá",
  items: "Sản phẩm trong đơn",
  price: "Giá",
  isActive: "Hiển thị / hoạt động",
  isFeatured: "Nổi bật",
  isPublished: "Đã đăng",
  publishedAt: "Ngày đăng",
  sortOrder: "Thứ tự",
  status: "Trạng thái",
  paymentStatus: "Thanh toán",
  paymentMethod: "Hình thức thanh toán",
  shippingFee: "Phí vận chuyển",
  discount: "Giảm giá",
  subtotal: "Tạm tính",
  total: "Tổng tiền",
  adminNote: "Ghi chú nội bộ",
  customerName: "Tên khách",
  customerPhone: "SĐT khách",
  customerEmail: "Email khách",
  shippingAddress: "Địa chỉ giao",
  customerNote: "Ghi chú của khách",
  placement: "Vị trí banner",
  linkUrl: "Liên kết",
  ctaLabel: "Chữ trên nút",
  type: "Loại",
  framed: "Trong khung",
  position: "Vị trí trên trang chủ",
  reply: "Trả lời",
  storageInfo: "Bảo quản",
  storeName: "Tên cửa hàng",
  shortName: "Tên rút gọn",
  phone: "Hotline",
  hotlineHours: "Giờ nhận điện thoại",
  email: "Email",
  address: "Địa chỉ",
  addressLandmark: "Mốc dễ tìm",
  mapUrl: "Link bản đồ",
  facebookUrl: "Facebook",
  zaloPhone: "Số Zalo",
  taxCode: "Mã số thuế",
  taxNote: "Ghi chú MST",
  marqueeEnabled: "Hiện dải chữ chạy",
  marqueeText: "Dòng chữ chạy",
  bankTransferInfo: "Thông tin chuyển khoản (đã bỏ)", // chỉ còn trong lịch sử cũ
  productAssurances: "Thẻ cam kết",
  permissions: "Quyền",
  role: "Vai trò",
  categoryId: "Danh mục",
};

export function fieldLabel(field: string) {
  return FIELD_LABELS[field] ?? field;
}

/** Giá trị mã (trạng thái, vị trí, true/false…) → chữ dễ hiểu, theo mục đang xem. */
export function valueLabel(resource: string, field: string, value: string | null): string {
  if (value === null) return "(trống)";
  if (value === "true") return "Có";
  if (value === "false") return "Không";
  const maps: Record<string, Record<string, string>> = {
    "orders.status": ORDER_STATUS_LABELS,
    "orders.paymentStatus": PAYMENT_STATUS_LABELS,
    // "bank_transfer": lịch sử trước khi bỏ chuyển khoản.
    "orders.paymentMethod": { ...PAYMENT_METHOD_LABELS, bank_transfer: "Chuyển khoản (đã bỏ)" },
    "inquiries.status": INQUIRY_STATUS_LABELS,
    "comments.status": COMMENT_STATUS_LABELS,
    "banners.placement": BANNER_PLACEMENT_LABELS,
    "posts.type": POST_TYPE_LABELS,
    "home-blocks.position": HOME_BLOCK_POSITION_LABELS,
  };
  const map = maps[`${resource}.${field}`];
  if (map?.[value]) return map[value];
  if (field === "permissions") {
    // Danh sách quyền lưu dạng ["orders","posts"].
    try {
      const list = JSON.parse(value) as string[];
      return list.map((key) => STAFF_PERMISSION_LABELS[key as keyof typeof STAFF_PERMISSION_LABELS]?.label ?? key).join(", ") || "(không có)";
    } catch {
      return value;
    }
  }
  return value;
}
