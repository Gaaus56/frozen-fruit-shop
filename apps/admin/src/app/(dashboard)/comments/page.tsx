import Link from "next/link";
import { COMMENT_STATUSES, COMMENT_STATUS_LABELS, type Comment, type CommentStatus, type Paginated } from "@frozen-fruit-shop/types";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/ui/delete-button";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { deleteCommentAction, setCommentStatusAction } from "./actions";
import { ReplyForm } from "./reply-form";

export const metadata = { title: "Bình luận" };

const STATUS_TONE = { pending: "red", approved: "green", hidden: "neutral" } as const;

/** Nút đổi trạng thái theo trạng thái hiện tại. */
const ACTIONS: Record<CommentStatus, { to: CommentStatus; label: string }[]> = {
  pending: [
    { to: "approved", label: "Duyệt" },
    { to: "hidden", label: "Ẩn (spam)" },
  ],
  approved: [{ to: "hidden", label: "Ẩn" }],
  hidden: [{ to: "approved", label: "Hiện lại" }],
};

export default async function CommentsPage({ searchParams }: PageProps<"/comments">) {
  const params = await searchParams;
  // Mặc định mở tab "Chờ duyệt" — việc cần làm ngay.
  const status = params.status === "all" ? undefined : (COMMENT_STATUSES.find((item) => item === params.status) ?? "pending");
  const page = Math.max(1, Number(params.page) || 1);

  const search = new URLSearchParams({ page: String(page), pageSize: "20" });
  if (status) search.set("status", status);
  const [data, pending] = await Promise.all([
    api<Paginated<Comment>>(`/admin/comments?${search.toString()}`),
    api<Paginated<Comment>>("/admin/comments?status=pending&pageSize=1"),
  ]);

  const tab = (active: boolean) =>
    `border-b-2 px-3 py-2 text-sm font-bold ${active ? "border-accent-600 text-accent-700" : "border-transparent text-foreground/60 hover:text-foreground"}`;

  return (
    <div>
      <PageHeader
        title="Bình luận"
        description="Bình luận của khách dưới bài viết. Bình luận mới chờ duyệt — chỉ hiện trên web sau khi bấm Duyệt (hoặc trả lời)."
      />

      <nav className="mb-4 flex flex-wrap gap-1 border-b border-divider" aria-label="Lọc theo trạng thái">
        {COMMENT_STATUSES.map((value) => (
          <Link key={value} href={`/comments?status=${value}`} className={tab(status === value)}>
            {COMMENT_STATUS_LABELS[value]}
            {value === "pending" && pending.total > 0 ? ` (${pending.total})` : ""}
          </Link>
        ))}
        <Link href="/comments?status=all" className={tab(!status)}>
          Tất cả
        </Link>
      </nav>

      {data.items.length === 0 ? (
        <p className="border border-divider bg-surface px-4 py-8 text-center text-sm text-foreground/60">
          {status === "pending" ? "Không có bình luận nào chờ duyệt." : "Chưa có bình luận nào."}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {data.items.map((comment) => (
            <li key={comment.id} className="border border-divider bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="font-bold">{comment.name}</span>
                    <a href={`mailto:${comment.email}`} className="text-sm text-accent-700 hover:underline">
                      {comment.email}
                    </a>
                    <Badge tone={STATUS_TONE[comment.status]}>{COMMENT_STATUS_LABELS[comment.status]}</Badge>
                  </p>
                  <p className="mt-0.5 text-xs text-foreground/55">
                    {formatDateTime(comment.createdAt)} · bài{" "}
                    <Link href={`/posts/${comment.post.id}`} className="font-semibold text-foreground/75 hover:text-accent-700">
                      {comment.post.title}
                    </Link>
                  </p>
                </div>
                <DeleteButton action={deleteCommentAction.bind(null, comment.id)} itemLabel={`bình luận của ${comment.name}`} />
              </div>

              <p className="mt-3 whitespace-pre-line break-words bg-muted/60 p-3 text-sm">{comment.content}</p>

              <div className="mt-3 flex flex-wrap items-start gap-2">
                {ACTIONS[comment.status].map((action) => (
                  <form key={action.to} action={setCommentStatusAction.bind(null, comment.id, action.to)}>
                    <button
                      type="submit"
                      className={`px-3 py-1.5 text-xs font-bold ${
                        action.to === "approved"
                          ? "bg-leaf-600 text-white hover:bg-leaf-700"
                          : "border border-divider hover:border-accent-600 hover:text-accent-700"
                      }`}
                    >
                      {action.label}
                    </button>
                  </form>
                ))}
                <ReplyForm id={comment.id} reply={comment.reply} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <Pagination page={data.page} pageSize={data.pageSize} total={data.total} basePath="/comments" params={{ status: status ?? "all" }} />
    </div>
  );
}
