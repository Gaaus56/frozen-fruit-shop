import type { BlogPost } from '@frozen-fruit-shop/types';
import { apiGet } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { LinkButton } from '@/components/ui/button';
import { DeleteButton } from '@/components/ui/delete-button';
import { deleteBlogPostAction } from './actions';

export default async function BlogPostsPage() {
  const posts = await apiGet<BlogPost[]>('/blog-posts');

  return (
    <div>
      <PageHeader
        title="Bài viết"
        description="Nội dung hiển thị ở mục Tin tức trên website."
        action={<LinkButton href="/posts/new">+ Thêm bài viết</LinkButton>}
      />

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Tiêu đề</th>
              <th className="px-4 py-3 font-medium">Danh mục</th>
              <th className="px-4 py-3 font-medium">Ngày đăng</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {posts.map((post) => (
              <tr key={post.id}>
                <td className="max-w-sm truncate px-4 py-3 font-medium text-slate-900">{post.title}</td>
                <td className="px-4 py-3 text-slate-500">{post.category}</td>
                <td className="px-4 py-3 text-slate-500">
                  {new Intl.DateTimeFormat('vi-VN').format(new Date(post.publishedAt))}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <LinkButton href={`/posts/${post.slug}`} variant="secondary">
                      Sửa
                    </LinkButton>
                    <DeleteButton action={deleteBlogPostAction.bind(null, post.slug)} itemLabel={post.title} />
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  Chưa có bài viết nào.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
