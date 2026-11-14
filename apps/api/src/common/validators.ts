import { Transform } from 'class-transformer';
import { Matches, ValidateBy, ValidationOptions } from 'class-validator';

/** Ảnh hợp lệ: đường dẫn do API cấp ("/uploads/...") hoặc URL http(s) bên ngoài. */
export function IsImagePath(options?: ValidationOptions) {
  return Matches(/^(\/uploads\/[\w\-./]+|https?:\/\/\S+)$/i, {
    message: 'Đường dẫn ảnh không hợp lệ',
    ...options,
  });
}

/** Slug chỉ gồm chữ thường không dấu, số và dấu gạch ngang. */
export function IsSlug(options?: ValidationOptions) {
  return Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug chỉ gồm chữ thường không dấu, số và dấu gạch ngang',
    ...options,
  });
}

/** Cắt khoảng trắng đầu/cuối cho mọi chuỗi đầu vào. */
export function Trim() {
  return Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));
}

/**
 * Mật khẩu tối đa 72 byte: bcrypt chỉ dùng 72 byte đầu, phần sau bị bỏ qua (hai mật khẩu dài chỉ khác phần đuôi
 * sẽ được coi là giống nhau). Chữ tiếng Việt có dấu chiếm 2–3 byte nên đếm byte, không đếm ký tự.
 */
export function IsBcryptSafe(options?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isBcryptSafe',
      validator: { validate: (value: unknown) => typeof value === 'string' && Buffer.byteLength(value, 'utf8') <= 72 },
    },
    { message: 'Mật khẩu quá dài (tối đa khoảng 72 ký tự không dấu, ít hơn nếu có dấu tiếng Việt)', ...options },
  );
}
