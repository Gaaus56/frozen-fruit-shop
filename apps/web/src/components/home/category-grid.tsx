import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { categories } from "@frozen-fruit-shop/fixtures";

export function CategoryGrid() {
  return (
    <section className="py-12">
      <Container>
        <SectionHeading eyebrow="Danh mục" title="Chọn theo loại trái cây yêu thích" />

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/san-pham?danh-muc=${category.slug}`}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-center transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-900/5"
            >
              <div className="relative h-16 w-16 rounded-full bg-teal-50 p-3 transition-colors group-hover:bg-mango-50">
                <Image src={category.image} alt={category.name} fill className="object-contain p-3" />
              </div>
              <span className="text-sm font-semibold text-slate-800 group-hover:text-mango-600">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
