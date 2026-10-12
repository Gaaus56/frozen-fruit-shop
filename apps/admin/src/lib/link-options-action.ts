"use server";

import { getLinkOptionGroups, type LinkOptionGroup } from "@/app/(dashboard)/banners/link-options";

/** Danh sách trang có sẵn trên web (trang chính, danh mục, chính sách, bài viết) cho ô chọn liên kết trong trình soạn thảo. */
export async function getLinkOptionGroupsAction(): Promise<LinkOptionGroup[]> {
  return getLinkOptionGroups();
}
