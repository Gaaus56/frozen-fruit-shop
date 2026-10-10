import { PageHeader } from "@/components/ui/page-header";
import { getProductOptions } from "@/lib/product-options";
import { PostForm } from "../post-form";

export const metadata = { title: "Viết bài" };

export default async function NewPostPage({ searchParams }: PageProps<"/posts/new">) {
  const { type } = await searchParams;
  return (
    <div>
      <PageHeader back={{ href: "/posts", label: "Bài viết" }} title="Viết bài mới" />
      <PostForm defaultType={type === "recruitment" ? "recruitment" : "knowledge"} products={await getProductOptions()} />
    </div>
  );
}
