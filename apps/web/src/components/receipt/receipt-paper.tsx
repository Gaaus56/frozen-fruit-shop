import type { ReceiptContent } from "@/lib/receipt-content";

/** Tờ bill giấy nhiệt: dải đỏ tên cửa hàng, thông tin đơn, bảng sản phẩm, tổng tiền, mép dưới răng cưa. */
export function ReceiptPaper({ content }: { content: ReceiptContent }) {
  return (
    <div className="receipt-paper font-mono text-[12px] leading-relaxed text-[#2b2827] sm:text-[13px]">
      <div className="receipt-band">
        <span className="receipt-band-tag">★ TRÁI CÂY ĐÔNG LẠNH ★</span>
      </div>

      <div className="px-5 pb-2 pt-4 text-center sm:px-7">
        <p className="text-[10px] tracking-[0.25em] text-[#6b6563]">· HOÁ ĐƠN BÁN HÀNG ·</p>
        <p className="mt-1 text-base font-bold uppercase leading-snug tracking-wide sm:text-lg">{content.storeName}</p>
        {content.storeLines.map((line) => (
          <p key={line} className="text-[11px] text-[#6b6563]">
            {line}
          </p>
        ))}
      </div>

      <div className="receipt-dots" aria-hidden />

      <dl className="space-y-1 px-5 py-3 sm:px-7">
        {content.info.map((row) => (
          <div key={row.label} className="flex justify-between gap-4">
            <dt className="shrink-0 uppercase text-[#6b6563]">{row.label}:</dt>
            <dd className="text-right font-bold [overflow-wrap:anywhere]">{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="receipt-dash" aria-hidden />

      <table className="w-full table-fixed">
        <thead>
          <tr className="text-[11px] uppercase text-[#6b6563]">
            <th className="w-14 py-1 pl-5 text-left font-bold sm:w-16 sm:pl-7">SL</th>
            <th className="py-1 text-left font-bold">Sản phẩm</th>
            <th className="w-28 py-1 pr-5 text-right font-bold sm:w-32 sm:pr-7">Tiền</th>
          </tr>
        </thead>
        <tbody>
          {content.items.map((item, index) => (
            <tr key={index} className="align-top">
              <td className="py-1 pl-5 sm:pl-7">{item.quantity}x</td>
              <td className="py-1 pr-2">
                <span className="block font-bold">{item.name}</span>
                <span className="block text-[11px] text-[#6b6563]">{item.detail}</span>
              </td>
              <td className="whitespace-nowrap py-1 pr-5 text-right sm:pr-7">{item.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="receipt-dash" aria-hidden />

      <dl className="space-y-1 px-5 py-3 sm:px-7">
        {content.totals.map((row) => (
          <div
            key={row.label}
            className={`flex justify-between gap-4 ${row.strong ? "mt-2 border-t border-dashed border-[#c9c4c2] pt-2 text-sm font-bold sm:text-base" : ""}`}
          >
            <dt className={row.strong ? "" : "text-[#6b6563]"}>{row.label}:</dt>
            <dd className={row.strong ? "text-[#ae1800]" : "font-bold"}>{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="px-5 pb-6 pt-2 text-center text-[11px] text-[#6b6563] sm:px-7">
        {content.footer.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}
