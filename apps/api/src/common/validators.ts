import { Transform } from 'class-transformer';
import { Matches, ValidationOptions } from 'class-validator';

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
