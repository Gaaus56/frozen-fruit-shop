import { LinkButton } from "@/components/ui/button";
import { StatusPage } from "@/components/ui/status-page";

/** Bản ghi không còn (đã bị xoá, link cũ trong Lịch sử chỉnh sửa…) — hiện trong khung có menu bên trái. */
export default function DashboardNotFound() {
  return (
    <StatusPage
      code="404"
      title="Không tìm thấy nội dung"
      actions={<LinkButton href="/">Về trang quản trị</LinkButton>}
    >
      Mục bạn mở không còn tồn tại — có thể đã bị xoá. Chọn mục khác ở menu bên trái.
    </StatusPage>
  );
}
