"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import { TEXT_COLORS, TEXT_COLOR_LABELS, plainTextToHtml } from "@frozen-fruit-shop/types";
import { ACCEPT, uploadFile } from "@/components/ui/image-upload";
import { HelpButton, HelpPanel } from "@/components/ui/help";
import { LinkSelect, useLinkOptionGroups } from "./link-select";
import { formatCurrency } from "@/lib/format";
import { BlockStyle, ButtonRow, Callout, Column, Columns, Figure, ProductEmbed, TextAlign, TextColor, type ProductOption } from "./extensions";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** "…/products/xoai-cat" (link đầy đủ, "/products/…" hay "products/…") → "xoai-cat". */
function productSlugFromUrl(text: string): string | null {
  const match = text.trim().match(/^(?:https?:\/\/[^/\s]+)?\/?products\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?(?:[?#]\S*)?$/i);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Chuẩn hoá link admin gõ: giữ nguyên http(s) / mailto / tel / "/…";
 * "zalo.me/…" (có tên miền) → https://…; "products/…" (đường dẫn trong web) → "/products/…".
 */
function normalizeHref(value: string): string {
  if (/^(https?:|mailto:|tel:|\/)/i.test(value)) return value;
  const firstSegment = value.split(/[/?#]/)[0];
  return firstSegment.includes(".") ? `https://${value}` : `/${value}`;
}

/**
 * Trình soạn thảo có định dạng dùng chung cho bài viết, chính sách, mô tả sản phẩm, trang Giới thiệu, khối trang chủ.
 * Giá trị gửi lên server qua input ẩn `name` (HTML); API lọc lại trước khi lưu.
 * Màu chữ chỉ chọn trong vài màu của chủ đề web; cố ý KHÔNG có cỡ chữ / font để mọi bài đồng nhất.
 */
export function RichTextEditor({
  name,
  defaultValue,
  products,
  placeholder = "Bắt đầu viết… (dán hoặc kéo ảnh vào đây để chèn ảnh)",
}: {
  name: string;
  defaultValue?: string;
  /** Truyền danh sách sản phẩm để bật nút "Sản phẩm"; bỏ trống thì ẩn nút. */
  products?: ProductOption[];
  placeholder?: string;
}) {
  const initial = useMemo(() => plainTextToHtml(defaultValue ?? ""), [defaultValue]);
  const [html, setHtml] = useState(initial);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [panel, setPanel] = useState<"link" | "product" | null>(null);
  const dirty = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<Editor | null>(null);

  async function insertImages(files: File[], at?: number) {
    const images = files.filter((file) => ACCEPT.split(",").includes(file.type));
    if (images.length === 0) return;
    setError(null);
    for (const file of images) {
      if (file.size > MAX_IMAGE_BYTES) {
        setError(`${file.name}: ảnh vượt quá 5MB.`);
        continue;
      }
      setUploading((count) => count + 1);
      try {
        const src = await uploadFile(file);
        const editor = editorRef.current;
        if (!editor) continue;
        const chain = editor.chain().focus();
        (at !== undefined ? chain.setTextSelection(at) : chain).insertFigure({ src, alt: "" }).run();
        at = undefined;
      } catch (err) {
        setError(`${file.name}: ${err instanceof Error ? err.message : "tải ảnh thất bại."}`);
      } finally {
        setUploading((count) => count - 1);
      }
    }
  }

  const editor = useEditor({
    immediatelyRender: false,
    content: initial,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Placeholder.configure({
        showOnlyCurrent: false,
        // Gắn class "is-empty" cả cho đoạn trống bên trong cột (CSS hiện chữ gợi ý cho từng cột).
        includeChildren: true,
        placeholder: ({ editor: current, node }) => {
          if (node.type.name === "figure") return "Nhập chú thích ảnh (không bắt buộc)…";
          if (node.type.name === "heading") return "Tiêu đề…";
          return current.isEmpty ? placeholder : "";
        },
      }),
      CharacterCount,
      Figure,
      Callout,
      ProductEmbed.configure({ products: products ?? [] }),
      Columns,
      Column,
      TextColor,
      TextAlign,
      ButtonRow,
      BlockStyle,
    ],
    editorProps: {
      attributes: { class: "rich-editor-content", "aria-label": "Nội dung" },
      handlePaste: (view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []);
        if (files.length > 0) {
          void insertImages(files);
          return true;
        }
        // Dán link trang sản phẩm vào một dòng trống → thành ô sản phẩm (thẻ có ảnh + giá trên web).
        const slug = productSlugFromUrl(event.clipboardData?.getData("text/plain") ?? "");
        const { $from, empty } = view.state.selection;
        const onEmptyLine = empty && $from.parent.type.name === "paragraph" && $from.parent.content.size === 0;
        if (slug && onEmptyLine && products?.some((product) => product.slug === slug)) {
          editorRef.current?.chain().focus().insertProductEmbed(slug).run();
          return true;
        }
        return false;
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false;
        const files = Array.from(event.dataTransfer?.files ?? []);
        if (files.length === 0) return false;
        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
        void insertImages(files, pos);
        return true;
      },
    },
    onUpdate: ({ editor: current }) => {
      dirty.current = true;
      setHtml(current.isEmpty ? "" : current.getHTML());
    },
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  // Rời trang khi có thay đổi chưa lưu → trình duyệt hỏi lại. Bấm Lưu (submit form) thì thôi hỏi.
  useEffect(() => {
    const form = inputRef.current?.form;
    const onSubmit = () => (dirty.current = false);
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (dirty.current) event.preventDefault();
    };
    form?.addEventListener("submit", onSubmit);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      form?.removeEventListener("submit", onSubmit);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);

  return (
    <div className="rich-editor">
      <input ref={inputRef} type="hidden" name={name} value={html} />
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(event) => {
          void insertImages(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />

      {editor ? (
        <>
          <Toolbar
            editor={editor}
            hasProducts={Boolean(products)}
            uploading={uploading}
            panel={panel}
            onPanel={setPanel}
            onPickImage={() => fileRef.current?.click()}
          />
          {panel === "link" ? <LinkBar editor={editor} onClose={() => setPanel(null)} /> : null}
          {panel === "product" && products ? (
            <ProductPicker
              products={products}
              onPick={(slugs) => {
                editor.chain().focus().insertProductEmbeds(slugs).run();
                setPanel(null);
              }}
              onClose={() => setPanel(null)}
            />
          ) : null}
        </>
      ) : (
        <div className="rich-editor-toolbar h-[46px]" />
      )}

      {error ? <p className="border-b border-divider bg-accent-50 px-3 py-2 text-xs font-semibold text-accent-700">{error}</p> : null}
      <EditorContent editor={editor} />
      {editor ? <Stats editor={editor} /> : null}
    </div>
  );
}

// ───────────── Thanh công cụ ─────────────

function Toolbar({
  editor,
  hasProducts,
  uploading,
  panel,
  onPanel,
  onPickImage,
}: {
  editor: Editor;
  hasProducts: boolean;
  uploading: number;
  panel: "link" | "product" | null;
  onPanel: (panel: "link" | "product" | null) => void;
  onPickImage: () => void;
}) {
  // Chỉ vẽ lại thanh công cụ khi trạng thái nút đổi, không phải mỗi lần gõ.
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      paragraph: e.isActive("paragraph") && !e.isActive("callout") && !e.getAttributes("paragraph").variant,
      badge: e.isActive("paragraph", { variant: "badge" }),
      lead: e.isActive("paragraph", { variant: "lead" }),
      xl: e.isActive("heading", { size: "xl" }),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      green: e.isActive("callout", { tone: "green" }),
      red: e.isActive("callout", { tone: "red" }),
      link: e.isActive("link"),
      columns: e.isActive("columns"),
      valign: (e.getAttributes("columns").valign as string | undefined) ?? "center",
      // Căn của đoạn / tiêu đề / hàng nút đang chọn.
      align:
        (e.getAttributes("buttonRow").textAlign as string | undefined) ??
        (e.getAttributes("heading").textAlign as string | undefined) ??
        (e.getAttributes("paragraph").textAlign as string | undefined) ??
        "left",
      color: (e.getAttributes("textColor").color as string | undefined) ?? null,
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });
  const run = (fn: (chain: ReturnType<Editor["chain"]>) => ReturnType<Editor["chain"]>) => fn(editor.chain().focus()).run();

  return (
    <div className="rich-editor-toolbar" role="toolbar" aria-label="Định dạng">
      <Group>
        <Btn label="Văn bản thường" active={state.paragraph && !state.h2 && !state.h3} onClick={() => run((c) => c.setParagraph())}>
          Văn bản
        </Btn>
        <Btn label="Tiêu đề rất lớn (phần đầu trang chủ)" active={state.xl} onClick={() => run((c) => c.toggleHeadingXl())}>
          Tiêu đề to
        </Btn>
        <Btn label="Tiêu đề lớn" active={state.h2 && !state.xl} onClick={() => run((c) => c.toggleHeading({ level: 2 }))}>
          Tiêu đề
        </Btn>
        <Btn label="Tiêu đề nhỏ" active={state.h3} onClick={() => run((c) => c.toggleHeading({ level: 3 }))}>
          Tiêu đề nhỏ
        </Btn>
        <Btn label="Nhãn nhỏ in hoa nền hồng (ví dụ: TRÁI CÂY ĐÔNG LẠNH CHUẨN VIETGAP)" active={state.badge} onClick={() => run((c) => c.toggleParagraphVariant("badge"))}>
          Nhãn
        </Btn>
        <Btn label="Đoạn dẫn: chữ to hơn, màu dịu (đoạn giới thiệu ngay dưới tiêu đề)" active={state.lead} onClick={() => run((c) => c.toggleParagraphVariant("lead"))}>
          Đoạn dẫn
        </Btn>
      </Group>
      <Group>
        <Btn label="In đậm (Ctrl+B)" active={state.bold} onClick={() => run((c) => c.toggleBold())}>
          <b>B</b>
        </Btn>
        <Btn label="In nghiêng (Ctrl+I)" active={state.italic} onClick={() => run((c) => c.toggleItalic())}>
          <i className="font-serif">I</i>
        </Btn>
        <Btn label="Gạch chân (Ctrl+U)" active={state.underline} onClick={() => run((c) => c.toggleUnderline())}>
          <u>U</u>
        </Btn>
        <Btn label="Gạch ngang" active={state.strike} onClick={() => run((c) => c.toggleStrike())}>
          <s>S</s>
        </Btn>
      </Group>
      <Group>
        <Btn label="Căn trái" active={state.align === "left"} onClick={() => run((c) => c.setTextAlign("left"))}>
          <AlignIcon lines={["M4 6h16", "M4 10h10", "M4 14h16", "M4 18h10"]} />
        </Btn>
        <Btn label="Căn giữa" active={state.align === "center"} onClick={() => run((c) => c.setTextAlign("center"))}>
          <AlignIcon lines={["M4 6h16", "M7 10h10", "M4 14h16", "M7 18h10"]} />
        </Btn>
        <Btn label="Căn phải" active={state.align === "right"} onClick={() => run((c) => c.setTextAlign("right"))}>
          <AlignIcon lines={["M4 6h16", "M10 10h10", "M4 14h16", "M10 18h10"]} />
        </Btn>
      </Group>
      <Group>
        {/* Màu chữ: chỉ các màu trong chủ đề web. Bôi đen chữ rồi bấm màu; bấm lại màu đang dùng để bỏ. */}
        {TEXT_COLORS.map((color) => (
          <Btn
            key={color}
            label={`Chữ màu ${TEXT_COLOR_LABELS[color].toLowerCase()}`}
            active={state.color === color}
            onClick={() => run((c) => (state.color === color ? c.unsetTextColor() : c.setTextColor(color)))}
          >
            <span className="editor-color-swatch" data-color={color}>
              A
            </span>
          </Btn>
        ))}
        <Btn label="Bỏ màu chữ (về màu mặc định)" disabled={!state.color} onClick={() => run((c) => c.unsetTextColor())}>
          <span className="text-foreground/70">A̸</span>
        </Btn>
      </Group>
      <Group>
        <Btn label="Danh sách chấm" active={state.bullet} onClick={() => run((c) => c.toggleBulletList())}>
          • Danh sách
        </Btn>
        <Btn label="Danh sách đánh số" active={state.ordered} onClick={() => run((c) => c.toggleOrderedList())}>
          1. Danh sách
        </Btn>
        <Btn label="Trích dẫn" active={state.quote} onClick={() => run((c) => c.toggleBlockquote())}>
          ❝ Trích dẫn
        </Btn>
        <Btn label="Khung ghi chú xanh (mẹo, lưu ý tích cực)" active={state.green} onClick={() => run((c) => c.toggleCallout("green"))}>
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-leaf-600" /> Ghi chú
        </Btn>
        <Btn label="Khung cảnh báo đỏ (điều cần tránh)" active={state.red} onClick={() => run((c) => c.toggleCallout("red"))}>
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent-600" /> Cảnh báo
        </Btn>
      </Group>
      <Group>
        <Btn label="Chèn / sửa liên kết" active={state.link || panel === "link"} onClick={() => onPanel(panel === "link" ? null : "link")}>
          🔗 Liên kết
        </Btn>
        <Btn label="Chèn ảnh (hoặc dán / kéo ảnh vào bài)" onClick={onPickImage} disabled={uploading > 0}>
          🖼 {uploading > 0 ? `Đang tải ${uploading} ảnh…` : "Ảnh"}
        </Btn>
        <Btn label="Chèn hàng nút điều hướng (ví dụ: Khám phá sản phẩm, Liên hệ)" onClick={() => run((c) => c.insertButtonRow())}>
          🔘 Nút
        </Btn>
        {hasProducts ? (
          <Btn label="Chèn ô sản phẩm" active={panel === "product"} onClick={() => onPanel(panel === "product" ? null : "product")}>
            🛒 Sản phẩm
          </Btn>
        ) : null}
        <Btn label="Đường kẻ ngang" onClick={() => run((c) => c.setHorizontalRule())}>
          ―
        </Btn>
      </Group>
      <Group>
        {state.columns ? (
          <>
            <Btn label="Đổi chỗ cột trái / phải" onClick={() => run((c) => c.swapColumns())}>
              ⇄ Đổi bên
            </Btn>
            <Btn label="Hai cột căn theo mép trên" active={state.valign === "top"} onClick={() => run((c) => c.setColumnsValign("top"))}>
              ⤒ Trên
            </Btn>
            <Btn label="Hai cột căn giữa theo chiều dọc" active={state.valign === "center"} onClick={() => run((c) => c.setColumnsValign("center"))}>
              ↕ Giữa
            </Btn>
            <Btn label="Hai cột căn theo mép dưới" active={state.valign === "bottom"} onClick={() => run((c) => c.setColumnsValign("bottom"))}>
              ⤓ Dưới
            </Btn>
            <Btn label="Bỏ chia cột (nội dung hai cột nối tiếp nhau)" onClick={() => run((c) => c.unsetColumns())}>
              ✕ Bỏ chia cột
            </Btn>
          </>
        ) : (
          <Btn label="Chia đôi trái / phải (ví dụ: ảnh một bên, chữ một bên)" onClick={() => run((c) => c.insertColumns())}>
            ▥ Chia 2 cột
          </Btn>
        )}
      </Group>
      <Group>
        <Btn label="Hoàn tác (Ctrl+Z)" disabled={!state.canUndo} onClick={() => run((c) => c.undo())}>
          ↶
        </Btn>
        <Btn label="Làm lại (Ctrl+Y)" disabled={!state.canRedo} onClick={() => run((c) => c.redo())}>
          ↷
        </Btn>
      </Group>
    </div>
  );
}

/** Biểu tượng căn lề: 4 vạch ngang dài / ngắn. */
function AlignIcon({ lines }: { lines: string[] }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4" aria-hidden>
      {lines.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

function Group({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-0.5 border-r border-divider pr-1.5 last:border-r-0">{children}</div>;
}

function Btn({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      // Giữ vùng chọn trong trình soạn thảo khi bấm nút.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`inline-flex h-8 items-center gap-1 whitespace-nowrap px-2 text-[13px] font-semibold transition-colors disabled:opacity-35 ${
        active ? "bg-ink text-white" : "text-foreground/80 hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

// ───────────── Liên kết ─────────────

function LinkBar({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const current = (editor.getAttributes("link").href as string | undefined) ?? "";
  const [url, setUrl] = useState(current);
  const hasSelection = !editor.state.selection.empty || editor.isActive("link");
  const linkGroups = useLinkOptionGroups();

  function apply() {
    const value = url.trim();
    if (!value) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      const href = normalizeHref(value);
      if (hasSelection) editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
      else {
        // Chưa bôi đen chữ: chèn tên trang (vd "Liên hệ") thay vì đường dẫn thô "/contact".
        const text = linkGroups?.flatMap((group) => group.options).find((option) => option.value === value)?.label ?? value;
        editor.chain().focus().insertContent({ type: "text", text, marks: [{ type: "link", attrs: { href } }] }).run();
      }
    }
    onClose();
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-divider bg-leaf-50 px-3 py-2 text-sm">
      <span className="font-semibold text-leaf-700">{hasSelection ? "Liên kết cho chữ đang chọn:" : "Chèn liên kết:"}</span>
      <LinkSelect
        autoFocus
        value={url}
        onChange={setUrl}
        onEnter={apply}
        onEscape={onClose}
        label="Trang cần liên kết"
        className="min-w-56 flex-1"
        inputClassName="w-full border border-divider bg-white px-2 py-1"
      />
      <button type="button" onClick={apply} className="bg-leaf-600 px-3 py-1 font-bold text-white hover:bg-leaf-700">
        Áp dụng
      </button>
      {current ? (
        <button
          type="button"
          onClick={() => {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            onClose();
          }}
          className="px-2 py-1 font-semibold text-accent-700 hover:underline"
        >
          Bỏ liên kết
        </button>
      ) : null}
      <button type="button" onClick={onClose} className="px-2 py-1 text-foreground/60 hover:text-foreground">
        Đóng
      </button>
    </div>
  );
}

// ───────────── Chọn sản phẩm ─────────────

function normalize(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase();
}

function ProductPicker({ products, onPick, onClose }: { products: ProductOption[]; onPick: (slugs: string[]) => void; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const filtered = products.filter((product) => normalize(`${product.name} ${product.category}`).includes(normalize(query.trim())));
  const toggle = (slug: string) =>
    setSelected((current) => (current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]));

  return (
    <div className="border-b border-divider bg-leaf-50 px-3 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") onClose();
            if (event.key === "Enter") {
              event.preventDefault();
              if (selected.length > 0) onPick(selected);
              else if (filtered[0]) onPick([filtered[0].slug]);
            }
          }}
          placeholder="Tìm sản phẩm (có dấu hoặc không dấu)… bấm để chọn, chọn nhiều để xếp thành hàng"
          className="min-w-64 flex-1 border border-divider bg-white px-2 py-1.5 text-sm"
        />
        <button
          type="button"
          disabled={selected.length === 0}
          onClick={() => onPick(selected)}
          className="bg-leaf-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-leaf-700 disabled:opacity-40"
        >
          Chèn {selected.length > 0 ? `${selected.length} ` : ""}sản phẩm
        </button>
        <button type="button" onClick={onClose} className="px-2 py-1 text-sm text-foreground/60 hover:text-foreground">
          Đóng
        </button>
      </div>
      <ul className="mt-2 grid max-h-72 grid-cols-2 gap-1.5 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((product) => {
          const order = selected.indexOf(product.slug);
          return (
            <li key={product.slug}>
              <button
                type="button"
                aria-pressed={order >= 0}
                onClick={() => toggle(product.slug)}
                className={`relative flex w-full flex-col bg-white p-1.5 text-left text-xs ring-1 transition ${
                  order >= 0 ? "ring-2 ring-leaf-600" : "ring-divider hover:ring-leaf-600"
                }`}
              >
                <span className="relative aspect-square w-full overflow-hidden bg-muted">
                  {product.image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- ảnh nhỏ từ API
                    <img src={product.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  ) : null}
                </span>
                <span className="mt-1 line-clamp-2 font-semibold leading-snug">{product.name}</span>
                <span className="font-bold text-accent-700">{formatCurrency(product.price)}</span>
                {order >= 0 ? (
                  <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-leaf-600 text-xs font-bold text-white">
                    {order + 1}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
        {filtered.length === 0 ? <li className="col-span-full px-1 py-2 text-sm text-foreground/60">Không có sản phẩm đang bán nào khớp.</li> : null}
      </ul>
    </div>
  );
}

// ───────────── Thống kê nhỏ cuối khung ─────────────

function Stats({ editor }: { editor: Editor }) {
  const [helpOpen, setHelpOpen] = useState(false);
  const helpId = useId();
  const stats = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      let images = 0;
      let products = 0;
      e.state.doc.descendants((node) => {
        if (node.type.name === "figure") images += 1;
        if (node.type.name === "productEmbed") products += 1;
      });
      return { words: e.storage.characterCount.words() as number, images, products };
    },
  });
  return (
    <div className="flex flex-wrap justify-between gap-2 border-t border-divider bg-muted/40 px-3 py-1.5 text-xs text-foreground/55">
      <span>
        {stats.words} chữ · {stats.images} ảnh · {stats.products} ô sản phẩm
      </span>
      <span className="flex items-center gap-1.5">
        <HelpPanel id={helpId} open={helpOpen} axis="x">
          <span>Enter: đoạn mới · Shift+Enter: xuống dòng trong cùng đoạn · kéo ảnh / ô sản phẩm để đổi vị trí</span>
        </HelpPanel>
        <HelpButton open={helpOpen} onToggle={() => setHelpOpen((value) => !value)} controls={helpId} label="phím tắt soạn thảo" />
      </span>
    </div>
  );
}
