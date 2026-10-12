"use client";

import { Extension, Mark, Node, mergeAttributes, type CommandProps, type JSONContent } from "@tiptap/core";
import { TextSelection } from "@tiptap/pm/state";
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from "@tiptap/react";
import {
  BUTTON_STYLES,
  BUTTON_STYLE_LABELS,
  COLUMN_ATTR,
  COLUMN_VALIGNS,
  COLUMNS_ATTR,
  MAX_BUTTONS_PER_ROW,
  PRODUCT_EMBED_ATTR,
  TEXT_COLORS,
  type ButtonStyle,
  type ColumnValign,
  type TextAlign as TextAlignName,
  type TextColor as TextColorName,
} from "@frozen-fruit-shop/types";
import { formatCurrency } from "@/lib/format";

/** Sản phẩm để chọn chèn vào bài (lấy sẵn từ server, không gọi API khi gõ). */
export interface ProductOption {
  slug: string;
  name: string;
  image: string | null;
  /** Giá quy cách rẻ nhất — chỉ để admin nhận ra sản phẩm; web luôn lấy giá mới từ API. */
  price: number;
  category: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    figure: { insertFigure: (attrs: { src: string; alt?: string }) => ReturnType };
    productEmbed: {
      insertProductEmbed: (slug: string) => ReturnType;
      insertProductEmbeds: (slugs: string[]) => ReturnType;
    };
    callout: { toggleCallout: (tone: "green" | "red") => ReturnType };
    columns: {
      setColumnsValign: (valign: ColumnValign) => ReturnType;
      insertColumns: () => ReturnType;
      swapColumns: () => ReturnType;
      unsetColumns: () => ReturnType;
    };
    textColor: {
      setTextColor: (color: TextColorName) => ReturnType;
      unsetTextColor: () => ReturnType;
    };
    textAlign: { setTextAlign: (align: TextAlignName) => ReturnType };
    buttonRow: { insertButtonRow: () => ReturnType };
    blockStyle: {
      toggleParagraphVariant: (variant: "badge" | "lead") => ReturnType;
      toggleHeadingXl: () => ReturnType;
    };
  }
}

/**
 * Chèn một khối (ảnh, ô sản phẩm) kèm một đoạn trống phía sau để gõ tiếp.
 * Con trỏ đang ở dòng trống thì thay luôn dòng đó — tránh để lại dòng trống thừa.
 */
function insertBlock(props: CommandProps, block: JSONContent | JSONContent[]): boolean {
  const { state, commands } = props;
  const { $from, empty } = state.selection;
  const content = [...(Array.isArray(block) ? block : [block]), { type: "paragraph" }];
  if (empty && $from.depth === 1 && $from.parent.type.name === "paragraph" && $from.parent.content.size === 0) {
    return commands.insertContentAt({ from: $from.before(), to: $from.after() }, content);
  }
  return commands.insertContent(content);
}

// ───────────── Ảnh có chú thích: <figure><img><figcaption>…</figcaption></figure> ─────────────

function FigureView({ node, deleteNode, selected }: ReactNodeViewProps) {
  return (
    <NodeViewWrapper as="figure" className={`editor-figure ${selected ? "is-selected" : ""}`} data-drag-handle>
      {/* eslint-disable-next-line @next/next/no-img-element -- ảnh trong trình soạn thảo */}
      <img src={node.attrs.src as string} alt={node.attrs.alt as string} draggable={false} />
      <button type="button" className="editor-chip-btn editor-figure-remove" onClick={deleteNode} contentEditable={false}>
        Xoá ảnh
      </button>
      <NodeViewContent<"figcaption"> as="figcaption" />
    </NodeViewWrapper>
  );
}

export const Figure = Node.create({
  name: "figure",
  group: "block",
  content: "inline*",
  draggable: true,
  isolating: true,

  addAttributes() {
    return {
      src: { default: null, parseHTML: (el) => el.querySelector("img")?.getAttribute("src"), renderHTML: () => ({}) },
      alt: { default: "", parseHTML: (el) => el.querySelector("img")?.getAttribute("alt") ?? "", renderHTML: () => ({}) },
    };
  },

  parseHTML() {
    return [
      { tag: "figure", contentElement: "figcaption" },
      // Ảnh dán từ nơi khác (không có figure) → thành ảnh có chú thích trống.
      { tag: "img[src]", getAttrs: (el) => ({ src: el.getAttribute("src"), alt: el.getAttribute("alt") ?? "" }) },
    ];
  },

  renderHTML({ node }) {
    return ["figure", ["img", { src: node.attrs.src, alt: node.attrs.alt || "" }], ["figcaption", 0]];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FigureView);
  },

  addCommands() {
    return {
      insertFigure:
        (attrs) =>
        (props) =>
          insertBlock(props, { type: this.name, attrs }),
    };
  },
});

// ───────────── Khung ghi chú nổi bật: <aside data-tone="green|red"> ─────────────

export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "paragraph+",
  defining: true,

  addAttributes() {
    return {
      tone: {
        default: "green",
        parseHTML: (el) => (el.getAttribute("data-tone") === "red" ? "red" : "green"),
        renderHTML: (attrs) => ({ "data-tone": attrs.tone }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "aside[data-tone]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["aside", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      toggleCallout:
        (tone) =>
        ({ editor, commands }) => {
          if (editor.isActive(this.name, { tone })) return commands.lift(this.name);
          if (editor.isActive(this.name)) return commands.updateAttributes(this.name, { tone });
          return commands.wrapIn(this.name, { tone });
        },
    };
  },
});

// ───────────── Ô sản phẩm: <div data-product-slug="…"></div> ─────────────

/** Thẻ sản phẩm trong trình soạn thảo — giống thẻ trên web (ảnh vuông, tên, giá); các thẻ liền nhau xếp thành hàng. */
function ProductEmbedView({ node, deleteNode, selected, extension }: ReactNodeViewProps) {
  const slug = node.attrs.slug as string;
  const products = (extension.options as { products: ProductOption[] }).products;
  const product = products.find((item) => item.slug === slug);

  return (
    <NodeViewWrapper className={`editor-product ${selected ? "is-selected" : ""}`} data-drag-handle contentEditable={false}>
      <span className="editor-product-thumb">
        {product?.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- ảnh nhỏ trong trình soạn thảo
          <img src={product.image} alt="" />
        ) : null}
      </span>
      {product ? (
        <span className="editor-product-body">
          <span className="editor-product-name">{product.name}</span>
          <span className="editor-product-price">{formatCurrency(product.price)}</span>
        </span>
      ) : (
        <span className="editor-product-body text-xs font-semibold text-accent-700">
          “{slug}” đã ẩn / bị xoá — sẽ không hiện trên web
        </span>
      )}
      <button type="button" className="editor-chip-btn editor-product-remove" onClick={deleteNode}>
        Xoá
      </button>
    </NodeViewWrapper>
  );
}

export const ProductEmbed = Node.create<{ products: ProductOption[] }>({
  name: "productEmbed",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addOptions() {
    return { products: [] };
  },

  addAttributes() {
    return {
      slug: {
        default: "",
        parseHTML: (el) => el.getAttribute(PRODUCT_EMBED_ATTR) ?? "",
        renderHTML: (attrs) => ({ [PRODUCT_EMBED_ATTR]: attrs.slug }),
      },
    };
  },

  parseHTML() {
    return [{ tag: `div[${PRODUCT_EMBED_ATTR}]` }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", HTMLAttributes];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ProductEmbedView);
  },

  addCommands() {
    return {
      insertProductEmbed:
        (slug) =>
        (props) =>
          insertBlock(props, { type: this.name, attrs: { slug } }),
      // Nhiều sản phẩm liền nhau (không có dòng trống xen giữa) → web hiện thành một hàng thẻ.
      insertProductEmbeds:
        (slugs) =>
        (props) =>
          insertBlock(props, slugs.map((slug) => ({ type: this.name, attrs: { slug } }))),
    };
  },
});

// ───────────── Bố cục chia đôi: <div data-columns="2"><div data-column>…</div><div data-column>…</div></div> ─────────────

/** Một cột: chữ, tiêu đề, ảnh, danh sách, ghi chú — không lồng cột, không ô sản phẩm (ô sản phẩm cần cả bề ngang). */
export const Column = Node.create({
  name: "column",
  content: "(paragraph | heading | bulletList | orderedList | blockquote | figure | callout | horizontalRule | buttonRow)+",
  isolating: true,
  defining: true,

  parseHTML() {
    return [{ tag: `div[${COLUMN_ATTR}]` }];
  },

  renderHTML() {
    return ["div", { [COLUMN_ATTR]: "" }, 0];
  },
});

/** Tìm khối chia cột đang chứa con trỏ. */
function findColumns({ state }: CommandProps) {
  const { $from } = state.selection;
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth);
    if (node.type.name === "columns") return { node, pos: $from.before(depth) };
  }
  return null;
}

export const Columns = Node.create({
  name: "columns",
  group: "block",
  content: "column column",
  isolating: true,
  defining: true,
  draggable: true,

  addAttributes() {
    return {
      // Căn dọc hai cột so với nhau; mặc định căn giữa (ảnh cao, chữ ngắn vẫn cân).
      valign: {
        default: "center",
        parseHTML: (el) => {
          const value = el.getAttribute("data-valign");
          return value === "top" || value === "bottom" ? value : "center";
        },
        renderHTML: (attrs) => (attrs.valign === "center" ? {} : { "data-valign": attrs.valign }),
      },
    };
  },

  parseHTML() {
    return [{ tag: `div[${COLUMNS_ATTR}]` }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes({ [COLUMNS_ATTR]: "2" }, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setColumnsValign:
        (valign) =>
        (props) => {
          const found = findColumns(props);
          if (!found || !COLUMN_VALIGNS.includes(valign)) return false;
          props.dispatch?.(props.tr.setNodeAttribute(found.pos, "valign", valign));
          return true;
        },
      // Chèn khung 2 cột SAU đoạn đang đứng (không thay chữ đang bôi đen); đang ở dòng trống thì thay dòng đó.
      // Con trỏ đặt vào cột trái để gõ ngay.
      insertColumns:
        () =>
        ({ state, tr, dispatch }) => {
          const { schema, selection } = state;
          const { $from, empty } = selection;
          const column = () => schema.nodes.column.create(null, schema.nodes.paragraph.create());
          const node = schema.nodes.columns.create(null, [column(), column()]);
          const onEmptyLine = empty && $from.depth === 1 && $from.parent.type.name === "paragraph" && $from.parent.content.size === 0;
          let pos: number;
          if (onEmptyLine) {
            pos = $from.before(1);
            tr.replaceWith(pos, $from.after(1), node);
          } else {
            pos = $from.depth === 0 ? selection.to : $from.after(1);
            tr.insert(pos, node);
          }
          // Khung cột nằm cuối bài → thêm một đoạn trống phía sau để gõ tiếp bên ngoài cột.
          const end = pos + node.nodeSize;
          if (end >= tr.doc.content.size) tr.insert(end, schema.nodes.paragraph.create());
          // pos: trước khung · +1 vào khung · +1 vào cột trái · +1 vào đoạn đầu cột.
          tr.setSelection(TextSelection.create(tr.doc, pos + 3));
          dispatch?.(tr.scrollIntoView());
          return true;
        },
      // Đổi chỗ hai cột (ví dụ ảnh đang bên trái → sang phải).
      swapColumns:
        () =>
        (props) => {
          const found = findColumns(props);
          if (!found) return false;
          const { node, pos } = found;
          const { tr } = props;
          tr.replaceWith(pos, pos + node.nodeSize, node.type.create(node.attrs, [node.child(1), node.child(0)]));
          // Giữ con trỏ trong khung cột (đầu cột trái) để vẫn thấy nút Đổi bên / Bỏ chia cột.
          tr.setSelection(TextSelection.near(tr.doc.resolve(pos + 3)));
          props.dispatch?.(tr);
          return true;
        },
      // Bỏ chia cột: nội dung cột trái rồi cột phải nối tiếp nhau như bình thường.
      unsetColumns:
        () =>
        (props) => {
          const found = findColumns(props);
          if (!found) return false;
          const { node, pos } = found;
          const blocks: ReturnType<typeof node.child>[] = [];
          // Bỏ các dòng trống của cột chưa gõ gì; cả hai cột trống thì còn lại một dòng trống.
          node.forEach((column) =>
            column.forEach((block) => {
              if (!(block.type.name === "paragraph" && block.content.size === 0)) blocks.push(block);
            }),
          );
          if (blocks.length === 0) blocks.push(props.state.schema.nodes.paragraph.create());
          props.dispatch?.(props.tr.replaceWith(pos, pos + node.nodeSize, blocks));
          return true;
        },
    };
  },
});

// ───────────── Màu chữ trong chủ đề web: <span data-color="red|green|gray"> ─────────────

export const TextColor = Mark.create({
  name: "textColor",

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (el) => {
          const color = el.getAttribute("data-color");
          return (TEXT_COLORS as readonly string[]).includes(color ?? "") ? color : null;
        },
        renderHTML: (attrs) => ({ "data-color": attrs.color }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-color]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setTextColor:
        (color) =>
        ({ commands }) =>
          commands.setMark(this.name, { color }),
      unsetTextColor:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },
});

// ───────────── Căn ngang: data-align="center|right" trên đoạn văn, tiêu đề, hàng nút ─────────────

const ALIGNABLE = ["paragraph", "heading", "buttonRow"];

export const TextAlign = Extension.create({
  name: "textAlign",

  addGlobalAttributes() {
    return [
      {
        types: ALIGNABLE,
        attributes: {
          textAlign: {
            default: "left",
            parseHTML: (el) => {
              const value = el.getAttribute("data-align");
              return value === "center" || value === "right" ? value : "left";
            },
            renderHTML: (attrs) => (attrs.textAlign === "left" ? {} : { "data-align": attrs.textAlign }),
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setTextAlign:
        (align) =>
        ({ commands }) =>
          ALIGNABLE.map((type) => commands.updateAttributes(type, { textAlign: align })).some(Boolean),
    };
  },
});

// ───────────── Hàng nút điều hướng: <p data-buttons><a data-button="red" href="…">Chữ</a>…</p> ─────────────

interface ButtonItem {
  label: string;
  href: string;
  style: ButtonStyle;
}

const DEFAULT_BUTTON: ButtonItem = { label: "Xem sản phẩm", href: "/products", style: "red" };

/** Gõ "zalo.me/…" → https://…; "products/…" → "/products/…" (giống ô chèn liên kết). */
function normalizeButtonHref(value: string): string {
  const text = value.trim();
  if (!text || /^(https?:|mailto:|tel:|\/)/i.test(text)) return text;
  return text.split(/[/?#]/)[0].includes(".") ? `https://${text}` : `/${text}`;
}

/** Xem trước nút giống trên web + ô sửa chữ, link, màu ngay bên dưới. */
function ButtonRowView({ node, updateAttributes, deleteNode, selected }: ReactNodeViewProps) {
  const buttons = node.attrs.buttons as ButtonItem[];
  const align = node.attrs.textAlign as TextAlignName;
  const update = (index: number, patch: Partial<ButtonItem>) =>
    updateAttributes({ buttons: buttons.map((item, i) => (i === index ? { ...item, ...patch } : item)) });

  return (
    <NodeViewWrapper className={`editor-buttons ${selected ? "is-selected" : ""}`} data-drag-handle contentEditable={false}>
      <div className="editor-buttons-preview" data-align={align}>
        {buttons.map((item, index) => (
          <span key={index} className="editor-button" data-button={item.style}>
            {item.label || "(chưa có chữ)"}
          </span>
        ))}
      </div>
      <div className="editor-buttons-form">
        {buttons.map((item, index) => (
          <div key={index} className="editor-buttons-row">
            <input
              value={item.label}
              onChange={(event) => update(index, { label: event.target.value })}
              placeholder="Chữ trên nút"
              maxLength={40}
              aria-label={`Chữ trên nút ${index + 1}`}
            />
            <input
              value={item.href}
              onChange={(event) => update(index, { href: event.target.value })}
              onBlur={(event) => update(index, { href: normalizeButtonHref(event.target.value) })}
              placeholder="/products hoặc https://zalo.me/…"
              aria-label={`Link của nút ${index + 1}`}
            />
            <select
              value={item.style}
              onChange={(event) => update(index, { style: event.target.value as ButtonStyle })}
              aria-label={`Màu nút ${index + 1}`}
            >
              {BUTTON_STYLES.map((style) => (
                <option key={style} value={style}>
                  {BUTTON_STYLE_LABELS[style]}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="editor-chip-btn"
              onClick={() => (buttons.length === 1 ? deleteNode() : updateAttributes({ buttons: buttons.filter((_, i) => i !== index) }))}
            >
              Xoá nút
            </button>
          </div>
        ))}
        {buttons.length < MAX_BUTTONS_PER_ROW ? (
          <button
            type="button"
            className="editor-chip-btn"
            onClick={() => updateAttributes({ buttons: [...buttons, { label: "Liên hệ", href: "/contact", style: "light" }] })}
          >
            + Thêm nút cạnh bên
          </button>
        ) : null}
      </div>
    </NodeViewWrapper>
  );
}

export const ButtonRow = Node.create({
  name: "buttonRow",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      buttons: {
        default: [DEFAULT_BUTTON],
        parseHTML: (el) =>
          Array.from(el.querySelectorAll("a"))
            .slice(0, MAX_BUTTONS_PER_ROW)
            .map((a) => {
              const style = a.getAttribute("data-button");
              return {
                label: a.textContent ?? "",
                href: a.getAttribute("href") ?? "",
                style: (BUTTON_STYLES as readonly string[]).includes(style ?? "") ? (style as ButtonStyle) : "red",
              };
            }),
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [{ tag: "p[data-buttons]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    // Nút chưa có chữ hoặc link thì không xuất ra (tránh nút rỗng trên web).
    const buttons = (node.attrs.buttons as ButtonItem[]).filter((item) => item.label.trim() && item.href.trim());
    return [
      "p",
      mergeAttributes(HTMLAttributes, { "data-buttons": "" }),
      ...buttons.map((item) => ["a", { href: normalizeButtonHref(item.href), "data-button": item.style }, item.label.trim()]),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ButtonRowView);
  },

  addCommands() {
    return {
      insertButtonRow:
        () =>
        (props) =>
          insertBlock(props, { type: this.name, attrs: { buttons: [DEFAULT_BUTTON] } }),
    };
  },
});

// ───────────── Kiểu khối chữ: nhãn / đoạn dẫn (p[data-variant]), tiêu đề rất lớn (h2[data-size="xl"]) ─────────────

export type ParagraphVariant = "badge" | "lead";

export const BlockStyle = Extension.create({
  name: "blockStyle",

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph"],
        attributes: {
          variant: {
            default: null,
            parseHTML: (el) => {
              const value = el.getAttribute("data-variant");
              return value === "badge" || value === "lead" ? value : null;
            },
            renderHTML: (attrs) => (attrs.variant ? { "data-variant": attrs.variant } : {}),
          },
        },
      },
      {
        types: ["heading"],
        attributes: {
          size: {
            default: null,
            parseHTML: (el) => (el.getAttribute("data-size") === "xl" ? "xl" : null),
            renderHTML: (attrs) => (attrs.size === "xl" ? { "data-size": "xl" } : {}),
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      // Bấm lại đúng kiểu đang dùng → về đoạn văn thường.
      toggleParagraphVariant:
        (variant: ParagraphVariant) =>
        ({ editor, chain }) => {
          const active = editor.isActive("paragraph", { variant });
          return chain()
            .setParagraph()
            .updateAttributes("paragraph", { variant: active ? null : variant })
            .run();
        },
      toggleHeadingXl:
        () =>
        ({ editor, chain }) => {
          const active = editor.isActive("heading", { size: "xl" });
          if (active) return chain().updateAttributes("heading", { size: null }).run();
          return chain().setHeading({ level: 2 }).updateAttributes("heading", { size: "xl" }).run();
        },
    };
  },
});
