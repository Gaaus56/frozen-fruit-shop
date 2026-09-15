export interface CartItem {
  productId: string;
  variantId: string;
  productName: string;
  productSlug: string;
  image: string;
  packageSize: string;
  unitPrice: number;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}
