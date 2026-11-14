"use client";

import { useState, useSyncExternalStore, type KeyboardEvent } from "react";
import type { LinkOptionGroup } from "@/app/(dashboard)/banners/link-options";
import { getLinkOptionGroupsAction } from "@/lib/link-options-action";

// ───────────── Danh sách trang dùng chung cho mọi ô chọn liên kết trong trình soạn thảo ─────────────
// Tải một lần mỗi lần mở trang (nút "Liên kết" và từng nút trong hàng nút cùng dùng), không phải truyền qua từng form.

let groups: LinkOptionGroup[] | null = null;
let loading = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!groups && !loading) {
    loading = true;
    getLinkOptionGroupsAction()
      .catch(() => [] as LinkOptionGroup[])
      .then((result) => {
        groups = result;
        loading = false;
        listeners.forEach((notify) => notify());
      });
  }
  return () => listeners.delete(listener);
}

/** `null` khi đang tải. */
export function useLinkOptionGroups(): LinkOptionGroup[] | null {
  return useSyncExternalStore(
    subscribe,
    () => groups,
    () => null,
  );
}

const NONE = "";
const CUSTOM = "__custom__";

/**
 * Chọn trang có sẵn (giống ô liên kết của banner) hoặc "Link tự nhập…" để gõ link tự do.
 * Có kiểm soát (`value` / `onChange`) để dùng được trong trình soạn thảo.
 */
export function LinkSelect({
  value,
  onChange,
  onCommit,
  onEnter,
  onEscape,
  allowNone = true,
  autoFocus,
  className = "",
  inputClassName = "",
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  /** Gọi khi khách chọn xong một trang có sẵn / rời ô tự nhập (để chuẩn hoá link). */
  onCommit?: (value: string) => void;
  /** Enter trong ô tự nhập (thanh "Liên kết": áp dụng luôn). */
  onEnter?: () => void;
  /** Esc trong ô (thanh "Liên kết": đóng). */
  onEscape?: () => void;
  allowNone?: boolean;
  autoFocus?: boolean;
  className?: string;
  inputClassName?: string;
  label: string;
}) {
  const loaded = useLinkOptionGroups();
  // null = tự suy ra từ `value`; true / false = khách vừa chọn "Link tự nhập…" / một trang có sẵn.
  const [customMode, setCustomMode] = useState<boolean | null>(null);
  const known = new Set((loaded ?? []).flatMap((group) => group.options.map((option) => option.value)));
  const isCustom = customMode ?? (value !== "" && !known.has(value));
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" && onEnter) {
      event.preventDefault();
      onEnter();
    }
    if (event.key === "Escape") onEscape?.();
  };

  if (!loaded) {
    return (
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={(event) => onCommit?.(event.target.value)}
        onKeyDown={onKeyDown}
        autoFocus={autoFocus}
        placeholder="Đang tải danh sách trang…"
        aria-label={label}
        className={inputClassName}
      />
    );
  }

  return (
    <span className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <select
        autoFocus={autoFocus}
        value={isCustom ? CUSTOM : value}
        aria-label={label}
        className={inputClassName}
        onKeyDown={(event) => {
          if (event.key === "Escape") onEscape?.();
        }}
        onChange={(event) => {
          const next = event.target.value;
          if (next === CUSTOM) {
            setCustomMode(true);
            return;
          }
          setCustomMode(false);
          onChange(next);
          onCommit?.(next);
        }}
      >
        {allowNone || value === "" ? <option value={NONE}>— Chọn trang —</option> : null}
        {loaded.map((group) => (
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
      {isCustom ? (
        <input
          autoFocus={customMode === true}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={(event) => onCommit?.(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="/products?category=xoai hoặc https://zalo.me/…"
          aria-label={`${label} (tự nhập)`}
          className={inputClassName}
        />
      ) : null}
    </span>
  );
}
