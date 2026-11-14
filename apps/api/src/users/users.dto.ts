import { Transform } from 'class-transformer';
import { ArrayUnique, IsArray, IsBoolean, IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { STAFF_PERMISSIONS, type StaffPermission } from '@frozen-fruit-shop/types';
import { PASSWORD_MIN_LENGTH } from '../auth/auth.dto.js';
import { Trim } from '../common/validators.js';

export class CreateStaffDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @Trim()
  @IsString()
  @MinLength(1, { message: 'Vui lòng nhập họ tên' })
  @MaxLength(100)
  name!: string;

  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH, { message: `Mật khẩu phải có ít nhất ${PASSWORD_MIN_LENGTH} ký tự` })
  @MaxLength(200)
  password!: string;

  /** Mục nhân viên được dùng; bỏ trống = chưa cấp quyền nào (chỉ vào được Tài khoản của tôi). */
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn(STAFF_PERMISSIONS, { each: true, message: 'Quyền không hợp lệ' })
  permissions?: StaffPermission[];
}

export class UpdateStaffDto {
  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn(STAFF_PERMISSIONS, { each: true, message: 'Quyền không hợp lệ' })
  permissions?: StaffPermission[];
}

export class ResetPasswordDto {
  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH, { message: `Mật khẩu phải có ít nhất ${PASSWORD_MIN_LENGTH} ký tự` })
  @MaxLength(200)
  password!: string;
}
