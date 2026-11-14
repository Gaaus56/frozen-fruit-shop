export interface CartItem {
  productId: string;
  variantId: string;
  productName: string;
  productSlug: string;
  image: string | null;
  packageSize: string;
  unitPrice: number;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}
