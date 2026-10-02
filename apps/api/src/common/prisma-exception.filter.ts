import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';

/**
 * Đổi lỗi Prisma thường gặp thành mã HTTP và thông báo tiếng Việt dễ hiểu,
 * thay vì để lộ lỗi 500 kèm chi tiết truy vấn.
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    const map: Record<string, [number, string]> = {
      P2002: [HttpStatus.CONFLICT, this.uniqueMessage(exception)],
      P2003: [HttpStatus.CONFLICT, 'Dữ liệu đang được sử dụng ở nơi khác nên không thể thực hiện thao tác này.'],
      P2025: [HttpStatus.NOT_FOUND, 'Không tìm thấy dữ liệu.'],
    };

    const mapped = map[exception.code];
    if (!mapped) {
      this.logger.error(exception.message);
      response.status(500).json({ statusCode: 500, message: 'Lỗi hệ thống, vui lòng thử lại sau.' });
      return;
    }

    const [statusCode, message] = mapped;
    response.status(statusCode).json({ statusCode, message });
  }

  private uniqueMessage(exception: Prisma.PrismaClientKnownRequestError): string {
    const target = exception.meta?.target;
    const fields = Array.isArray(target) ? target.join(', ') : String(target ?? '');
    if (fields.includes('slug')) return 'Đường dẫn (slug) này đã được dùng, hãy chọn tên khác.';
    if (fields.includes('sku')) return 'Mã SKU này đã tồn tại.';
    if (fields.includes('email')) return 'Email này đã được dùng cho tài khoản khác.';
    return 'Dữ liệu bị trùng với bản ghi đã có.';
  }
}
