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
      {/* Khung trắng bo góc giống các khối ở trang chủ (SectionCard). */}
      <div className="mt-6 rounded-2xl border border-divider bg-card px-4 py-6 shadow-sm sm:px-10 sm:py-10">
        <RichContent html={policy.content} className="max-w-3xl" />
      </div>
    </Container>
  );
}
