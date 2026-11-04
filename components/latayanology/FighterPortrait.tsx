export function FighterPortrait({
  name,
  photoUrl,
  size = "md",
}: {
  name: string;
  photoUrl: string;
  size?: "md" | "lg";
}) {
  const dimension = size === "lg" ? "h-28 w-28 sm:h-36 sm:w-36" : "h-16 w-16";
  const initials = name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (photoUrl) {
    return (
      // Spreadsheet photos can come from arbitrary hosts, so this stays a plain image.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt=""
        className={`${dimension} shrink-0 rounded-full border border-white/10 object-cover`}
        src={photoUrl}
      />
    );
  }

  return (
    <span
      className={`${dimension} grid shrink-0 place-items-center rounded-full border border-white/10 bg-[radial-gradient(circle_at_35%_18%,rgba(255,16,16,0.28),transparent_42%),linear-gradient(145deg,#27272a,#050505)] font-display text-xl uppercase text-white`}
    >
      {initials || "JT"}
    </span>
  );
}
