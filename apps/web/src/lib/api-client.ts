// Gọi API từ trình duyệt (Client Components): báo giá giỏ hàng, đặt hàng, tra cứu đơn, gửi liên hệ.
// Trình duyệt gọi thẳng API (không qua server web) để API giới hạn tần suất theo đúng IP khách.
import type {
  CartLineInput,
  CreateCommentInput,
  CreateOrderResponse,
  InquiryType,
  OrderLookupResult,
  OrderQuote,
  PaymentMethod,
} from "@frozen-fruit-shop/types";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "content-type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiRequestError("Không kết nối được máy chủ. Vui lòng kiểm tra mạng và thử lại.", 0);
  }

  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      body && typeof body === "object" && "message" in body
        ? Array.isArray(body.message)
          ? String(body.message[0])
          : String(body.message)
        : "Có lỗi xảy ra, vui lòng thử lại.";
    throw new ApiRequestError(message, res.status);
  }
  return body as T;
}

export function quoteCart(items: CartLineInput[]): Promise<OrderQuote> {
  return request<OrderQuote>("/orders/quote", { method: "POST", body: JSON.stringify({ items }) });
}

export interface PlaceOrderInput {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  customerNote: string;
  paymentMethod: PaymentMethod;
  items: CartLineInput[];
  website: string;
}

export function placeOrder(input: PlaceOrderInput): Promise<CreateOrderResponse> {
  return request<CreateOrderResponse>("/orders", { method: "POST", body: JSON.stringify(input) });
}

export function lookupOrder(orderNumber: string, phone: string): Promise<OrderLookupResult> {
  const params = new URLSearchParams({ orderNumber, phone });
  return request<OrderLookupResult>(`/orders/lookup?${params.toString()}`);
}

export interface InquiryInput {
  type: InquiryType;
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  quantity?: string;
  message?: string;
  website: string;
}

export function sendInquiry(input: InquiryInput): Promise<{ ok: true }> {
  return request<{ ok: true }>("/inquiries", { method: "POST", body: JSON.stringify(input) });
}

/** Gửi bình luận — luôn chờ admin duyệt mới hiện trên web. */
export function sendComment(postSlug: string, input: CreateCommentInput): Promise<{ ok: true }> {
  return request<{ ok: true }>(`/posts/${encodeURIComponent(postSlug)}/comments`, { method: "POST", body: JSON.stringify(input) });
}
