import { LogoBadge } from "@/components/layout/logo-badge";
import { LinkButton } from "@/components/ui/button";
import { StatusPage } from "@/components/ui/status-page";

/** Đường dẫn không tồn tại trong trang quản trị (gõ sai địa chỉ, link cũ). */
export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background">
      <LogoBadge className="h-32 w-32 sm:h-36 sm:w-36" />
      <StatusPage
        code="404"
        title="Không tìm thấy trang"
        actions={
          <>
            <LinkButton href="/">Về trang quản trị</LinkButton>
            <LinkButton href="/account" variant="secondary">
              Tài khoản của tôi
            </LinkButton>
          </>
        }
        className="py-8"
      >
        Địa chỉ này không có trong trang quản trị. Có thể bạn gõ nhầm, hoặc link đã cũ.
      </StatusPage>
    </main>
  );
}
