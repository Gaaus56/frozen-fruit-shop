import { notFound } from "next/navigation";
import type { Policy } from "@frozen-fruit-shop/types";
import { PageHeader } from "@/components/ui/page-header";
import { ApiError, api } from "@/lib/api";
import { getProductOptions } from "@/lib/product-options";
import { PolicyForm } from "../policy-form";

export const metadata = { title: "Sửa chính sách" };

export default async function EditPolicyPage({ params }: PageProps<"/policies/[id]">) {
  const { id } = await params;
  const policy = await api<Policy>(`/admin/policies/${id}`).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });

  return (
    <div>
      <PageHeader back={{ href: "/policies", label: "Chính sách" }} title={`Sửa: ${policy.title}`} />
      <PolicyForm policy={policy} products={await getProductOptions()} />
    </div>
  );
}
