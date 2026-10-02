import Image from "next/image";
import { LoginForm } from "./login-form";

export const metadata = { title: "Đăng nhập" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { expired } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <span className="relative block h-20 w-20 overflow-hidden rounded-full ring-4 ring-leaf-600">
            <Image src="/images/logo-28fruit.png" alt="" fill sizes="80px" className="object-cover" />
          </span>
          <h1 className="mt-4 text-xl uppercase text-accent-700">Trái Cây Đông Lạnh Đà Nẵng 28</h1>
          <p className="mt-1 text-sm text-foreground/60">Đăng nhập trang quản trị</p>
        </div>

        <div className="mt-6 border-t-4 border-accent-600 bg-surface p-7 shadow-sm">
          {expired ? (
            <p className="mb-4 border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Phiên đăng nhập đã hết hạn hoặc bị thu hồi. Vui lòng đăng nhập lại.
            </p>
          ) : null}
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
