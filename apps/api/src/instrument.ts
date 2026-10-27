// Theo dõi lỗi bằng Sentry — import ĐẦU TIÊN trong main.ts (trước mọi module khác) để Sentry gắn được vào Nest/Express.
// Chỉ bật khi có SENTRY_DSN (tạo project "Node.js / NestJS" trên sentry.io); không có thì không gửi gì.
import * as Sentry from '@sentry/nestjs';
import { env } from './config/env.js';

const dsn = process.env.SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: process.env.SENTRY_ENVIRONMENT ?? (env.isProduction ? 'production' : 'development'),
  // Chỉ cần báo lỗi; không đo hiệu năng (tốn hạn mức gói miễn phí).
  tracesSampleRate: 0,
  // Không gửi thông tin người dùng, cookie, body (mật khẩu, mã OTP, thông tin khách); header chỉ giữ vài cái vô hại.
  dataCollection: {
    userInfo: false,
    cookies: false,
    httpBodies: [],
    httpHeaders: { allow: ['user-agent', 'content-type', 'referer'] },
    urlQueryParams: { deny: ['otpToken', 'token', 'phone', 'q'] },
  },
  beforeSend(event) {
    if (event.request?.headers) {
      delete event.request.headers.authorization;
      delete event.request.headers.cookie;
    }
    delete event.request?.data; // body có thể chứa mật khẩu, mã OTP, thông tin khách
    return event;
  },
});
