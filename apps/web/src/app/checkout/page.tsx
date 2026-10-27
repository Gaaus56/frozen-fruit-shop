import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getSettings } from "@/lib/api";

export const metadata: Metadata = {
  title: "Thanh toán",
  robots: { index: false },
};

export default async function CheckoutPage() {
  const settings = await getSettings();
  return (
    <CheckoutForm
      // In lên đầu bill.
      store={{ name: settings.storeName, phone: settings.phone, address: settings.address, taxCode: settings.taxCode }}
    />
  );
}
