import Image from "next/image";
import Link from "next/link";

export function BrandLogo() {
  return (
    <Link
      aria-label="Juego Todo home"
      className="group flex items-center"
      href="/"
    >
      <span className="relative grid h-12 w-12 place-items-center overflow-hidden rounded-2xl border border-red-500/35 bg-black shadow-[0_0_28px_rgba(229,9,20,0.32)] transition group-hover:border-red-400/70 sm:h-16 sm:w-16">
        <Image
          alt="Juego Todo official logo"
          className="h-full w-full object-contain"
          height={96}
          priority
          src="/juego-todo-logo.png"
          width={96}
        />
      </span>
    </Link>
  );
}
