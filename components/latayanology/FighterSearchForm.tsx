import { FIGHT_CATEGORIES } from "@/components/latayanology/format";

const fieldClassName =
  "w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-[#FF1010]/30 placeholder:text-zinc-500 focus:ring-2";

export function FighterSearchForm({
  q,
  gym,
  division,
  category,
  fromProfile,
  gyms,
  divisions,
}: {
  q: string;
  gym: string;
  division: string;
  category: string;
  fromProfile: boolean;
  gyms: string[];
  divisions: string[];
}) {
  return (
    <form className="glass-panel grid gap-3 rounded-[1.5rem] p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-5" method="get">
      {fromProfile ? <input name="from" type="hidden" value="profile" /> : null}
      <label className="block lg:col-span-2">
        <span className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">Search</span>
        <input className={`${fieldClassName} mt-2`} defaultValue={q} name="q" placeholder="Name, nickname, or gym" />
      </label>
      <label className="block">
        <span className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">Gym</span>
        <select className={`${fieldClassName} mt-2`} defaultValue={gym} name="gym">
          <option value="">All gyms</option>
          {gyms.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">Division / weight</span>
        <select className={`${fieldClassName} mt-2`} defaultValue={division} name="division">
          <option value="">All divisions</option>
          {divisions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">Category</span>
        <select className={`${fieldClassName} mt-2`} defaultValue={category} name="category">
          <option value="">All categories</option>
          {FIGHT_CATEGORIES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5">
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#FF1010] px-5 text-[0.68rem] font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#ff2828]"
          type="submit"
        >
          Search records
        </button>
        <a
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 px-5 text-[0.68rem] font-black uppercase tracking-[0.16em] text-zinc-300 transition hover:text-white"
          href={fromProfile ? "/latayanology?from=profile" : "/latayanology"}
        >
          Reset
        </a>
      </div>
    </form>
  );
}
