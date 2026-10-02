import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import type { CacheTag } from "@/lib/api";

const ALLOWED_TAGS: CacheTag[] = ["catalog", "content", "settings"];

function isValidSecret(received: string | null): boolean {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected || !received) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** API gọi route này (kèm khoá bí mật) mỗi khi admin thay đổi dữ liệu, để xoá cache trang tương ứng. */
export async function POST(request: NextRequest) {
  if (!isValidSecret(request.headers.get("x-revalidate-secret"))) {
    return Response.json({ revalidated: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { tags?: unknown } | null;
  const tags = Array.isArray(body?.tags)
    ? body.tags.filter((tag): tag is CacheTag => ALLOWED_TAGS.includes(tag as CacheTag))
    : [];

  // expire: 0 — lần truy cập kế tiếp tải dữ liệu mới ngay, không hiển thị bản cũ nữa.
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return Response.json({ revalidated: tags.length > 0, tags });
}
