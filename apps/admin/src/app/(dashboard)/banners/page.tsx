import Link from "next/link";
import { BANNER_PLACEMENTS, BANNER_PLACEMENT_LABELS, type Banner, type BannerPlacement } from "@frozen-fruit-shop/types";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import { PageHeader } from "@/components/ui/page-header";
import { Table, Td, Th } from "@/components/ui/table";
import { api } from "@/lib/api";
import { deleteBannerAction } from "./actions";

export const metadata = { title: "Banner" };

export default async function BannersPage({ searchParams }: PageProps<"/banners">) {
  const params = await searchParams;
  const placement = BANNER_PLACEMENTS.find((value) => value === params.placement);
  const banners = await api<Banner[]>(placement ? `/admin/banners?placement=${placement}` : "/admin/banners");
  const tab = (value?: BannerPlacement) =>
    `border-b-2 px-3 py-2 text-sm font-bold ${
      placement === value ? "border-accent-600 text-accent-700" : "border-transparent text-foreground/60 hover:text-foreground"
    }`;

  return (
    <div>
      <PageHeader
        title="Banner"
        description="Trang chủ: ảnh trình chiếu, ẩn khi không có banner nào đang bật. Trang Sản phẩm / Tin tức: ảnh nền đầu trang, dùng banner đang bật có thứ tự nhỏ nhất."
        action={<LinkButton href={placement ? `/banners/new?placement=${placement}` : "/banners/new"}>+ Thêm banner</LinkButton>}
      />

      <nav className="mb-4 flex gap-1 border-b border-divider" aria-label="Lọc theo vị trí">
        <Link href="/banners" className={tab(undefined)}>Tất cả</Link>
        {BANNER_PLACEMENTS.map((value) => (
          <Link key={value} href={`/banners?placement=${value}`} className={tab(value)}>
            {BANNER_PLACEMENT_LABELS[value]}
          </Link>
        ))}
      </nav>
      <Table
        empty={banners.length === 0 && "Chưa có banner nào."}
        head={
          <>
            <Th>Banner</Th>
            <Th>Vị trí</Th>
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
            <Td>
              <Badge tone={banner.placement === "home" ? "neutral" : banner.placement === "products" ? "blue" : "green"}>{BANNER_PLACEMENT_LABELS[banner.placement]}</Badge>
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
