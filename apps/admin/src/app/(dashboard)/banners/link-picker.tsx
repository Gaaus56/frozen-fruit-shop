"use client";

import { useState } from "react";
import { inputClass } from "@/components/ui/form";
import type { LinkOptionGroup } from "./link-options";

const NONE = "";
const CUSTOM = "__custom__";

/** Chọn trang có sẵn hoặc nhập link tự do; giá trị cuối cùng gửi đi qua input ẩn `name` (mặc định `linkUrl`). */
export function LinkPicker({
  groups,
  defaultValue,
  name = "linkUrl",
  id = name,
}: {
  groups: LinkOptionGroup[];
  defaultValue: string;
  name?: string;
  id?: string;
}) {
  const known = new Set(groups.flatMap((g) => g.options.map((o) => o.value)));
  const [choice, setChoice] = useState(!defaultValue ? NONE : known.has(defaultValue) ? defaultValue : CUSTOM);
  const [custom, setCustom] = useState(known.has(defaultValue) ? "" : defaultValue);

  const value = choice === CUSTOM ? custom.trim() : choice;

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={value} />
      <select id={id} value={choice} onChange={(e) => setChoice(e.target.value)} className={inputClass}>
        <option value={NONE}>— Không có liên kết —</option>
        {groups.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </optgroup>
        ))}
        <option value={CUSTOM}>Link tự nhập…</option>
      </select>
      {choice === CUSTOM ? (
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          maxLength={500}
          placeholder="/products?category=xoai hoặc https://..."
          aria-label="Link tự nhập"
          className={inputClass}
        />
      ) : null}
    </div>
  );
}
