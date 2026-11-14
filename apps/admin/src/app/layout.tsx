import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Quản trị — Trái Cây Đông Lạnh Đà Nẵng 28",
    template: "%s | Quản trị Trái Cây Đông Lạnh 28",
  },
  description: "Trang quản trị nội bộ.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${archivo.variable} h-full antialiased`}>
      <body className="min-h-full bg-background font-sans text-foreground">{children}</body>
    </html>
  );
}
