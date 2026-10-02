import Image from "next/image";

export const PLACEHOLDER_IMAGE = "/images/placeholder.svg";

interface ProductImageProps {
  src: string | null | undefined;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}

/** Ảnh sản phẩm/danh mục/bài viết lấp đầy khung cha (cần `relative`); chưa có ảnh thì hiện hình thay thế. */
export function ProductImage({ src, alt, sizes, className = "object-cover", priority }: ProductImageProps) {
  if (!src) {
    return <Image src={PLACEHOLDER_IMAGE} alt="" fill unoptimized className="object-cover" />;
  }
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} />;
}
