import { BadRequestException, type ValidationError } from '@nestjs/common';

/**
 * Thông báo lỗi validate tiếng Việt cho mọi DTO. Decorator đã có `message` tiếng Việt thì giữ nguyên; decorator
 * thiếu `message` (class-validator trả câu tiếng Anh mặc định, ví dụ "customerNote must be shorter than or equal
 * to 1000 characters") được dịch theo tên ràng buộc + tên trường, để web / admin không hiện tiếng Anh cho người dùng.
 */

/** Tên trường hiển thị cho người dùng; trường không có trong bảng → "Trường «tên»". */
const FIELD_LABELS: Record<string, string> = {
  name: 'Tên',
  title: 'Tiêu đề',
  slug: 'Đường dẫn (slug)',
  email: 'Email',
  password: 'Mật khẩu',
  phone: 'Số điện thoại',
  customerName: 'Họ và tên',
  customerPhone: 'Số điện thoại',
  customerEmail: 'Email',
  customerNote: 'Ghi chú',
  shippingAddress: 'Địa chỉ giao hàng',
  orderNumber: 'Mã đơn hàng',
  items: 'Giỏ hàng',
  variantId: 'Quy cách sản phẩm',
  quantity: 'Số lượng',
  price: 'Giá bán',
  compareAtPrice: 'Giá gốc',
  shippingFee: 'Phí vận chuyển',
  discount: 'Giảm giá',
  internalNote: 'Ghi chú nội bộ',
  note: 'Ghi chú',
  status: 'Trạng thái',
  paymentStatus: 'Trạng thái thanh toán',
  content: 'Nội dung',
  message: 'Nội dung',
  description: 'Mô tả',
  excerpt: 'Mô tả ngắn',
  reply: 'Trả lời',
  packageSize: 'Quy cách',
  sku: 'Mã SKU',
  weightGrams: 'Khối lượng',
  shelfLifeDays: 'Hạn sử dụng',
  sortOrder: 'Thứ tự',
  categoryId: 'Danh mục',
  image: 'Ảnh',
  images: 'Ảnh',
  imageUrl: 'Ảnh',
  coverImage: 'Ảnh bìa',
  variants: 'Quy cách',
  permissions: 'Quyền',
  page: 'Trang',
  pageSize: 'Số dòng mỗi trang',
  q: 'Từ khoá tìm kiếm',
  from: 'Từ ngày',
  to: 'Đến ngày',
  publishedAt: 'Ngày đăng',
  code: 'Mã OTP',
};

const label = (property: string) => FIELD_LABELS[property] ?? `Trường «${property}»`;

/** Câu mặc định tiếng Anh của class-validator (decorator không truyền `message`). */
const DEFAULT_ENGLISH = /^(each value in )?[\w.[\]]+ (must|should|has to|is not|is required)\b|^property [\w.]+ should not exist$/;

function translate(key: string, property: string, english: string): string {
  const n = english.match(/-?\d[\d.,]*/)?.[0];
  const field = label(property);
  switch (key) {
    case 'maxLength':
      return `${field} tối đa ${n} ký tự`;
    case 'minLength':
      return `${field} phải có ít nhất ${n} ký tự`;
    case 'max':
      return `${field} không được lớn hơn ${Number(n).toLocaleString('vi-VN')}`;
    case 'min':
      return `${field} không được nhỏ hơn ${Number(n).toLocaleString('vi-VN')}`;
    case 'isInt':
      return `${field} phải là số nguyên`;
    case 'isNumber':
    case 'isNumberString':
      return `${field} phải là số`;
    case 'isString':
      return `${field} phải là chữ`;
    case 'isBoolean':
      return `${field} không hợp lệ (đúng / sai)`;
    case 'isEmail':
      return 'Email không hợp lệ';
    case 'isNotEmpty':
    case 'isDefined':
      return `Vui lòng nhập ${field.toLowerCase()}`;
    case 'arrayMaxSize':
      return `${field} tối đa ${n} mục`;
    case 'arrayMinSize':
    case 'arrayNotEmpty':
      return `${field} cần ít nhất ${n ?? 1} mục`;
    case 'arrayUnique':
      return `${field} có mục bị trùng`;
    case 'isArray':
      return `${field} phải là danh sách`;
    case 'isDateString':
    case 'isISO8601':
    case 'isDate':
      return `${field}: ngày giờ không hợp lệ`;
    case 'whitelistValidation':
      return `Trường «${property}» không được phép gửi lên`;
    case 'isUrl':
      return `${field}: đường dẫn không hợp lệ`;
    default:
      return `${field} không hợp lệ`;
  }
}

function collect(errors: ValidationError[], out: string[]) {
  for (const error of errors) {
    // Trường bắt buộc bị bỏ trống: ràng buộc đầu tiên báo lỗi có thể là "tối đa N ký tự" — nói thẳng là đang thiếu.
    const missing = (error.value === undefined || error.value === null) && !error.constraints?.whitelistValidation;
    for (const [key, message] of Object.entries(error.constraints ?? {})) {
      if (!DEFAULT_ENGLISH.test(message)) out.push(message);
      else out.push(missing ? `Thiếu thông tin: ${label(error.property)}` : translate(key, error.property, message));
    }
    if (error.children?.length) collect(error.children, out);
  }
}

/** Dùng làm `exceptionFactory` của ValidationPipe — giữ đúng dạng lỗi mặc định `{ statusCode, message: string[], error }`. */
export function vietnameseValidationErrors(errors: ValidationError[]): BadRequestException {
  const messages: string[] = [];
  collect(errors, messages);
  return new BadRequestException({ statusCode: 400, message: messages.length ? messages : ['Dữ liệu gửi lên không hợp lệ.'], error: 'Bad Request' });
}
