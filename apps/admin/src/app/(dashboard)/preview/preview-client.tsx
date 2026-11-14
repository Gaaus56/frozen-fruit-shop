"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { editTargetPath, type PreviewMessage } from "@frozen-fruit-shop/types";
import { WEB_ORIGIN, WEB_URL, setPreviewReturn } from "@/lib/preview";
import { WithHelp } from "@/components/ui/help";

type Mode = "edit" | "browse";
type Device = "desktop" | "tablet" | "mobile";

/** Admin đang mở trên màn hình nhỏ (điện thoại / máy tính bảng dọc): chỉ xem được giao diện điện thoại của web. */
const SMALL_SCREEN = "(max-width: 1023px)";
const subscribeSmallScreen = (onChange: () => void) => {
  const query = window.matchMedia(SMALL_SCREEN);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const isSmallScreen = () => window.matchMedia(SMALL_SCREEN).matches;

const DEVICES: { key: Device; label: string; width: number | null }[] = [
  { key: "desktop", label: "Máy tính", width: null },
  { key: "tablet", label: "Máy tính bảng", width: 820 },
  { key: "mobile", label: "Điện thoại", width: 390 },
];

const QUICK_LINKS = [
  { label: "Trang chủ", path: "/" },
  { label: "Sản phẩm", path: "/products" },
  { label: "Tin tức", path: "/news" },
  { label: "Giới thiệu", path: "/about" },
  { label: "Liên hệ", path: "/contact" },
];

/** Chỉ nhận đường dẫn trong web ("/…"), không cho mở trang ngoài trong khung. */
function normalizePath(value: string) {
  const text = value.trim().replace(WEB_URL, "");
  return text.startsWith("/") ? text : `/${text}`;
}

/**
 * Xem trước & sửa: web khách hàng trong khung. Chế độ sửa → rê chuột thấy viền + nhãn, bấm đúp vào phần nào thì mở
 * trang sửa phần đó (web gửi postMessage "tc28:edit"). Chế độ duyệt → bấm như khách để đi tới trang cần sửa.
 */
export function PreviewClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPath = normalizePath(searchParams.get("path") ?? "/");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [src, setSrc] = useState(`${WEB_URL}${initialPath}`);
  const [path, setPath] = useState(initialPath);
  const [mode, setMode] = useState<Mode>("edit");
  const [chosenDevice, setDevice] = useState<Device>("desktop");
  const smallScreen = useSyncExternalStore(subscribeSmallScreen, isSmallScreen, () => false);
  // Màn hình admin hẹp không đủ chỗ cho bản máy tính / máy tính bảng → luôn xem bản điện thoại, khung rộng hết màn.
  const device: Device = smallScreen ? "mobile" : chosenDevice;
  const [loading, setLoading] = useState(true);
  /** Đổi số này để khung tải lại (kể cả khi mở lại đúng trang đang xem). */
  const [reloadKey, setReloadKey] = useState(0);

  const sendMode = (value: Mode) => iframeRef.current?.contentWindow?.postMessage({ type: "tc28:preview", mode: value } satisfies PreviewMessage, WEB_ORIGIN);

  // Đã quay lại trang xem trước → bỏ nút "Quay lại xem trước" ở các trang khác.
  useEffect(() => setPreviewReturn(null), []);

  useEffect(() => {
    const onMessage = (event: MessageEvent<PreviewMessage>) => {
      if (event.origin !== WEB_ORIGIN || event.source !== iframeRef.current?.contentWindow) return;
      const message = event.data;
      // Web vừa chạy xong code trong khung → gửi chế độ hiện tại (lệnh gửi lúc onLoad có thể đến quá sớm).
      if (message?.type === "tc28:ready") sendMode(mode);
      if (message?.type === "tc28:path") {
        setPath(message.path);
        // Giữ đường dẫn trên thanh địa chỉ admin: tải lại / quay lại vẫn đúng trang.
        window.history.replaceState(null, "", message.path === "/" ? "/preview" : `/preview?path=${encodeURIComponent(message.path)}`);
      }
      if (message?.type === "tc28:edit") {
        const target = editTargetPath(message.kind, message.id);
        if (!target) return;
        setPreviewReturn(message.path);
        router.push(target);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
     
  }, [router, mode]);

  function changeMode(value: Mode) {
    setMode(value);
    sendMode(value);
  }

  function open(target: string) {
    const next = normalizePath(target);
    setLoading(true);
    setSrc(`${WEB_URL}${next}`);
    setReloadKey((value) => value + 1);
  }

  function submitPath(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    open(String(new FormData(event.currentTarget).get("path") ?? "/"));
  }

  const width = smallScreen ? null : DEVICES.find((item) => item.key === device)?.width;

  return (
    <div className="flex flex-col gap-3 lg:h-[calc(100vh-4rem)]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <WithHelp
            head={<h1 className="text-2xl uppercase">Xem trước &amp; sửa</h1>}
            label="Xem trước & sửa"
            helpClassName="max-w-2xl text-sm"
            help={
              mode === "edit"
                ? "Rê chuột lên website, phần nào có viền đỏ là sửa được — bấm đúp vào để mở trang sửa phần đó."
                : "Đang ở chế độ duyệt: bấm như khách để đi tới trang cần sửa, rồi bật lại Chế độ sửa."
            }
          />
        </div>
        {/* Công tắc chế độ */}
        <div className="inline-flex rounded-full bg-muted p-1 text-sm font-bold" role="radiogroup" aria-label="Chế độ xem trước">
          {(
            [
              ["edit", "✎ Chế độ sửa"],
              ["browse", "↗ Chế độ duyệt"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={mode === value}
              onClick={() => changeMode(value)}
              className={`rounded-full px-4 py-1.5 transition-colors ${mode === value ? "bg-accent-600 text-white shadow" : "text-foreground/70 hover:text-foreground"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Thanh công cụ: trang nhanh, đường dẫn, thiết bị, tải lại */}
      <div className="flex flex-wrap items-center gap-2 border border-divider bg-surface p-2">
        <div className="flex flex-wrap gap-1">
          {QUICK_LINKS.map((link) => (
            <button
              key={link.path}
              type="button"
              onClick={() => open(link.path)}
              className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                path.split("?")[0] === link.path ? "bg-ink text-white" : "text-foreground/70 hover:bg-muted"
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
        <form key={path} onSubmit={submitPath} className="flex min-w-48 flex-1 items-center border border-divider bg-white">
          <span className="pl-2 text-xs text-foreground/45">{WEB_URL.replace(/^https?:\/\//, "")}</span>
          <input name="path" defaultValue={path} aria-label="Đường dẫn trang web" className="min-w-0 flex-1 px-1 py-1.5 text-xs outline-none" />
          <button type="submit" className="px-3 py-1.5 text-xs font-bold text-accent-700 hover:bg-muted">
            Mở
          </button>
        </form>
        {smallScreen ? (
          <span className="px-3 py-1.5 text-xs font-semibold text-foreground/60">Đang xem giao diện điện thoại</span>
        ) : (
          <div className="flex gap-1" role="radiogroup" aria-label="Kích thước màn hình">
            {DEVICES.map((item) => (
              <button
                key={item.key}
                type="button"
                role="radio"
                aria-checked={device === item.key}
                onClick={() => setDevice(item.key)}
                className={`px-3 py-1.5 text-xs font-bold transition-colors ${device === item.key ? "bg-ink text-white" : "text-foreground/70 hover:bg-muted"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
        <button type="button" onClick={() => open(path)} title="Tải lại trang đang xem" className="px-3 py-1.5 text-xs font-bold text-foreground/70 hover:bg-muted">
          ↻ Tải lại
        </button>
        <a
          href={`${WEB_URL}${path}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Mở trang này ở tab mới"
          className="px-3 py-1.5 text-xs font-bold text-foreground/70 hover:bg-muted"
        >
          ↗ Tab mới
        </a>
      </div>

      {/* Khung web */}
      {/* Màn hình nhỏ: khung cao gần bằng một màn hình điện thoại (cuộn trang admin để xem tiếp); máy tính: lấp phần còn lại. */}
      <div className="relative h-[85svh] min-h-[560px] overflow-auto border lg:h-auto lg:min-h-0 lg:flex-1 border-divider bg-[repeating-linear-gradient(45deg,#ecebea_0_10px,#f4f3f2_10px_20px)]">
        <div className="mx-auto h-full bg-white shadow-xl transition-[width] duration-300" style={{ width: width ? `${width}px` : "100%", maxWidth: "100%" }}>
          <iframe
            key={reloadKey}
            ref={iframeRef}
            src={src}
            title="Xem trước website"
            className="h-full w-full border-0"
            onLoad={() => {
              setLoading(false);
              sendMode(mode);
            }}
          />
        </div>
        {loading ? (
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 overflow-hidden bg-accent-100">
            <div className="h-full w-1/3 animate-pulse bg-accent-600" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
