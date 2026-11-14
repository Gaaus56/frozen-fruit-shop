"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { OrderQuote } from "@frozen-fruit-shop/types";
import type { CartItem } from "@/types";

const MAX_QUANTITY = 99;

// Đổi phiên bản key khi cấu trúc dữ liệu giỏ thay đổi, tránh đọc giỏ cũ không còn hợp lệ.
const STORAGE_KEY = "traicay28:cart:v2";

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  /** Cập nhật giá/tên theo báo giá mới nhất từ máy chủ; bỏ món không còn tồn tại trong hệ thống. */
  applyQuote: (quote: OrderQuote) => void;
  /** Đã đọc xong giỏ từ localStorage (trước đó giỏ luôn rỗng). */
  isHydrated: boolean;
  totalQuantity: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Đọc giỏ hàng đã lưu từ localStorage một lần duy nhất sau khi component mount ở client,
  // tránh lệch nội dung giữa server và client (hydration mismatch).
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- đọc localStorage một lần khi mount, không phải subscription
      if (stored) setItems(JSON.parse(stored) as CartItem[]);
    } catch {
      // localStorage không khả dụng (ví dụ private mode) — bỏ qua, giỏ hàng bắt đầu trống.
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Bỏ qua nếu không lưu được.
    }
  }, [items, isHydrated]);

  const addItem = (newItem: CartItem) => {
    setItems((current) => {
      const existing = current.find((item) => item.variantId === newItem.variantId);
      if (existing) {
        return current.map((item) =>
          item.variantId === newItem.variantId
            ? { ...item, quantity: Math.min(MAX_QUANTITY, item.quantity + newItem.quantity) }
            : item,
        );
      }
      return [...current, newItem];
    });
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    setItems((current) =>
      quantity <= 0
        ? current.filter((item) => item.variantId !== variantId)
        : current.map((item) =>
            item.variantId === variantId ? { ...item, quantity: Math.min(MAX_QUANTITY, quantity) } : item,
          ),
    );
  };

  const removeItem = (variantId: string) => {
    setItems((current) => current.filter((item) => item.variantId !== variantId));
  };

  const clearCart = () => setItems([]);

  const applyQuote = (quote: OrderQuote) => {
    const lines = new Map(quote.lines.map((line) => [line.variantId, line]));
    setItems((current) =>
      current.flatMap((item) => {
        const line = lines.get(item.variantId);
        if (!line) return [];
        return [
          {
            ...item,
            productName: line.productName,
            productSlug: line.productSlug,
            packageSize: line.packageSize,
            image: line.image,
            unitPrice: line.unitPrice,
          },
        ];
      }),
    );
  };

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items],
  );

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQuantity, removeItem, clearCart, applyQuote, isHydrated, totalQuantity, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart phải được dùng bên trong CartProvider");
  }
  return context;
}
