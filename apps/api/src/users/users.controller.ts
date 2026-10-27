import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { Auth, RequireOtp } from '../auth/auth.guard.js';
import { CreateStaffDto, ResetPasswordDto, UpdateStaffDto } from './users.dto.js';
import { UsersService } from './users.service.js';

@Controller('admin/users')
@Auth('ADMIN')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list() {
    return this.usersService.list();
  }

  // Mọi thao tác ghi tài khoản nhân viên đều cần nhập lại mã OTP (nếu chủ cửa hàng đã bật OTP).
  @Post()
  @RequireOtp()
  create(@Body() dto: CreateStaffDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @RequireOtp()
  update(@Param('id') id: string, @Body() dto: UpdateStaffDto) {
    return this.usersService.update(id, dto);
  }

  @Post(':id/reset-password')
  @HttpCode(200)
  @RequireOtp()
  resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto) {
    return this.usersService.resetPassword(id, dto);
  }

  /** Nhân viên mất điện thoại: tắt OTP giúp để họ đăng nhập lại bằng mật khẩu rồi tự bật lại. */
  @Post(':id/reset-otp')
  @HttpCode(200)
  @RequireOtp()
  resetOtp(@Param('id') id: string) {
    return this.usersService.resetOtp(id);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequireOtp()
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
  }
}
