import { PageHeader } from "@/components/ui/page-header";
import { getProductOptions } from "@/lib/product-options";
import { PolicyForm } from "../policy-form";
import { POLICY_TEMPLATES } from "../templates";

export const metadata = { title: "Thêm chính sách" };

export default async function NewPolicyPage({ searchParams }: PageProps<"/policies/new">) {
  const { template: key } = await searchParams;
  const template = POLICY_TEMPLATES.find((item) => item.key === key);

  return (
    <div>
      <PageHeader back={{ href: "/policies", label: "Chính sách" }} title="Thêm chính sách" />
      <PolicyForm template={template} products={await getProductOptions()} />
    </div>
  );
}
