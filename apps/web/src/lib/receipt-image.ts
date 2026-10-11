import type { ReceiptContent } from "@/lib/receipt-content";

/**
 * Vẽ bill ra ảnh PNG (canvas) để khách tải về máy — không cần thư viện chụp màn hình.
 * Bố cục giống ReceiptPaper: dải đỏ, tên cửa hàng, thông tin đơn, bảng sản phẩm, tổng tiền, mép răng cưa.
 */
const WIDTH = 420;
const PAD = 28;
const SCALE = 2;
const FONT = '"Consolas", "Courier New", ui-monospace, monospace';
const INK = "#2b2827";
const MUTED = "#6b6563";
const RED = "#ae1800";

type Ctx = CanvasRenderingContext2D;

function setFont(ctx: Ctx, size: number, bold = false) {
  ctx.font = `${bold ? "700 " : ""}${size}px ${FONT}`;
}

/** Chia chữ dài thành nhiều dòng vừa `maxWidth`. */
function wrap(ctx: Ctx, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth || !line) line = next;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Vẽ toàn bộ bill; `draw = false` chỉ để đo chiều cao. Trả về chiều cao đã dùng. */
function paint(ctx: Ctx, content: ReceiptContent, draw: boolean): number {
  const right = WIDTH - PAD;
  const inner = WIDTH - PAD * 2;
  let y = 0;

  const text = (value: string, x: number, size: number, options: { bold?: boolean; color?: string; align?: CanvasTextAlign } = {}) => {
    if (!draw) return;
    setFont(ctx, size, options.bold);
    ctx.fillStyle = options.color ?? INK;
    ctx.textAlign = options.align ?? "left";
    ctx.fillText(value, x, y);
  };
  const dashed = (pattern: number[]) => {
    y += 12;
    if (draw) {
      ctx.save();
      ctx.strokeStyle = "#c9c4c2";
      ctx.setLineDash(pattern);
      ctx.beginPath();
      ctx.moveTo(PAD, y);
      ctx.lineTo(right, y);
      ctx.stroke();
      ctx.restore();
    }
    y += 16;
  };

  // Dải đỏ đầu bill.
  if (draw) {
    const gradient = ctx.createLinearGradient(0, 0, WIDTH, 70);
    gradient.addColorStop(0, "#7c1405");
    gradient.addColorStop(0.55, "#cf2a10");
    gradient.addColorStop(1, "#ff563c");
    ctx.fillStyle = gradient;
    ctx.fillRect(PAD - 8, 16, inner + 16, 64);
  }
  y = 56;
  text("★ TRÁI CÂY ĐÔNG LẠNH ★", WIDTH / 2, 12, { bold: true, color: "#ffffff", align: "center" });
  y = 112;
  text("· HOÁ ĐƠN BÁN HÀNG ·", WIDTH / 2, 11, { color: MUTED, align: "center" });

  setFont(ctx, 17, true);
  for (const line of wrap(ctx, content.storeName.toUpperCase(), inner)) {
    y += 24;
    text(line, WIDTH / 2, 17, { bold: true, align: "center" });
  }
  setFont(ctx, 11);
  for (const raw of content.storeLines) {
    for (const line of wrap(ctx, raw, inner)) {
      y += 17;
      text(line, WIDTH / 2, 11, { color: MUTED, align: "center" });
    }
  }
  dashed([2, 6]);

  // Thông tin đơn: nhãn trái, giá trị phải (xuống dòng nếu dài).
  for (const row of content.info) {
    setFont(ctx, 12, true);
    const valueLines = wrap(ctx, row.value, inner - 120);
    y += 4;
    text(`${row.label.toUpperCase()}:`, PAD, 12, { color: MUTED });
    valueLines.forEach((line, index) => {
      if (index > 0) y += 18;
      text(line, right, 12, { bold: true, align: "right" });
    });
    y += 16;
  }
  dashed([6, 4]);

  // Bảng sản phẩm.
  text("SL", PAD, 11, { bold: true, color: MUTED });
  text("SẢN PHẨM", PAD + 40, 11, { bold: true, color: MUTED });
  text("TIỀN", right, 11, { bold: true, color: MUTED, align: "right" });
  for (const item of content.items) {
    y += 22;
    text(`${item.quantity}x`, PAD, 12);
    text(item.amount, right, 12, { align: "right" });
    setFont(ctx, 12, true);
    wrap(ctx, item.name, inner - 150).forEach((line, index) => {
      if (index > 0) y += 17;
      text(line, PAD + 40, 12, { bold: true });
    });
    y += 16;
    text(item.detail, PAD + 40, 11, { color: MUTED });
  }
  dashed([6, 4]);

  for (const row of content.totals) {
    if (row.strong) {
      y += 6;
      if (draw) {
        ctx.save();
        ctx.strokeStyle = "#c9c4c2";
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(PAD, y - 4);
        ctx.lineTo(right, y - 4);
        ctx.stroke();
        ctx.restore();
      }
      y += 20;
      text(`${row.label}:`, PAD, 15, { bold: true });
      text(row.value, right, 15, { bold: true, color: RED, align: "right" });
    } else {
      text(`${row.label}:`, PAD, 12, { color: MUTED });
      text(row.value, right, 12, { bold: true, align: "right" });
      y += 20;
    }
  }

  y += 14;
  for (const line of content.footer) {
    y += 17;
    text(line, WIDTH / 2, 11, { color: MUTED, align: "center" });
  }
  return y + 34;
}

/** Mép dưới răng cưa như giấy xé. */
function zigzag(ctx: Ctx, height: number) {
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(WIDTH, 0);
  ctx.lineTo(WIDTH, height - 8);
  const tooth = 12;
  for (let x = WIDTH; x > 0; x -= tooth) {
    ctx.lineTo(x - tooth / 2, height);
    ctx.lineTo(x - tooth, height - 8);
  }
  ctx.closePath();
  ctx.fill();
}

export async function receiptToPngBlob(content: ReceiptContent): Promise<Blob> {
  const measure = document.createElement("canvas").getContext("2d");
  if (!measure) throw new Error("Trình duyệt không hỗ trợ tạo ảnh.");
  const height = Math.ceil(paint(measure, content, false));

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH * SCALE;
  canvas.height = height * SCALE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Trình duyệt không hỗ trợ tạo ảnh.");
  ctx.scale(SCALE, SCALE);
  ctx.textBaseline = "alphabetic";
  zigzag(ctx, height);
  paint(ctx, content, true);

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Không tạo được ảnh bill."))), "image/png"),
  );
}

/** Tải ảnh bill về máy: hoa-don-DH260929ABCD.png */
export async function downloadReceiptPng(content: ReceiptContent, orderNumber: string): Promise<void> {
  const url = URL.createObjectURL(await receiptToPngBlob(content));
  const link = document.createElement("a");
  link.href = url;
  link.download = `hoa-don-${orderNumber}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
