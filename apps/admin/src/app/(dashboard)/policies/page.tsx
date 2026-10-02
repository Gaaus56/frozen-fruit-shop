import Link from "next/link";
import type { Policy } from "@frozen-fruit-shop/types";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import { PageHeader } from "@/components/ui/page-header";
import { Table, Td, Th } from "@/components/ui/table";
import { api } from "@/lib/api";
import { deletePolicyAction } from "./actions";
import { POLICY_TEMPLATES } from "./templates";

export const metadata = { title: "Chính sách" };

export default async function PoliciesPage() {
  const policies = await api<Policy[]>("/admin/policies");
  const missingTemplates = POLICY_TEMPLATES.filter((template) => !policies.some((policy) => policy.slug === template.slug));

  return (
    <div>
      <PageHeader
        title="Chính sách"
        description="Các trang chính sách (đổi trả, giao hàng, bảo mật...) hiển thị ở chân trang web."
        action={<LinkButton href="/policies/new">+ Thêm chính sách</LinkButton>}
      />

      {missingTemplates.length > 0 ? (
        <div className="mb-4 flex flex-wrap items-center gap-3 border border-accent-200 bg-accent-50 px-4 py-3 text-sm">
          <span className="font-semibold text-accent-700">Có nội dung soạn sẵn từ tài liệu cửa hàng:</span>
          {missingTemplates.map((template) => (
            <LinkButton key={template.key} href={`/policies/new?template=${template.key}`} variant="secondary" size="sm">
              {template.title}
            </LinkButton>
          ))}
        </div>
      ) : null}

      <Table
        empty={policies.length === 0 && "Chưa có chính sách nào."}
        head={
          <>
            <Th>Chính sách</Th>
            <Th>Thứ tự</Th>
            <Th>Trạng thái</Th>
            <Th />
          </>
        }
      >
        {policies.map((policy) => (
          <tr key={policy.id}>
            <Td>
              <Link href={`/policies/${policy.id}`} className="font-bold hover:text-accent-700">{policy.title}</Link>
              <span className="block text-xs text-foreground/50">/policies/{policy.slug}</span>
            </Td>
            <Td>{policy.sortOrder}</Td>
            <Td>{policy.isActive ? <Badge tone="green">Đang hiển thị</Badge> : <Badge>Đang ẩn</Badge>}</Td>
            <Td>
              <div className="flex justify-end gap-2">
                <LinkButton href={`/policies/${policy.id}`} variant="secondary" size="sm">Sửa</LinkButton>
                <DeleteButton action={deletePolicyAction.bind(null, policy.id)} itemLabel={policy.title} />
              </div>
            </Td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
