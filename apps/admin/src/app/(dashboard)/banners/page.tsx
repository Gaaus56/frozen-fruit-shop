import Link from "next/link";
import type { Banner } from "@frozen-fruit-shop/types";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import { PageHeader } from "@/components/ui/page-header";
import { Table, Td, Th } from "@/components/ui/table";
import { api } from "@/lib/api";
import { deleteBannerAction } from "./actions";

export const metadata = { title: "Banner" };

export default async function BannersPage() {
  const banners = await api<Banner[]>("/admin/banners");

  return (
    <div>
      <PageHeader
        title="Banner trang chủ"
        description="Ảnh trình chiếu đầu trang chủ. Không có banner nào đang bật thì khu vực này được ẩn."
        action={<LinkButton href="/banners/new">+ Thêm banner</LinkButton>}
      />
      <Table
        empty={banners.length === 0 && "Chưa có banner nào."}
        head={
          <>
            <Th>Banner</Th>
            <Th>Liên kết</Th>
            <Th>Thứ tự</Th>
            <Th>Trạng thái</Th>
            <Th />
          </>
        }
      >
        {banners.map((banner) => (
          <tr key={banner.id}>
            <Td>
              <div className="flex items-center gap-3">
                <span className="relative h-12 w-32 shrink-0 overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element -- ảnh nhỏ từ API */}
                  <img src={banner.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                </span>
                <Link href={`/banners/${banner.id}`} className="font-bold hover:text-accent-700">
                  {banner.title || "(Không có tiêu đề)"}
                </Link>
              </div>
            </Td>
            <Td className="max-w-56 truncate text-foreground/70">{banner.linkUrl ?? "—"}</Td>
            <Td>{banner.sortOrder}</Td>
            <Td>{banner.isActive ? <Badge tone="green">Đang hiển thị</Badge> : <Badge>Đang ẩn</Badge>}</Td>
            <Td>
              <div className="flex justify-end gap-2">
                <LinkButton href={`/banners/${banner.id}`} variant="secondary" size="sm">Sửa</LinkButton>
                <DeleteButton action={deleteBannerAction.bind(null, banner.id)} itemLabel={banner.title || "banner này"} />
              </div>
            </Td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
