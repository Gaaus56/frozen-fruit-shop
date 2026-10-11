import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FloatingContact } from "@/components/layout/floating-contact";
import { LiveUpdates } from "@/components/layout/live-updates";
import { NavigationTracker } from "@/components/ui/back-button";
import { CartProvider } from "@/lib/cart-context";
import { getCategories, getPolicies, getSettings } from "@/lib/api";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "800"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: {
      default: `${settings.storeName} — Trái cây đông lạnh chất lượng`,
      template: `%s | ${settings.storeName}`,
    },
    description:
      "Trái cây đông lạnh cấp đông nhanh sau thu hoạch, đóng gói hút chân không, giao hàng lạnh tận nơi.",
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [settings, categories, policies] = await Promise.all([getSettings(), getCategories(), getPolicies()]);

  return (
    <html lang="vi" className={`${archivo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <CartProvider>
          <Header settings={settings} categories={categories} />
          <main className="flex-1">{children}</main>
          <Footer settings={settings} policies={policies} />
          <FloatingContact settings={settings} />
          <NavigationTracker />
          <LiveUpdates />
        </CartProvider>
      </body>
    </html>
  );
}
