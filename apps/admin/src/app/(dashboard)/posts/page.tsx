import Link from "next/link";
import type { Post } from "@frozen-fruit-shop/types";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import { PageHeader } from "@/components/ui/page-header";
import { Table, Td, Th } from "@/components/ui/table";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { deletePostAction } from "./actions";

export const metadata = { title: "Bài viết" };

const isScheduled = (post: Post) => new Date(post.publishedAt).getTime() > Date.now();

export default async function PostsPage() {
  const posts = await api<Post[]>("/admin/posts");

  return (
    <div>
      <PageHeader
        title="Bài viết"
        description="Tin tức, công thức, mẹo bảo quản hiển thị ở mục Tin tức trên web."
        action={<LinkButton href="/posts/new">+ Viết bài</LinkButton>}
      />
      <Table
        empty={posts.length === 0 && "Chưa có bài viết nào."}
        head={
          <>
            <Th>Bài viết</Th>
            <Th>Chuyên mục</Th>
            <Th>Ngày đăng</Th>
            <Th>Trạng thái</Th>
            <Th />
          </>
        }
      >
        {posts.map((post) => (
          <tr key={post.id}>
            <Td>
              <div className="flex items-center gap-3">
                <span className="relative h-11 w-16 shrink-0 overflow-hidden bg-muted">
                  {post.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element -- ảnh nhỏ từ API
                    <img src={post.coverImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  ) : null}
                </span>
                <Link href={`/posts/${post.id}`} className="font-bold hover:text-accent-700">{post.title}</Link>
              </div>
            </Td>
            <Td className="text-foreground/70">{post.category || "—"}</Td>
            <Td className="whitespace-nowrap">{formatDateTime(post.publishedAt)}</Td>
            <Td>
              {!post.isPublished ? (
                <Badge>Bản nháp</Badge>
              ) : isScheduled(post) ? (
                <Badge tone="blue">Hẹn giờ đăng</Badge>
              ) : (
                <Badge tone="green">Đang hiển thị</Badge>
              )}
            </Td>
            <Td>
              <div className="flex justify-end gap-2">
                <LinkButton href={`/posts/${post.id}`} variant="secondary" size="sm">Sửa</LinkButton>
                <DeleteButton action={deletePostAction.bind(null, post.id)} itemLabel={post.title} />
              </div>
            </Td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
