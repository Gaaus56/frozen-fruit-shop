import type { PublicComment } from "@frozen-fruit-shop/types";
import { formatDate } from "@/lib/format";

/** Bình luận đã duyệt, cũ trước mới sau; câu trả lời của cửa hàng hiện ngay dưới bình luận. */
export function CommentList({ comments, storeName }: { comments: PublicComment[]; storeName: string }) {
  return (
    <section className="mt-12 border-t border-divider pt-8" aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="text-xl font-extrabold text-foreground">
        {comments.length > 0 ? `${comments.length} bình luận` : "Bình luận"}
      </h2>
      {comments.length === 0 ? (
        <p className="mt-2 text-sm text-foreground/65">Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nhận!</p>
      ) : (
        <ul className="mt-5 space-y-5">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3">
              <span
                aria-hidden
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-leaf/10 text-sm font-extrabold uppercase text-leaf"
              >
                {comment.name.trim().charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-bold text-foreground">{comment.name}</span>
                  <span className="text-foreground/65"> · {formatDate(comment.createdAt)}</span>
                </p>
                <p className="mt-1 whitespace-pre-line break-words text-foreground/80">{comment.content}</p>
                {comment.reply ? (
                  <div className="mt-3 rounded-xl border-l-4 border-leaf bg-leaf/[0.07] px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-leaf">
                      {storeName} trả lời{comment.repliedAt ? ` · ${formatDate(comment.repliedAt)}` : ""}
                    </p>
                    <p className="mt-1 whitespace-pre-line break-words text-sm text-foreground/80">{comment.reply}</p>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
