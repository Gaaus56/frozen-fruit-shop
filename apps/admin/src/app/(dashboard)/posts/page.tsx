import Link from "next/link";
import { POST_TYPES, POST_TYPE_LABELS, type Post, type PostType } from "@frozen-fruit-shop/types";
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

export default async function PostsPage({ searchParams }: PageProps<"/posts">) {
  const params = await searchParams;
  const type = POST_TYPES.find((value) => value === params.type);
  const allPosts = await api<Post[]>("/admin/posts");
  const posts = type ? allPosts.filter((post) => post.type === type) : allPosts;
  const tab = (value?: PostType) =>
    `border-b-2 px-3 py-2 text-sm font-bold ${
      type === value ? "border-accent-600 text-accent-700" : "border-transparent text-foreground/60 hover:text-foreground"
    }`;

  return (
    <div>
      <PageHeader
        title="Bài viết"
        help="Hiển thị ở mục Tin tức trên web, chia 2 loại: Kiến thức và Tuyển dụng."
        action={<LinkButton href={type === "recruitment" ? "/posts/new?type=recruitment" : "/posts/new"}>+ Viết bài</LinkButton>}
      />

      <nav className="mb-4 flex gap-1 border-b border-divider" aria-label="Lọc theo loại">
        <Link href="/posts" className={tab(undefined)}>Tất cả ({allPosts.length})</Link>
        {POST_TYPES.map((value) => (
          <Link key={value} href={`/posts?type=${value}`} className={tab(value)}>
            {POST_TYPE_LABELS[value]} ({allPosts.filter((post) => post.type === value).length})
          </Link>
        ))}
      </nav>
      <Table
        empty={posts.length === 0 && "Chưa có bài viết nào."}
        head={
          <>
            <Th>Bài viết</Th>
            <Th>Loại</Th>
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
            <Td>
              <Badge tone={post.type === "recruitment" ? "green" : "neutral"}>{POST_TYPE_LABELS[post.type]}</Badge>
            </Td>
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
