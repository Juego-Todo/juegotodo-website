import Image from "next/image";

type ProductImageProps = {
  alt: string;
  className?: string;
  priority?: boolean;
  src: string;
};

export function ProductImage({ alt, className = "", priority = false, src }: ProductImageProps) {
  return (
    <div className={`relative overflow-hidden bg-[#080808] ${className}`}>
      <Image
        alt={alt}
        className="h-full w-full object-contain p-3 sm:p-4"
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, 50vw"
        src={src}
      />
    </div>
  );
}
