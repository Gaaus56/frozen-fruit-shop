import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { PostCard } from "@/components/post/post-card";
import { getPosts } from "@/lib/api";

export const metadata: Metadata = {
  title: "Tin tức",
  description: "Mẹo bảo quản, công thức chế biến và kiến thức về trái cây đông lạnh.",
};

export default async function BlogListPage() {
  const posts = await getPosts();

  return (
    <Container className="py-12">
      <SectionHeading eyebrow="Tin tức" title="Kiến thức & công thức từ trái cây đông lạnh" />

      {posts.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-foreground/70">Chưa có bài viết nào. Vui lòng quay lại sau.</p>
      )}
    </Container>
  );
}
