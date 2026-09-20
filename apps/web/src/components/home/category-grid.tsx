import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { categories } from "@frozen-fruit-shop/fixtures";

export function CategoryGrid() {
  return (
    <section className="py-16">
      <Container>
        <SectionHeading eyebrow="Danh mục" title="Chọn theo loại trái cây yêu thích" />

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/san-pham?danh-muc=${category.slug}`}
              className="group flex flex-col items-center gap-3 bg-surface p-5 text-center transition-colors hover:bg-accent-100"
            >
              <div className="relative h-14 w-14">
                <Image src={category.image} alt={category.name} fill className="grayscale-photo object-contain" />
              </div>
              <span className="text-sm font-bold text-foreground group-hover:text-accent-700">{category.name}</span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
