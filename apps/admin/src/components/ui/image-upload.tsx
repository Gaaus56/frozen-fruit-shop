"use client";

import { useId, useRef, useState, type ChangeEvent } from "react";
import { uploadImageAction } from "@/lib/upload-action";
import { buttonClass } from "./button";
import { HelpButton, HelpPanel } from "./help";

export const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

/** Tải một file ảnh lên API (qua Server Action), trả URL. Dùng chung cho ô ảnh và trình soạn thảo. */
export async function uploadFile(file: File): Promise<string> {
  const data = new FormData();
  data.append("file", file);
  const result = await uploadImageAction(data);
  if ("error" in result) throw new Error(result.error);
  return result.url;
}

/** Một ảnh (ảnh danh mục, ảnh bìa bài viết, banner). Giá trị gửi kèm form qua input ẩn `name`. */
export function ImageUpload({ name, defaultValue, label = "Chọn ảnh", frame = "w-40 aspect-square" }: {
  name: string;
  defaultValue?: string | null;
  label?: string;
  /** Kích thước + tỉ lệ khung xem trước. */
  frame?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const helpId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError(null);
    setIsUploading(true);
    try {
      setUrl(await uploadFile(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tải ảnh thất bại.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="mt-1">
      <input type="hidden" name={name} value={url} />
      <div className="flex flex-wrap items-start gap-4">
        <div className={`relative overflow-hidden border border-divider bg-muted ${frame}`}>
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element -- ảnh xem trước từ API, không cần tối ưu
            <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-xs text-foreground/45">Chưa có ảnh</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input ref={inputRef} type="file" accept={ACCEPT} onChange={handleChange} className="hidden" />
          <button type="button" onClick={() => inputRef.current?.click()} disabled={isUploading} className={buttonClass("secondary", "sm")}>
            {isUploading ? "Đang tải lên..." : url ? "Đổi ảnh" : label}
          </button>
          {url ? (
            <button type="button" onClick={() => setUrl("")} className={buttonClass("ghost", "sm")}>
              Bỏ ảnh
            </button>
          ) : null}
          <div className="flex items-start gap-1.5">
            <HelpButton open={helpOpen} onToggle={() => setHelpOpen((value) => !value)} controls={helpId} label="định dạng ảnh" />
            <HelpPanel id={helpId} open={helpOpen}>
              <p className="text-xs text-foreground/60">JPG, PNG, WEBP · tối đa 5MB</p>
            </HelpPanel>
          </div>
        </div>
      </div>
      {error ? <p className="mt-2 text-xs font-semibold text-accent-700">{error}</p> : null}
    </div>
  );
}

/** Nhiều ảnh cho sản phẩm: tải lên nhiều file cùng lúc, sắp xếp (ảnh đầu là ảnh đại diện), xoá từng ảnh. */
export function ImageListUpload({ name, defaultValue, max = 12 }: { name: string; defaultValue: string[]; max?: number }) {
  const [urls, setUrls] = useState<string[]>(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, Math.max(0, max - urls.length));
    event.target.value = "";
    if (files.length === 0) return;
    setError(null);
    setUploading(files.length);
    const failures: string[] = [];
    for (const file of files) {
      try {
        const url = await uploadFile(file);
        setUrls((current) => [...current, url]);
      } catch (err) {
        failures.push(`${file.name}: ${err instanceof Error ? err.message : "lỗi"}`);
      } finally {
        setUploading((count) => count - 1);
      }
    }
    if (failures.length > 0) setError(failures.join(" · "));
  }

  function move(index: number, delta: number) {
    setUrls((current) => {
      const next = [...current];
      const target = index + delta;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div className="mt-1">
      <input type="hidden" name={name} value={JSON.stringify(urls)} />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {urls.map((url, index) => (
          <div key={url} className="group relative aspect-square overflow-hidden border border-divider bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element -- ảnh xem trước từ API */}
            <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" />
            {index === 0 ? (
              <span className="absolute left-1 top-1 bg-accent-600 px-1.5 py-0.5 text-[10px] font-bold text-white">Ảnh chính</span>
            ) : null}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-ink/75 text-white">
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="px-2 py-1 text-xs disabled:opacity-30" aria-label="Chuyển lên trước">←</button>
              <button type="button" onClick={() => setUrls((current) => current.filter((_, i) => i !== index))} className="px-2 py-1 text-xs hover:text-accent-300" aria-label="Xoá ảnh">Xoá</button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === urls.length - 1} className="px-2 py-1 text-xs disabled:opacity-30" aria-label="Chuyển ra sau">→</button>
            </div>
          </div>
        ))}
        {urls.length < max ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading > 0}
            className="flex aspect-square flex-col items-center justify-center gap-1 border-2 border-dashed border-divider text-sm font-semibold text-foreground/55 hover:border-accent-600 hover:text-accent-700"
          >
            <span className="text-2xl leading-none">+</span>
            {uploading > 0 ? `Đang tải ${uploading} ảnh...` : "Thêm ảnh"}
          </button>
        ) : null}
      </div>
      <input ref={inputRef} type="file" accept={ACCEPT} multiple onChange={handleChange} className="hidden" />
      {error ? <p className="mt-1 text-xs font-semibold text-accent-700">{error}</p> : null}
    </div>
  );
}
