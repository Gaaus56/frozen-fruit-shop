import { notFound } from "next/navigation";
import type { Post } from "@frozen-fruit-shop/types";
import { PageHeader } from "@/components/ui/page-header";
import { ApiError, api } from "@/lib/api";
import { PostForm } from "../post-form";

export const metadata = { title: "Sửa bài viết" };

export default async function EditPostPage({ params }: PageProps<"/posts/[id]">) {
  const { id } = await params;
  const [post, posts] = await Promise.all([
    api<Post>(`/admin/posts/${id}`).catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 404) notFound();
      throw error;
    }),
    api<Post[]>("/admin/posts"),
  ]);
  const categories = [...new Set(posts.map((item) => item.category).filter(Boolean))];

  return (
    <div>
      <PageHeader back={{ href: "/posts", label: "Bài viết" }} title={`Sửa: ${post.title}`} />
      <PostForm post={post} categories={categories} />
    </div>
  );
}
