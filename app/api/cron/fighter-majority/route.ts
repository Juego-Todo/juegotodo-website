import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type { Json } from "@/lib/supabase/types";

export const runtime = "nodejs";

function manilaToday(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function yearsBefore(isoDate: string, years: number) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const utc = new Date(Date.UTC(year - years, (month || 1) - 1, day || 1));
  return utc.toISOString().slice(0, 10);
}

function authorizeCron(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const authorization = request.headers.get("authorization") ?? "";
  const header = request.headers.get("x-cron-secret") ?? "";
  return authorization === `Bearer ${secret}` || header === secret;
}

async function runMajorityCheck() {
  const client = createSupabaseServiceClient();
  if (!client) {
    return NextResponse.json({ error: "Supabase service role is not configured." }, { status: 503 });
  }

  const today = manilaToday();
  const cutoff = yearsBefore(today, 18);
  const { data: fighters, error } = await client
    .from("fighters")
    .select("id, display_name, date_of_birth, user_id")
    .not("date_of_birth", "is", null)
    .lte("date_of_birth", cutoff);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const due = fighters ?? [];
  if (due.length === 0) {
    return NextResponse.json({ ok: true, processed: 0 });
  }

  const ids = due.map((fighter) => fighter.id);
  const { data: existingActions, error: actionError } = await client
    .from("fighter_guardian_actions")
    .select("fighter_id")
    .eq("action", "majority_reached")
    .in("fighter_id", ids);
  if (actionError) {
    return NextResponse.json({ error: actionError.message }, { status: 500 });
  }

  const alreadyLogged = new Set((existingActions ?? []).map((row) => row.fighter_id));
  const pending = due.filter((fighter) => !alreadyLogged.has(fighter.id));
  let notified = 0;

  for (const fighter of pending) {
    const { data: guardians } = await client
      .from("fighter_guardians")
      .select("id, guardian_user_id, status")
      .eq("fighter_id", fighter.id)
      .in("status", ["pending", "approved"]);

    const { error: logError } = await client.from("fighter_guardian_actions").insert({
      fighter_id: fighter.id,
      guardian_user_id: guardians?.[0]?.guardian_user_id ?? null,
      actor_user_id: null,
      action: "majority_reached",
      details: { majority_reached: true, asOf: today } as Json,
    });
    if (logError) {
      return NextResponse.json({ error: logError.message }, { status: 500 });
    }

    const recipients = new Set<string>();
    for (const guardian of guardians ?? []) {
      if (guardian.guardian_user_id) recipients.add(guardian.guardian_user_id);
    }
    if (fighter.user_id) recipients.add(fighter.user_id);

    if (recipients.size > 0) {
      const { error: notifyError } = await client.from("notifications").insert(
        [...recipients].map((userId) => ({
          user_id: userId,
          title: "Fighter reached age 18",
          body: `${fighter.display_name} has reached age 18. Guardian access stays in place until an admin reviews it.`,
          read: false,
        })),
      );
      if (notifyError) {
        return NextResponse.json({ error: notifyError.message }, { status: 500 });
      }
      notified += recipients.size;
    }
  }

  return NextResponse.json({ ok: true, processed: pending.length, notified });
}

export async function GET(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Cron authorization failed." }, { status: 401 });
  }
  return runMajorityCheck();
}

export async function POST(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Cron authorization failed." }, { status: 401 });
  }
  return runMajorityCheck();
}
