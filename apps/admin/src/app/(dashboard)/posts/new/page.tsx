import { PageHeader } from '@/components/ui/page-header';
import { BlogPostForm } from '@/components/blog-post/blog-post-form';
import { createBlogPostAction } from '../actions';

export default function NewBlogPostPage() {
  return (
    <div>
      <PageHeader title="Thêm bài viết" />
      <BlogPostForm action={createBlogPostAction} />
    </div>
  );
}
