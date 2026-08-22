import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/platform/auth";
import {
  createOfficialAssignment,
  listOfficialAssignments,
  updateOfficialAssignmentStatus,
} from "@/lib/platform/officials-server";

export async function GET(request: Request) {
  const auth = await requirePlatformAdmin(request);
  if ("response" in auth) return auth.response;

  const assignments = await listOfficialAssignments();
  return NextResponse.json({ assignments });
}

export async function POST(request: Request) {
  const auth = await requirePlatformAdmin(request);
  if ("response" in auth) return auth.response;

  try {
    const body = (await request.json()) as {
      officialUserId?: string;
      role?: string;
      eventTitle?: string;
      notes?: string;
    };

    if (!body.officialUserId || !body.role || !body.eventTitle?.trim()) {
      return NextResponse.json({ error: "Official, role, and event are required." }, { status: 400 });
    }

    const assignment = await createOfficialAssignment({
      officialUserId: body.officialUserId,
      role: body.role,
      eventTitle: body.eventTitle,
      notes: body.notes,
    });

    return NextResponse.json({ assignment });
  } catch (caught) {
    return NextResponse.json(
      { error: caught instanceof Error ? caught.message : "Unable to create assignment." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const auth = await requirePlatformAdmin(request);
  if ("response" in auth) return auth.response;

  try {
    const body = (await request.json()) as { id?: string; status?: string };
    if (!body.id || !body.status) {
      return NextResponse.json({ error: "Assignment id and status are required." }, { status: 400 });
    }

    await updateOfficialAssignmentStatus(body.id, body.status);
    return NextResponse.json({ ok: true });
  } catch (caught) {
    return NextResponse.json(
      { error: caught instanceof Error ? caught.message : "Unable to update assignment." },
      { status: 500 },
    );
  }
}
