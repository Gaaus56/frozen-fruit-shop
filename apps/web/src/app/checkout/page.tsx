import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getSettings } from "@/lib/api";

export const metadata: Metadata = {
  title: "Thanh toán",
  robots: { index: false },
};

export default async function CheckoutPage() {
  const settings = await getSettings();
  return <CheckoutForm bankTransferInfo={settings.bankTransferInfo} hotline={settings.phone} />;
}
