import ExcelJS from 'exceljs';
import type { Writable } from 'node:stream';
import type { Prisma } from '@prisma/client';
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@frozen-fruit-shop/types';

type ExportRow = Prisma.OrderGetPayload<{ include: { items: true } }>;

const MONEY = '#,##0 "đ"';
const DATE_TIME = 'dd/mm/yyyy hh:mm';
const HEADER_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCF2A10' } };

/** Excel không có múi giờ: dời giờ UTC sang giờ Việt Nam để ô ngày hiện đúng giờ khách đặt. */
/** Cố định dòng tiêu đề khi cuộn — sheet ghi dạng stream chỉ nhận views lúc tạo sheet. */
const SHEET_OPTIONS: Partial<ExcelJS.AddWorksheetOptions> = { views: [{ state: 'frozen', ySplit: 1 }] };

const vnTime = (date: Date) => new Date(date.getTime() + 7 * 3600_000);

function styleHeader(sheet: ExcelJS.Worksheet) {
  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  header.fill = HEADER_FILL;
  header.alignment = { vertical: 'middle' };
  header.height = 22;
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sheet.columns.length } };
}

/**
 * File Excel đơn hàng cho chủ cửa hàng: sheet "Đơn hàng" (một dòng mỗi đơn + dòng tổng không tính đơn huỷ)
 * và sheet "Chi tiết sản phẩm" (một dòng mỗi món) để lọc / cộng theo sản phẩm.
 *
 * Ghi thẳng ra `out` (response HTTP) theo từng lô đơn — không dựng cả file trong RAM, nên xuất hàng chục nghìn đơn
 * vẫn chạy được trên máy chủ ít bộ nhớ. `batches()` được gọi hai lần (mỗi sheet một lượt), phải trả cùng dữ liệu.
 */
export async function streamOrdersWorkbook(out: Writable, batches: () => AsyncIterable<ExportRow[]>, title: string): Promise<void> {
  const book = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: out, useStyles: true, useSharedStrings: false });
  book.creator = 'Trái Cây Đông Lạnh Đà Nẵng 28';
  book.created = new Date();
  book.title = title;

  const orders = book.addWorksheet('Đơn hàng', SHEET_OPTIONS);
  orders.columns = [
    { header: 'Mã đơn', key: 'orderNumber', width: 16 },
    { header: 'Ngày đặt', key: 'createdAt', width: 17, style: { numFmt: DATE_TIME } },
    { header: 'Khách hàng', key: 'customerName', width: 24 },
    { header: 'Số điện thoại', key: 'customerPhone', width: 14 },
    { header: 'Email', key: 'customerEmail', width: 24 },
    { header: 'Địa chỉ giao hàng', key: 'shippingAddress', width: 40 },
    { header: 'Trạng thái', key: 'status', width: 15 },
    { header: 'Thanh toán', key: 'paymentStatus', width: 16 },
    { header: 'Số món', key: 'itemCount', width: 8 },
    { header: 'Tạm tính', key: 'subtotal', width: 13, style: { numFmt: MONEY } },
    { header: 'Phí ship', key: 'shippingFee', width: 11, style: { numFmt: MONEY } },
    { header: 'Giảm giá', key: 'discount', width: 11, style: { numFmt: MONEY } },
    { header: 'Tổng tiền', key: 'total', width: 14, style: { numFmt: MONEY } },
    { header: 'Ghi chú của khách', key: 'customerNote', width: 30 },
    { header: 'Ghi chú nội bộ', key: 'internalNote', width: 30 },
  ];
  styleHeader(orders);
  orders.getRow(1).commit();

  let count = 0;
  let cancelledCount = 0;
  const sums = { subtotal: 0, shippingFee: 0, discount: 0, total: 0 };
  for await (const rows of batches()) {
    for (const row of rows) {
      count += 1;
      if (row.status === 'cancelled') cancelledCount += 1;
      else for (const key of Object.keys(sums) as (keyof typeof sums)[]) sums[key] += row[key];
      orders
        .addRow({
          orderNumber: row.orderNumber,
          createdAt: vnTime(row.createdAt),
          customerName: row.customerName,
          // Giữ dạng chữ: nếu là số Excel sẽ bỏ số 0 ở đầu.
          customerPhone: row.customerPhone,
          customerEmail: row.customerEmail ?? '',
          shippingAddress: row.shippingAddress,
          status: ORDER_STATUS_LABELS[row.status],
          paymentStatus: PAYMENT_STATUS_LABELS[row.paymentStatus],
          itemCount: row.items.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: row.subtotal,
          shippingFee: row.shippingFee,
          discount: row.discount,
          total: row.total,
          customerNote: row.customerNote,
          internalNote: row.internalNote,
        })
        .commit();
    }
  }

  // Dòng tổng: công thức SUMIFS bỏ đơn "Đã huỷ" (vẫn đúng khi chủ cửa hàng sửa trong Excel), kèm kết quả tính sẵn.
  if (count > 0) {
    const last = count + 1;
    const cancelled = ORDER_STATUS_LABELS.cancelled;
    const sumOf = (column: string, key: keyof typeof sums) => ({
      formula: `SUMIFS(${column}2:${column}${last},G2:G${last},"<>${cancelled}")`,
      result: sums[key],
    });
    const totalRow = orders.addRow({
      orderNumber: 'TỔNG CỘNG',
      customerName: `${count - cancelledCount} đơn (không tính ${cancelledCount} đơn huỷ)`,
      subtotal: sumOf('J', 'subtotal'),
      shippingFee: sumOf('K', 'shippingFee'),
      discount: sumOf('L', 'discount'),
      total: sumOf('M', 'total'),
    });
    totalRow.font = { bold: true };
    totalRow.border = { top: { style: 'thin' } };
    totalRow.commit();
  }
  orders.commit();

  const items = book.addWorksheet('Chi tiết sản phẩm', SHEET_OPTIONS);
  items.columns = [
    { header: 'Mã đơn', key: 'orderNumber', width: 16 },
    { header: 'Ngày đặt', key: 'createdAt', width: 17, style: { numFmt: DATE_TIME } },
    { header: 'Trạng thái đơn', key: 'status', width: 15 },
    { header: 'Sản phẩm', key: 'productName', width: 34 },
    { header: 'Quy cách', key: 'packageSize', width: 12 },
    { header: 'Số lượng', key: 'quantity', width: 10 },
    { header: 'Đơn giá', key: 'unitPrice', width: 13, style: { numFmt: MONEY } },
    { header: 'Thành tiền', key: 'lineTotal', width: 14, style: { numFmt: MONEY } },
  ];
  styleHeader(items);
  items.getRow(1).commit();
  for await (const rows of batches()) {
    for (const row of rows) {
      for (const item of row.items) {
        items
          .addRow({
            orderNumber: row.orderNumber,
            createdAt: vnTime(row.createdAt),
            status: ORDER_STATUS_LABELS[row.status],
            productName: item.productName,
            packageSize: item.packageSize,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal,
          })
          .commit();
      }
    }
  }
  items.commit();

  await book.commit();
}
