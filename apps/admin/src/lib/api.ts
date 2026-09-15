import { getToken } from './session';

export const API_URL = process.env.API_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

/** Dùng cho các trang danh sách/chi tiết (GET) — endpoint đọc dữ liệu không cần đăng nhập. */
export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new ApiError(`Không tải được dữ liệu từ ${path}`, res.status);
  }
  return res.json() as Promise<T>;
}

/** Dùng cho các thao tác ghi dữ liệu (POST/PATCH/DELETE) — cần token admin. */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getToken();
  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
    cache: 'no-store',
  });
}

/** Gọi apiFetch và ném lỗi có thông điệp tiếng Việt nếu request thất bại. */
export async function apiMutate(path: string, init: RequestInit = {}): Promise<void> {
  const res = await apiFetch(path, init);
  if (!res.ok) {
    if (res.status === 401) {
      throw new ApiError('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.', 401);
    }
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.message ?? `Thao tác thất bại (mã lỗi ${res.status})`, res.status);
  }
}
