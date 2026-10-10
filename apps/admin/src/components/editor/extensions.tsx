"use client";

import { Node, mergeAttributes, type CommandProps, type JSONContent } from "@tiptap/core";
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from "@tiptap/react";
import { PRODUCT_EMBED_ATTR } from "@frozen-fruit-shop/types";
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
