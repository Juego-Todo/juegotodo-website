import Image from "next/image";
import Link from "next/link";

export function BrandLogo({ variant = "default" }: { variant?: "default" | "footer" | "header" }) {
  const isFooter = variant === "footer";
  const isHeader = variant === "header";

  return (
    <Link
      aria-label="Juego Todo home"
      className="group flex items-center gap-4"
      href="/"
    >
      <span
        className={`relative grid place-items-center overflow-hidden rounded-[1.25rem] border border-[#FF1010]/35 bg-black shadow-[0_0_32px_rgba(255,16,16,0.35)] transition group-hover:border-[#FF1010]/70 ${
          isFooter
            ? "h-20 w-20 sm:h-24 sm:w-24"
            : isHeader
              ? "h-10 w-10 sm:h-11 sm:w-11"
              : "h-12 w-12 sm:h-16 sm:w-16"
        }`}
      >
        <Image
          alt="Juego Todo official logo"
          className="h-full w-full object-contain"
          height={96}
          priority={!isFooter}
          src="/juego-todo-logo.png"
          width={96}
        />
      </span>
      {isFooter ? (
        <span className="hidden sm:block">
          <span className="font-display block text-2xl uppercase leading-none tracking-wide text-white lg:text-3xl">
            Juego Todo
          </span>
          <span className="mt-1 block text-[0.62rem] font-black uppercase tracking-[0.28em] text-[#FF1010]">
            Combat Sports Platform
          </span>
        </span>
      ) : null}
    </Link>
  );
}
