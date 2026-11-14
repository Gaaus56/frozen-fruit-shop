import 'express';
import type { RequestUser } from './auth.guard.js';

declare module 'express' {
  interface Request {
    user?: RequestUser;
  }
}
