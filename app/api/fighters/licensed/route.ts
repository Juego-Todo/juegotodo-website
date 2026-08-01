import { NextResponse } from "next/server";
import {
  fetchApprovedFighterLicensesServer,
  mapApprovedLicensesToFighters,
} from "@/lib/fighters/licensed";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      // Local auth mode: client hydrates approved fighters from browser storage.
      return NextResponse.json({ fighters: [] });
    }

    const applications = await fetchApprovedFighterLicensesServer();
    return NextResponse.json({
      fighters: mapApprovedLicensesToFighters(applications),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load licensed fighters." },
      { status: 500 },
    );
  }
}
