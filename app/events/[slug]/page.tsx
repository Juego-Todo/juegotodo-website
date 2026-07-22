import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SaveEntityButton } from "@/components/commerce/SaveEntityButton";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { CountdownTimer } from "@/components/CountdownTimer";
import { EventCardBackdrop } from "@/components/EventCardBackdrop";
import { PageNavigation } from "@/components/PageNavigation";
import { PrevNextNav } from "@/components/PrevNextNav";
import { events } from "@/data/site";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { getEventNeighbors } from "@/lib/navigation/prev-next";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = events.find((item) => item.slug === slug);

  if (!event) {
    return {};
  }

  return {
    title: event.title,
    description: `${event.mainEvent} at ${event.venue}.`,
  };
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const event = events.find((item) => item.slug === slug);

  if (!event) {
    notFound();
  }

  const eventTitle = event.title.replace("Juego Todo: ", "");
  const breadcrumbs = resolveBreadcrumbs(`/events/${slug}`, eventTitle);
  const neighbors = getEventNeighbors(slug);

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <main className="px-4 pb-0 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        <div className="mx-auto max-w-7xl pb-4">
          <PageNavigation currentLabel={eventTitle} />
        </div>
        <section className="mx-auto grid max-w-7xl gap-8 pb-8 lg:grid-cols-[1.05fr_0.95fr]">
          <EventCardBackdrop
            className="min-h-[26rem] rounded-[1.5rem] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.46)] sm:min-h-[38rem] sm:rounded-[2rem]"
            imageSrc={event.imageSrc}
            sizes="(max-width: 1024px) 100vw, 50vw"
          >
            <div className="p-5 sm:p-8">
              <span className="rounded-full border border-white/20 bg-black/35 px-4 py-2 text-xs font-black uppercase tracking-[0.26em] text-white">
                {event.status}
              </span>
              <div className="mt-44 sm:mt-72">
                <p className="text-sm font-black uppercase tracking-[0.32em] text-red-100">{event.city}</p>
                <h1 className="font-display mt-4 text-6xl uppercase leading-none text-white sm:text-8xl">
                  {event.title}
                </h1>
              </div>
            </div>
          </EventCardBackdrop>
          <div className="space-y-6">
            <div className="glass-panel rounded-[1.5rem] p-5 sm:rounded-[2rem] sm:p-8">
              <p className="text-sm font-black uppercase tracking-[0.32em] text-[#FF1010]">Main Event</p>
              <h2 className="font-display mt-4 text-4xl uppercase leading-none text-white sm:text-6xl">{event.mainEvent}</h2>
              <p className="mt-5 text-lg text-zinc-300">{event.venue}</p>
              {event.status === "Upcoming" ? (
                <div className="mt-8">
                  <CountdownTimer target={event.date} />
                </div>
              ) : null}
            </div>
            <div className="glass-panel rounded-[1.5rem] p-5 sm:rounded-[2rem] sm:p-8">
              <h2 className="font-display text-4xl uppercase text-white sm:text-5xl">Fight Card</h2>
              <ul className="mt-6 divide-y divide-white/10">
                {event.bouts.map((bout) => (
                  <li className="py-4 text-zinc-300" key={bout}>
                    {bout}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {event.ticketCheckoutUrl ? (
                  <a
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#FF1010] px-6 py-4 text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-[#ff2828]"
                    href={event.ticketCheckoutUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Buy Tickets
                  </a>
                ) : (
                  <Link
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#FF1010] px-6 py-4 text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-[#ff2828]"
                    href="/registration"
                  >
                    Register Interest
                  </Link>
                )}
                <SaveEntityButton slug={event.slug} type="event" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <PrevNextNav neighbors={neighbors} />
    </>
  );
}
