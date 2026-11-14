import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { RateLimit } from '../common/rate-limit.guard.js';
import { Auth, CurrentUser, type RequestUser } from './auth.guard.js';
import { ChangePasswordDto, LoginDto } from './auth.dto.js';
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

  @Get('me')
  @Auth()
  me(@CurrentUser() user: RequestUser) {
    return this.authService.me(user.id);
  }

  @Post('change-password')
  @HttpCode(200)
  @Auth()
  changePassword(@CurrentUser() user: RequestUser, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.id, dto);
  }
}
