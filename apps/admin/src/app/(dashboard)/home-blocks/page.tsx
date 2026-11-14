import Link from "next/link";
import { HOME_BLOCK_POSITION_LABELS, type HomeBlock } from "@frozen-fruit-shop/types";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import { PageHeader } from "@/components/ui/page-header";
import { Table, Td, Th } from "@/components/ui/table";
import { api } from "@/lib/api";
import { deleteHomeBlockAction } from "./actions";

export const metadata = { title: "Khối trang chủ" };

/** Vài chữ đầu của nội dung để nhận ra khối không có tiêu đề. */
function preview(html: string) {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > 80 ? `${text.slice(0, 80)}…` : text;
}

export default async function HomeBlocksPage() {
  const blocks = await api<HomeBlock[]>("/admin/home-blocks");

  return (
    <div>
      <PageHeader
        title="Khối trang chủ"
        help="Nội dung tự soạn (giới thiệu, câu chuyện, khuyến mãi...) xen giữa các phần có sẵn của trang chủ. Có thể chia 2 cột ảnh / chữ, đặt trong khung hoặc không."
        action={<LinkButton href="/home-blocks/new">+ Thêm khối</LinkButton>}
      />

      <Table
        empty={blocks.length === 0 && "Chưa có khối nào. Bấm «+ Thêm khối» để soạn nội dung đầu tiên cho trang chủ."}
        head={
          <>
            <Th>Khối</Th>
            <Th>Vị trí</Th>
            <Th>Kiểu</Th>
            <Th>Thứ tự</Th>
            <Th>Trạng thái</Th>
            <Th />
          </>
        }
      >
        {blocks.map((block) => (
          <tr key={block.id}>
            <Td>
              <Link href={`/home-blocks/${block.id}`} className="font-bold hover:text-accent-700">
                {block.title || "(Không tiêu đề)"}
              </Link>
              <span className="block max-w-md truncate text-xs text-foreground/50">{preview(block.content) || "(Chưa có nội dung)"}</span>
            </Td>
            <Td className="whitespace-nowrap">{HOME_BLOCK_POSITION_LABELS[block.position]}</Td>
            <Td>{block.framed ? <Badge tone="blue">Trong khung</Badge> : <Badge>Không khung</Badge>}</Td>
            <Td>{block.sortOrder}</Td>
            <Td>{block.isActive ? <Badge tone="green">Đang hiển thị</Badge> : <Badge>Đang ẩn</Badge>}</Td>
            <Td>
              <div className="flex justify-end gap-2">
                <LinkButton href={`/home-blocks/${block.id}`} variant="secondary" size="sm">
                  Sửa
                </LinkButton>
                <DeleteButton action={deleteHomeBlockAction.bind(null, block.id)} itemLabel={block.title || "khối này"} />
              </div>
            </Td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
