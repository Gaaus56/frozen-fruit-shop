export type PaymentMethod = "cod" | "bank_transfer" | "online_payment";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packing"
  | "shipping"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  productId: string;
  variantId: string;
  productName: string;
  packageSize: string;
  unitPrice: number;
  quantity: number;
}

export interface ShippingAddress {
  province: string;
  district: string;
  ward: string;
  addressLine: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  shippingMethod: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  createdAt: string;
}
