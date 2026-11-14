import type { Metadata } from "next";
import { OrderLookup } from "@/components/order/order-lookup";
import { getSettings } from "@/lib/api";

export const metadata: Metadata = {
  title: "Tra cứu đơn hàng",
  description: "Tra cứu tình trạng đơn hàng và xem lại bill đã lưu trên máy.",
  robots: { index: false },
};

export default async function OrderLookupPage() {
  const settings = await getSettings();
  return (
    <OrderLookup
      // In lên đầu bill khi khách bấm «Xuất bill».
      store={{ name: settings.storeName, phone: settings.phone, address: settings.address, taxCode: settings.taxCode }}
    />
  );
}
