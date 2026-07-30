import Image from "next/image";
import type { ReactNode } from "react";

export const EVENT_CARD_BACKGROUND = "/juego-todo-event-background.png";

type EventCardBackdropProps = {
  children?: ReactNode;
  className?: string;
  imageClassName?: string;
  imageSrc?: string;
  sizes?: string;
  /**
   * When false (default), show the poster cleanly with no dark scrims or text overlays.
   * Pass true only for atmospheric backgrounds that need readable text on top.
   */
  dim?: boolean;
  alt?: string;
};

export function EventCardBackdrop({
  children,
  className = "min-h-52",
  imageClassName = "object-cover object-center",
  imageSrc = EVENT_CARD_BACKGROUND,
  sizes = "(max-width: 768px) 100vw, 33vw",
  dim = false,
  alt = "",
}: EventCardBackdropProps) {
  return (
    <div className={`relative overflow-hidden bg-black ${className}`}>
      <Image
        alt={alt}
        aria-hidden={!alt}
        className={imageClassName}
        fill
        sizes={sizes}
        src={imageSrc}
      />
      {dim ? (
        <>
          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.25)_0%,rgba(0,0,0,0.55)_45%,rgba(0,0,0,0.88)_100%)]"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(255,16,16,0.18),transparent_42%)]"
            aria-hidden
          />
        </>
      ) : null}
      {children ? <div className="relative">{children}</div> : null}
    </div>
  );
}
