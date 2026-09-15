export interface CustomerAddress {
  id: string;
  label: string;
  province: string;
  district: string;
  ward: string;
  addressLine: string;
  isDefault: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  savedAddresses: CustomerAddress[];
  wishlistProductIds: string[];
}
