import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fighters } from "@/data/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return fighters.map((fighter) => ({ slug: fighter.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const fighter = fighters.find((item) => item.slug === slug);

  if (!fighter) {
    return {};
  }

  return {
    title: `${fighter.name} "${fighter.nickname}"`,
    description: fighter.highlight,
  };
}

export default async function FighterPage({ params }: PageProps) {
  const { slug } = await params;
  const fighter = fighters.find((item) => item.slug === slug);

  if (!fighter) {
    notFound();
  }

  return (
    <main className="px-4 pb-14 pt-24 sm:px-6 sm:pb-20 sm:pt-32 lg:px-8">
      <section className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="glass-panel min-h-[24rem] rounded-[1.5rem] bg-[radial-gradient(circle_at_25%_10%,rgba(229,9,20,0.42),transparent_32%),linear-gradient(145deg,#151518,#050506)] p-5 sm:min-h-[34rem] sm:rounded-[2rem] sm:p-7">
          <span className="rounded-full bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-white">
            {fighter.rank} {fighter.division}
          </span>
          <div className="mt-36 sm:mt-56">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-red-200">{fighter.nickname}</p>
            <h1 className="font-display mt-3 text-6xl uppercase leading-none text-white sm:text-8xl">
              {fighter.name}
            </h1>
          </div>
        </div>
        <div>
          <p className="text-sm font-black uppercase tracking-[0.34em] text-red-300">Fighter Profile</p>
          <h2 className="font-display mt-4 text-5xl uppercase leading-none text-white sm:text-7xl">
            {fighter.style}
          </h2>
          <p className="mt-5 text-lg leading-8 text-zinc-300 sm:mt-6 sm:text-xl sm:leading-9">{fighter.highlight}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["Record", fighter.record],
              ["Gym", fighter.gym],
              ["Division", fighter.division],
            ].map(([label, value]) => (
              <div className="glass-panel rounded-3xl p-5" key={label}>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">{label}</p>
                <p className="mt-3 text-lg font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="min-h-12 rounded-full bg-red-600 px-6 py-4 text-center text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-red-500" href="/media">
              Watch Highlights
            </Link>
            <Link className="min-h-12 rounded-full border border-white/15 px-6 py-4 text-center text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-white/10" href="/rankings">
              View Rankings
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
