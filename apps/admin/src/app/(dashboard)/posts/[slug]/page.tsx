import type { BlogPost } from '@frozen-fruit-shop/types';
import { apiGet } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { BlogPostForm } from '@/components/blog-post/blog-post-form';
import { updateBlogPostAction } from '../actions';

export default async function EditBlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await apiGet<BlogPost>(`/blog-posts/${slug}`);
  const boundAction = updateBlogPostAction.bind(null, slug);

  return (
    <div>
      <PageHeader title={`Sửa bài viết: ${post.title}`} />
      <BlogPostForm action={boundAction} initial={post} />
    </div>
  );
}
