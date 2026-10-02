import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
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
}

export class ResetPasswordDto {
  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH, { message: `Mật khẩu phải có ít nhất ${PASSWORD_MIN_LENGTH} ký tự` })
  @MaxLength(200)
  password!: string;
}
