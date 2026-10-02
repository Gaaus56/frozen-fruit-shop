import Link from "next/link";
import {
  INQUIRY_STATUS_LABELS,
  INQUIRY_TYPE_LABELS,
  type Inquiry,
  type InquiryStatus,
  type InquiryType,
  type Paginated,
} from "@frozen-fruit-shop/types";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/ui/delete-button";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { deleteInquiryAction, setInquiryStatusAction } from "./actions";

export const metadata = { title: "Liên hệ & báo giá" };

const STATUS_TONE = { new: "red", in_progress: "amber", done: "green" } as const;
const STATUSES = Object.keys(INQUIRY_STATUS_LABELS) as InquiryStatus[];
const TYPES = Object.keys(INQUIRY_TYPE_LABELS) as InquiryType[];

export default async function InquiriesPage({ searchParams }: PageProps<"/inquiries">) {
  const params = await searchParams;
  const status = STATUSES.find((item) => item === params.status);
  const type = TYPES.find((item) => item === params.type);
  const page = Math.max(1, Number(params.page) || 1);

  const search = new URLSearchParams({ page: String(page), pageSize: "20" });
  if (status) search.set("status", status);
  if (type) search.set("type", type);
  const data = await api<Paginated<Inquiry>>(`/admin/inquiries?${search.toString()}`);

  const filterHref = (next: { status?: string; type?: string }) => {
    const query = new URLSearchParams();
    const merged = { status, type, ...next };
    for (const [key, value] of Object.entries(merged)) if (value) query.set(key, value);
    const text = query.toString();
    return text ? `/inquiries?${text}` : "/inquiries";
  };
  const chip = (active: boolean) =>
    `px-3 py-1.5 text-sm font-bold ${active ? "bg-ink text-white" : "border border-divider bg-surface text-foreground/70 hover:border-foreground/40"}`;

  return (
    <div>
      <PageHeader title="Liên hệ & báo giá" description="Tin nhắn từ form Liên hệ và yêu cầu báo giá sỉ trên website." />

      <div className="mb-4 flex flex-wrap gap-2">
        <Link href={filterHref({ status: undefined })} className={chip(!status)}>Mọi trạng thái</Link>
        {STATUSES.map((value) => (
          <Link key={value} href={filterHref({ status: value })} className={chip(status === value)}>{INQUIRY_STATUS_LABELS[value]}</Link>
        ))}
        <span className="mx-2 w-px bg-divider" />
        <Link href={filterHref({ type: undefined })} className={chip(!type)}>Mọi loại</Link>
        {TYPES.map((value) => (
          <Link key={value} href={filterHref({ type: value })} className={chip(type === value)}>{INQUIRY_TYPE_LABELS[value]}</Link>
        ))}
      </div>

      {data.items.length === 0 ? (
        <p className="border border-divider bg-surface px-4 py-10 text-center text-sm text-foreground/55">Không có liên hệ nào.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {data.items.map((inquiry) => (
            <li key={inquiry.id} className={`border bg-surface p-5 ${inquiry.status === "new" ? "border-accent-300" : "border-divider"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="flex flex-wrap items-center gap-2">
                    <strong>{inquiry.name}</strong>
                    {inquiry.company ? <span className="text-foreground/60">· {inquiry.company}</span> : null}
                    <Badge tone={inquiry.type === "wholesale" ? "blue" : "neutral"}>{INQUIRY_TYPE_LABELS[inquiry.type]}</Badge>
                    <Badge tone={STATUS_TONE[inquiry.status]}>{INQUIRY_STATUS_LABELS[inquiry.status]}</Badge>
                  </p>
                  <p className="mt-1 text-sm">
                    {inquiry.phone ? <a href={`tel:${inquiry.phone}`} className="font-semibold text-accent-700 hover:underline">{inquiry.phone}</a> : null}
                    {inquiry.phone && inquiry.email ? " · " : null}
                    {inquiry.email ? <a href={`mailto:${inquiry.email}`} className="font-semibold text-accent-700 hover:underline">{inquiry.email}</a> : null}
                  </p>
                </div>
                <p className="text-xs text-foreground/50">{formatDateTime(inquiry.createdAt)}</p>
              </div>

              {inquiry.quantity ? <p className="mt-3 text-sm"><span className="text-foreground/55">Nhu cầu:</span> {inquiry.quantity}</p> : null}
              {inquiry.message ? <p className="mt-2 whitespace-pre-line bg-muted/60 p-3 text-sm">{inquiry.message}</p> : null}

              <div className="mt-4 flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  {STATUSES.filter((value) => value !== inquiry.status).map((value) => (
                    <form key={value} action={setInquiryStatusAction.bind(null, inquiry.id, value)}>
                      <button type="submit" className="border border-divider px-3 py-1.5 text-xs font-bold hover:border-accent-600 hover:text-accent-700">
                        Đánh dấu: {INQUIRY_STATUS_LABELS[value]}
                      </button>
                    </form>
                  ))}
                </div>
                <DeleteButton action={deleteInquiryAction.bind(null, inquiry.id)} itemLabel={`liên hệ của ${inquiry.name}`} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <Pagination page={data.page} pageSize={data.pageSize} total={data.total} basePath="/inquiries" params={{ status, type }} />
    </div>
  );
}
