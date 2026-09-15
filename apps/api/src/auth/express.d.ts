import 'express';

declare module 'express' {
  interface Request {
    admin?: { sub: string; email: string };
  }
}
