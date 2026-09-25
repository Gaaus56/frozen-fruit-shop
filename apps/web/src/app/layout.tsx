import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FloatingContact } from "@/components/layout/floating-contact";
import { CartProvider } from "@/lib/cart-context";
import { ThemeProvider } from "@/lib/theme-context";
import { business } from "@/data/business";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "800"],
});

export const metadata: Metadata = {
  title: {
    default: `${business.name} — Trái cây đông lạnh chất lượng`,
    template: `%s | ${business.name}`,
  },
  description:
    "Trái cây đông lạnh cấp đông nhanh sau thu hoạch, không chất bảo quản, đóng gói hút chân không, giao hàng lạnh toàn quốc.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${archivo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background pb-24 font-sans text-foreground lg:pb-0">
        <ThemeProvider>
          <CartProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <FloatingContact />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
