import Image from "next/image";
import type { ReactNode } from "react";

export const EVENT_CARD_BACKGROUND = "/juego-todo-event-background.png";

type EventCardBackdropProps = {
  children: ReactNode;
  className?: string;
  imageClassName?: string;
  imageSrc?: string;
  sizes?: string;
};

export function EventCardBackdrop({
  children,
  className = "min-h-52",
  imageClassName = "object-cover object-center",
  imageSrc = EVENT_CARD_BACKGROUND,
  sizes = "(max-width: 768px) 100vw, 33vw",
}: EventCardBackdropProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        alt=""
        aria-hidden
        className={imageClassName}
        fill
        sizes={sizes}
        src={imageSrc}
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.25)_0%,rgba(0,0,0,0.55)_45%,rgba(0,0,0,0.88)_100%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(255,16,16,0.18),transparent_42%)]"
        aria-hidden
      />
      <div className="relative">{children}</div>
    </div>
  );
}
