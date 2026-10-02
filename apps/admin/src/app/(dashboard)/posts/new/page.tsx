import type { Post } from "@frozen-fruit-shop/types";
import { PageHeader } from "@/components/ui/page-header";
import { api } from "@/lib/api";
import { PostForm } from "../post-form";

export const metadata = { title: "Viết bài" };

export default async function NewPostPage() {
  const posts = await api<Post[]>("/admin/posts");
  const categories = [...new Set(posts.map((post) => post.category).filter(Boolean))];
  return (
    <div>
      <PageHeader back={{ href: "/posts", label: "Bài viết" }} title="Viết bài mới" />
      <PostForm categories={categories} />
    </div>
  );
}
