import Image from "next/image";
import { LogoBadge } from "@/components/layout/logo-badge";
import { LoginForm } from "./login-form";

export const metadata = { title: "Đăng nhập" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { expired, bye } = await searchParams;

  return (
    <div data-login-root data-returning={bye ? "" : undefined} className="login-root grid min-h-screen grid-cols-1 overflow-hidden lg:grid-cols-2">
      {/* Nửa trái: banner thương hiệu (điện thoại: thu thành dải ảnh trên cùng). */}
      <section className="login-banner relative h-56 overflow-hidden bg-ink sm:h-64 lg:h-auto" aria-label="Trái Cây Đông Lạnh Đà Nẵng 28">
        <Image src="/images/login-banner.jpg" alt="" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        <div className="absolute inset-0 bg-black/45" aria-hidden />
        {/* Logo + tên căn giữa banner. */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-white sm:gap-5 sm:p-10">
          <LogoBadge className="h-20 w-20 shrink-0 drop-shadow-xl sm:h-32 sm:w-32 lg:h-40 lg:w-40" label="Logo Trái Cây Đông Lạnh Đà Nẵng 28" />
          <div>
            <p className="text-xl font-extrabold uppercase leading-tight drop-shadow sm:text-3xl">Trái Cây Đông Lạnh Đà Nẵng 28</p>
            <p className="mx-auto mt-2 hidden max-w-md text-sm text-white/85 sm:block">
              Trang quản trị: đơn hàng, sản phẩm, nội dung website và thông tin cửa hàng.
            </p>
          </div>
        </div>
      </section>

      {/* Nửa phải: form đăng nhập */}
      <section className="login-panel flex items-center justify-center bg-background px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-accent-700">Trang quản trị</p>
          <h1 className="mt-2 text-2xl uppercase">Đăng nhập</h1>
          <p className="mt-1 text-sm text-foreground/60">Dùng email và mật khẩu chủ cửa hàng đã cấp cho bạn.</p>

          <div className="mt-6 border-t-4 border-accent-600 bg-surface p-7 shadow-sm">
            {bye ? (
              <p className="mb-4 border border-leaf-100 bg-leaf-50 px-3 py-2 text-sm text-leaf-700">Bạn đã đăng xuất.</p>
            ) : null}
            {expired ? (
              <p className="mb-4 border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Phiên đăng nhập đã hết hạn hoặc bị thu hồi. Vui lòng đăng nhập lại.
              </p>
            ) : null}
            <LoginForm />
          </div>
          <p className="mt-4 text-center text-xs text-foreground/50">Quên mật khẩu? Liên hệ chủ cửa hàng để đặt lại.</p>
        </div>
      </section>
    </div>
  );
}
