import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { RichContent } from "@/components/ui/rich-content";
import { getPolicy } from "@/lib/api";

interface PolicyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PolicyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const policy = await getPolicy(slug);
  return { title: policy?.title ?? "Không tìm thấy trang" };
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { slug } = await params;
  const policy = await getPolicy(slug);
  if (!policy) notFound();

  return (
    <Container className="py-12">
      <h1 className="text-2xl uppercase text-foreground sm:text-3xl">{policy.title}</h1>
      <RichContent html={policy.content} className="mt-6 max-w-3xl" />
    </Container>
  );
}
