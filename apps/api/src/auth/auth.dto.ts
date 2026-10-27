import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export const PASSWORD_MIN_LENGTH = 8;

export class LoginDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @IsString()
  @MinLength(1, { message: 'Vui lòng nhập mật khẩu' })
  @MaxLength(200)
  password!: string;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(1, { message: 'Vui lòng nhập mật khẩu hiện tại' })
  currentPassword!: string;

  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH, { message: `Mật khẩu mới phải có ít nhất ${PASSWORD_MIN_LENGTH} ký tự` })
  @MaxLength(200)
  newPassword!: string;
}

/** Mã 6 số trong app Authenticator, hoặc mã dự phòng dạng "ABCD-EF23". */
export class OtpCodeDto {
  @IsString()
  @MinLength(6, { message: 'Vui lòng nhập mã OTP' })
  @MaxLength(20)
  code!: string;
}

export class OtpLoginDto extends OtpCodeDto {
  @IsString()
  @MaxLength(2000)
  otpToken!: string;
}

export class PasswordConfirmDto {
  @IsString()
  @MinLength(1, { message: 'Vui lòng nhập mật khẩu' })
  @MaxLength(200)
  password!: string;
}

export class OtpDisableDto extends OtpCodeDto {
  @IsString()
  @MinLength(1, { message: 'Vui lòng nhập mật khẩu' })
  @MaxLength(200)
  password!: string;
}
