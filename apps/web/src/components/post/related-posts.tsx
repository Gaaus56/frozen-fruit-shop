import Link from "next/link";
import type { Post } from "@frozen-fruit-shop/types";
import { getPosts } from "@/lib/api";

const LIMIT = 5;

/** "Xem thêm": bài mới nhất cùng loại (Kiến thức / Tuyển dụng); thiếu thì lấy thêm bài loại khác. */
export async function RelatedPosts({ post }: { post: Post }) {
  const all = (await getPosts()).filter((item) => item.id !== post.id);
  const related = [...all.filter((item) => item.type === post.type), ...all.filter((item) => item.type !== post.type)].slice(0, LIMIT);
  if (related.length === 0) return null;

  return (
    <section className="mt-12 border-t border-divider pt-8" aria-labelledby="related-heading">
      <h2 id="related-heading" className="text-xl font-extrabold text-foreground">
        Xem thêm:
      </h2>
      <ul className="mt-3 list-disc space-y-2 pl-6 marker:text-accent-600">
        {related.map((item) => (
          <li key={item.id}>
            <Link href={`/news/${item.slug}`} className="font-medium text-accent-700 hover:text-accent-600 hover:underline">
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
