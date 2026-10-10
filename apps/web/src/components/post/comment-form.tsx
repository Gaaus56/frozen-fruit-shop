"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, HoneypotField, inputClass } from "@/components/ui/form";
import { sendComment } from "@/lib/api-client";

/** Khách chọn "Lưu tên, email…" → điền sẵn cho lần bình luận sau (chỉ lưu trên trình duyệt này). */
const AUTHOR_KEY = "traicay28:comment-author";

export function CommentForm({ postSlug }: { postSlug: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [remember, setRemember] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(AUTHOR_KEY) ?? "null") as { name?: string; email?: string } | null;
      if (!saved) return;
      if (nameRef.current) nameRef.current.value = saved.name ?? "";
      if (emailRef.current) emailRef.current.value = saved.email ?? "";
      // eslint-disable-next-line react-hooks/set-state-in-effect -- đọc localStorage một lần khi mount
      setRemember(true);
    } catch {
      // localStorage không dùng được (chế độ riêng tư) — bỏ qua.
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    setStatus("sending");
    setError(null);
    try {
      await sendComment(postSlug, { name, email, content: String(data.get("content") ?? ""), website: String(data.get("website") ?? "") });
      try {
        if (remember) window.localStorage.setItem(AUTHOR_KEY, JSON.stringify({ name, email }));
        else window.localStorage.removeItem(AUTHOR_KEY);
      } catch {
        // Bỏ qua nếu không lưu được.
      }
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gửi bình luận không thành công, vui lòng thử lại.");
      setStatus("idle");
    }
  }

  return (
    <section className="mt-10 rounded-xl bg-background p-5 ring-1 ring-divider/70 sm:p-7" aria-labelledby="comment-form-heading">
      <h2 id="comment-form-heading" className="text-lg font-extrabold uppercase tracking-wide text-leaf">
        Để lại một bình luận
      </h2>

      {status === "done" ? (
        <div className="mt-4">
          <FormMessage tone="success">
            Cảm ơn bạn! Bình luận đang chờ cửa hàng duyệt và sẽ hiện ở đây sau khi được duyệt.{" "}
            <button type="button" onClick={() => setStatus("idle")} className="font-bold underline">
              Viết bình luận khác
            </button>
          </FormMessage>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="relative mt-2 flex flex-col gap-4">
          <HoneypotField />
          <p className="text-sm text-foreground/60">
            Email của bạn sẽ không được hiển thị công khai. Các trường bắt buộc được đánh dấu <span className="text-accent-600">*</span>
          </p>
          <Field label="Bình luận" htmlFor="content" required>
            <textarea id="content" name="content" rows={5} required minLength={2} maxLength={2000} className={`${inputClass} !bg-card`} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Tên" htmlFor="comment-name" required>
              <input ref={nameRef} id="comment-name" name="name" required minLength={2} maxLength={80} autoComplete="name" className={`${inputClass} !bg-card`} />
            </Field>
            <Field label="Email" htmlFor="comment-email" required>
              <input ref={emailRef} id="comment-email" name="email" type="email" required maxLength={120} autoComplete="email" className={`${inputClass} !bg-card`} />
            </Field>
          </div>
          <label className="flex items-start gap-2.5 text-sm text-foreground/75">
            <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="mt-0.5 accent-[#1f6b3f]" />
            Lưu tên và email của tôi trên trình duyệt này cho lần bình luận kế tiếp.
          </label>

          {error ? <FormMessage tone="error">{error}</FormMessage> : null}

          <Button type="submit" className="w-fit rounded-lg !bg-leaf hover:!bg-leaf/90" disabled={status === "sending"}>
            {status === "sending" ? "Đang gửi..." : "Gửi bình luận"}
          </Button>
        </form>
      )}
    </section>
  );
}
