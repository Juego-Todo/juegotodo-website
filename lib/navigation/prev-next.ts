import { teams } from "@/data/teams";
import { getAllFighterSlugs } from "@/lib/fighters/profile";
import { events, fighters } from "@/data/site";
import { rulebooks } from "@/data/rules";
import { scheduledSeminars } from "@/data/seminars";
import { shopProducts } from "@/data/shop";

export type NavNeighbor = {
  label: string;
  href: string;
  subtitle?: string;
  tone?: string;
  initials?: string;
};

export type NavNeighbors = {
  previous?: NavNeighbor;
  next?: NavNeighbor;
};

function initialsFromName(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function neighborsFromList<T>(
  items: T[],
  currentIndex: number,
  mapItem: (item: T) => NavNeighbor,
): NavNeighbors {
  return {
    previous: currentIndex > 0 ? mapItem(items[currentIndex - 1]) : undefined,
    next: currentIndex < items.length - 1 ? mapItem(items[currentIndex + 1]) : undefined,
  };
}

export function getTeamNeighbors(slug: string): NavNeighbors {
  const index = teams.findIndex((team) => team.slug === slug);
  if (index === -1) return {};

  return neighborsFromList(teams, index, (team) => ({
    label: team.name,
    href: `/teams/${team.slug}`,
    subtitle: team.region,
    tone: team.tone,
    initials: team.logoInitials,
  }));
}

export function getFighterNeighbors(slug: string): NavNeighbors {
  const slugs = getAllFighterSlugs();
  const index = slugs.indexOf(slug);
  if (index === -1) return {};

  return neighborsFromList(slugs, index, (fighterSlug) => {
    const fighter = fighters.find((entry) => entry.slug === fighterSlug);
    const label = fighter?.name ?? fighterSlug.replace(/-/g, " ");
    const subtitle = fighter ? `${fighter.rank} • ${fighter.division}` : "Fighter Profile";

    return {
      label,
      href: `/fighters/${fighterSlug}`,
      subtitle,
      tone: "from-red-800 via-zinc-950 to-black",
      initials: initialsFromName(label),
    };
  });
}

export function getEventNeighbors(slug: string): NavNeighbors {
  const index = events.findIndex((event) => event.slug === slug);
  if (index === -1) return {};

  return neighborsFromList(events, index, (event) => ({
    label: event.title.replace("Juego Todo: ", ""),
    href: `/events/${event.slug}`,
    subtitle: event.mainEvent,
    tone: event.posterTone,
    initials: event.title
      .replace("Juego Todo: ", "")
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  }));
}

export function getShopNeighbors(slug: string): NavNeighbors {
  const index = shopProducts.findIndex((product) => product.slug === slug);
  if (index === -1) return {};

  return neighborsFromList(shopProducts, index, (product) => ({
    label: product.name,
    href: `/shop/${product.slug}`,
    subtitle: product.category,
    tone: product.tone,
    initials: product.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  }));
}

export function getRulebookNeighbors(slug: string): NavNeighbors {
  const index = rulebooks.findIndex((rulebook) => rulebook.slug === slug);
  if (index === -1) return {};

  return neighborsFromList(rulebooks, index, (rulebook) => ({
    label: rulebook.division,
    href: `/rules-regulations/${rulebook.slug}`,
    subtitle: rulebook.ageRange,
    tone: rulebook.accent,
    initials: rulebook.division
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  }));
}

export function getSeminarNeighbors(slug: string): NavNeighbors {
  const index = scheduledSeminars.findIndex((seminar) => seminar.slug === slug);
  if (index === -1) return {};

  return neighborsFromList(scheduledSeminars, index, (seminar) => ({
    label: seminar.title,
    href: `/juego-todo-seminars/${seminar.slug}`,
    subtitle: seminar.city,
    tone: seminar.tone,
    initials: seminar.title
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  }));
}
