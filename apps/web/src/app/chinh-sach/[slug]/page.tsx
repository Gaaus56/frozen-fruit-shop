import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { getPolicyBySlug, policies } from "@/data/policies";

interface PolicyPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return policies.map((policy) => ({ slug: policy.slug }));
}

export async function generateMetadata({ params }: PolicyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const policy = getPolicyBySlug(slug);
  if (!policy) return {};

  return { title: policy.title };
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { slug } = await params;
  const policy = getPolicyBySlug(slug);

  if (!policy) {
    notFound();
  }

  return (
    <Container className="py-12">
      <h1 className="text-2xl font-bold text-slate-900">{policy.title}</h1>
      <p className="mt-6 max-w-3xl text-slate-600">{policy.content}</p>
    </Container>
  );
}
