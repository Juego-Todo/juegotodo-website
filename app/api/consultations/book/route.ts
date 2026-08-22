import { NextResponse } from "next/server";
import { createConsultationBooking } from "@/lib/platform/consultations-server";
import { requireAuthenticatedUser } from "@/lib/platform/auth";

export async function POST(request: Request) {
  const auth = await requireAuthenticatedUser(request);
  const userId = "response" in auth ? null : auth.user.id;

  try {
    const body = (await request.json()) as {
      serviceSlug?: string;
      slotStart?: string;
      slotEnd?: string;
      customerName?: string;
      customerEmail?: string;
      customerPhone?: string;
      notes?: string;
    };

    if (!body.serviceSlug || !body.slotStart || !body.slotEnd || !body.customerName || !body.customerEmail) {
      return NextResponse.json({ error: "Service, slot, name, and email are required." }, { status: 400 });
    }

    const booking = await createConsultationBooking({
      userId,
      serviceSlug: body.serviceSlug,
      slotStart: body.slotStart,
      slotEnd: body.slotEnd,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      notes: body.notes,
    });

    return NextResponse.json({ booking });
  } catch (caught) {
    return NextResponse.json(
      { error: caught instanceof Error ? caught.message : "Unable to create booking." },
      { status: 500 },
    );
  }
}
