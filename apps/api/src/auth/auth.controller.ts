import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { RateLimit } from '../common/rate-limit.guard.js';
import { Auth, CurrentUser, RequireOtp, type RequestUser } from './auth.guard.js';
import { ChangePasswordDto, LoginDto, OtpCodeDto, OtpDisableDto, OtpLoginDto, PasswordConfirmDto } from './auth.dto.js';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @RateLimit(10, 60)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /** Bước 2 khi tài khoản đã bật OTP: mã 6 số (hoặc mã dự phòng) + otpToken nhận ở bước 1. */
  @Post('login/otp')
  @HttpCode(200)
  @RateLimit(10, 60)
  loginWithOtp(@Body() dto: OtpLoginDto) {
    return this.authService.loginWithOtp(dto);
  }

  @Get('me')
  @Auth()
  me(@CurrentUser() user: RequestUser) {
    return this.authService.me(user.id);
  }

  @Post('change-password')
  @HttpCode(200)
  @Auth()
  @RequireOtp()
  changePassword(@CurrentUser() user: RequestUser, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.id, dto, user.otpVerifiedAt);
  }

  // ─────────── Xác thực 2 lớp (OTP) của chính mình ───────────

  @Get('otp')
  @Auth()
  otpStatus(@CurrentUser() user: RequestUser) {
    return this.authService.otpStatus(user.id);
  }

  @Post('otp/setup')
  @HttpCode(200)
  @Auth()
  @RateLimit(10, 60)
  otpSetup(@CurrentUser() user: RequestUser, @Body() dto: PasswordConfirmDto) {
    return this.authService.otpSetup(user.id, dto);
  }

  @Post('otp/enable')
  @HttpCode(200)
  @Auth()
  @RateLimit(10, 60)
  otpEnable(@CurrentUser() user: RequestUser, @Body() dto: OtpCodeDto) {
    return this.authService.otpEnable(user.id, dto);
  }

  @Post('otp/disable')
  @HttpCode(204)
  @Auth()
  @RateLimit(10, 60)
  async otpDisable(@CurrentUser() user: RequestUser, @Body() dto: OtpDisableDto) {
    await this.authService.otpDisable(user.id, dto);
  }

  @Post('otp/recovery-codes')
  @HttpCode(200)
  @Auth()
  @RateLimit(10, 60)
  otpRecoveryCodes(@CurrentUser() user: RequestUser, @Body() dto: OtpCodeDto) {
    return this.authService.otpRegenerateRecoveryCodes(user.id, dto);
  }

  /** Nhập lại mã cho thao tác nhạy cảm (API trả 403 OTP_REQUIRED) → token mới dùng được OTP_STEP_UP_MINUTES phút. */
  @Post('otp/step-up')
  @HttpCode(200)
  @Auth()
  @RateLimit(10, 60)
  otpStepUp(@CurrentUser() user: RequestUser, @Body() dto: OtpCodeDto) {
    return this.authService.otpStepUp(user.id, dto);
  }
}
