import { ArrowRight, BadgeCheck, BookOpen, Globe2, RadioTower, Sparkles, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { mediaPartners } from "@/data/site";

const authorityStats = [
  { value: "1st", label: "Professional FMA hybrid sport platform" },
  { value: "18", label: "Regions in the JTGC map" },
  { value: "100+", label: "Styles represented across Latayanology" },
  { value: "500+", label: "Amateur athletes in the pipeline" },
] as const;

const ecosystemPillars = [
  {
    title: "Competition",
    body: "Fight cards, rankings, rules, divisions, and championship pathways built for spectators and athletes.",
    icon: Trophy,
  },
  {
    title: "Latayanology",
    body: "Verified athlete identity, team history, combat records, and Hall of Fame legacy in one living archive.",
    icon: BadgeCheck,
  },
  {
    title: "Education",
    body: "Rules clinics, seminars, coach pathways, and consultation tracks that onboard fighters with structure.",
    icon: BookOpen,
  },
  {
    title: "Commerce",
    body: "Official equipment, tickets, digital passes, and member-linked order history connected to profiles.",
    icon: RadioTower,
  },
] as const;

export function AuthorityProofSection() {
  return (
    <section className="relative overflow-hidden bg-[#f3eee7] py-14 text-[#101010] sm:py-20">
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_70%_20%,rgba(255,16,16,0.14),transparent_30rem)]" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.32em] text-[#990000]">Proof Before The Pitch</p>
          <h2 className="font-display mt-4 text-5xl uppercase leading-[0.9] sm:text-7xl">
            The League Has To Feel Larger Than A Website
          </h2>
        </div>

        <div className="space-y-8">
          <p className="max-w-2xl text-lg leading-8 text-zinc-700">
            Juego Todo is not just a fight calendar. It is a growing combat-sports ecosystem:
            athletes, rules, seminars, media, equipment, rankings, teams, and championship identity
            connected into one platform.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {authorityStats.map((stat) => (
              <div className="border-t border-black/15 py-5" key={stat.label}>
                <p className="font-display text-6xl uppercase leading-none text-[#990000]">{stat.value}</p>
                <p className="mt-2 text-sm font-bold uppercase tracking-[0.14em] text-zinc-700">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[2rem] border border-black/10 bg-white/55 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.08)] backdrop-blur">
            <p className="text-[0.62rem] font-black uppercase tracking-[0.28em] text-zinc-500">Broadcast And Media Signal</p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
              {mediaPartners.slice(0, 8).map((partner) => (
                <span className="font-display text-2xl uppercase tracking-[0.08em] text-zinc-900" key={partner}>
                  {partner}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SignatureArenaMoment() {
  return (
    <section className="relative isolate min-h-[92vh] overflow-hidden bg-black py-20 sm:py-28">
      <Image
        alt="Juego Todo arena atmosphere"
        className="absolute inset-0 -z-20 h-full w-full object-cover opacity-45"
        fill
        sizes="100vw"
        src="/hero-background.png"
      />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_45%,rgba(255,16,16,0.18),transparent_20rem),linear-gradient(180deg,rgba(0,0,0,0.65),#050505_86%)]" />
      <div className="cinematic-grid absolute inset-0 opacity-[0.08]" aria-hidden />

      <div className="absolute left-1/2 top-1/2 -z-10 h-[44rem] w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#FF1010]/20" aria-hidden />
      <div className="absolute left-1/2 top-1/2 -z-10 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" aria-hidden />
      <div className="absolute left-1/2 top-1/2 -z-10 h-[18rem] w-[18rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#FF1010]/30 shadow-[0_0_90px_rgba(255,16,16,0.25)]" aria-hidden />

      <div className="mx-auto flex min-h-[68vh] max-w-6xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
        <p className="text-xs font-black uppercase tracking-[0.34em] text-red-300">Signature System</p>
        <h2 className="font-display mt-5 max-w-5xl text-[clamp(4rem,13vw,10rem)] uppercase leading-[0.78] text-white">
          Three Rounds.
          <span className="block text-[#FF1010]">One World.</span>
        </h2>
        <p className="mt-8 max-w-2xl text-base leading-8 text-zinc-300 sm:text-xl sm:leading-9">
          Doble Baston, Solo Baston, then Mano Y Mano. A cinematic fight format that can only
          belong to Filipino Martial Arts.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {["Doble Baston", "Solo Baston", "Mano Y Mano"].map((round) => (
            <span className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white" key={round}>
              {round}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EcosystemUniverseSection() {
  return (
    <section className="relative overflow-hidden bg-[#050505] py-16 sm:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(255,16,16,0.14),transparent_34rem),radial-gradient(circle_at_100%_80%,rgba(255,255,255,0.08),transparent_30rem)]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="relative min-h-[34rem] overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0d0d0d] p-5 shadow-[0_35px_120px_rgba(0,0,0,0.55)]">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,16,16,0.22),transparent_30%),radial-gradient(circle_at_60%_20%,rgba(255,255,255,0.08),transparent_18rem)]" aria-hidden />
            <div className="cinematic-grid absolute inset-0 opacity-[0.1]" aria-hidden />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-white/10 bg-black/35 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-300">
                  JTGC Ecosystem
                </span>
                <Globe2 className="text-[#FF1010]" size={30} aria-hidden />
              </div>

              <div className="my-12 grid place-items-center">
                <div className="relative h-72 w-72 rounded-full border border-[#FF1010]/35 bg-black/30 shadow-[0_0_90px_rgba(255,16,16,0.2)]">
                  <div className="absolute inset-8 rounded-full border border-white/10" />
                  <div className="absolute inset-16 rounded-full border border-[#FF1010]/25" />
                  <div className="absolute left-1/2 top-1/2 grid h-28 w-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#FF1010] text-center font-display text-3xl uppercase leading-none text-white">
                    Juego
                    <br />
                    Todo
                  </div>
                  {["Events", "Teams", "Rules", "Shop", "Media", "Profiles"].map((label, index) => (
                    <span
                      className="absolute rounded-full border border-white/10 bg-black/70 px-3 py-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-200"
                      key={label}
                      style={{
                        left: `${50 + Math.cos((index / 6) * Math.PI * 2) * 39}%`,
                        top: `${50 + Math.sin((index / 6) * Math.PI * 2) * 39}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <p className="max-w-lg text-sm leading-7 text-zinc-400">
                Every product, event, athlete profile, seminar, and consultation should reinforce
                the same world: a formal professional home for weaponized Filipino combat sports.
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FF1010]">Beyond The Fight Card</p>
            <h2 className="font-display mt-4 text-5xl uppercase leading-[0.88] text-white sm:text-7xl">
              Show The Entire Universe Earlier
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-zinc-400 sm:text-lg">
              The homepage now needs to reveal the platform’s full scale before asking visitors to
              browse. This is the shift from “combat sports website” to “global JTGC operating system.”
            </p>

            <div className="mt-8 grid gap-4">
              {ecosystemPillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <article className="group grid gap-4 border-t border-white/10 py-5 sm:grid-cols-[3rem_1fr]" key={pillar.title}>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-[#FF1010] transition group-hover:bg-[#FF1010] group-hover:text-white">
                      <Icon size={22} aria-hidden />
                    </div>
                    <div>
                      <h3 className="font-display text-3xl uppercase text-white">{pillar.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-zinc-400">{pillar.body}</p>
                    </div>
                  </article>
                );
              })}
            </div>

            <Link
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#FF1010] px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-red-500"
              href="/latayanology"
            >
              Explore Latayanology
              <ArrowRight className="ml-2" size={16} aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LuxuryBookingCtaSection() {
  return (
    <section className="relative overflow-hidden bg-[#15110f] py-16 text-white sm:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,16,16,0.18),transparent_28rem),linear-gradient(135deg,#211816,#050505)]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-[2.5rem] border border-white/10 bg-black/25 p-6 shadow-[0_35px_120px_rgba(0,0,0,0.45)] backdrop-blur sm:p-8 lg:grid-cols-[1fr_0.75fr] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.28em] text-red-200">
              <Sparkles size={16} aria-hidden />
              Limited Advisory Slots
            </p>
            <h2 className="font-display mt-4 max-w-4xl text-5xl uppercase leading-[0.88] sm:text-7xl">
              Make Booking Feel Like A Private Fight Desk
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-300">
              Consultations should feel selective and intentional: choose the session, reserve a
              calendar spot, and submit payment in one polished flow.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">This Month</span>
              <span className="font-display text-4xl uppercase text-red-200">12 Slots</span>
            </div>
            <p className="mt-4 text-sm leading-7 text-zinc-400">
              Personal consultations, business Feng Shui, home audits, BaZi readings, and annual forecasts.
            </p>
            <Link
              className="mt-6 inline-flex w-full min-h-12 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:bg-red-100"
              href="/consultation/book"
            >
              Book Consultation
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
