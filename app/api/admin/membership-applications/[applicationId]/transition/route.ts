import { NextResponse } from "next/server";
import {
  isMembershipApplicationStatus,
  isMembershipPaymentStatus,
  type MembershipCourier,
} from "@/data/membership-applications";
import { requireMembershipAdmin } from "@/lib/membership/auth";
import { adminTransitionMembershipApplication } from "@/lib/membership/service";

type RouteContext = { params: Promise<{ applicationId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireMembershipAdmin(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { applicationId } = await context.params;

  try {
    const body = (await request.json()) as {
      action?: string;
      applicationStatus?: string;
      paymentStatus?: string;
      paymentId?: string;
      rejectionReason?: string;
      applicantVisibleNotes?: string;
      courier?: MembershipCourier;
      trackingNumber?: string;
      shippingDate?: string | null;
      deliveryDate?: string | null;
      notes?: string;
      documentId?: string;
      documentVerificationStatus?: "PENDING" | "VERIFIED" | "REJECTED";
    };

    if (!body.action) {
      return NextResponse.json({ error: "Action is required." }, { status: 400 });
    }

    if (body.paymentStatus === "VERIFIED" && body.action !== "payment_verified") {
      return NextResponse.json({ error: "Payment verification requires the payment_verified action." }, { status: 400 });
    }

    if (body.documentId && body.documentVerificationStatus) {
      const { error: documentError } = await auth.serviceClient
        .from("application_documents")
        .update({
          verification_status: body.documentVerificationStatus,
          rejection_reason: body.rejectionReason ?? "",
        })
        .eq("id", body.documentId)
        .eq("application_id", applicationId);

      if (documentError) {
        return NextResponse.json({ error: documentError.message }, { status: 500 });
      }
    }

    const applicationStatus =
      body.applicationStatus && isMembershipApplicationStatus(body.applicationStatus)
        ? body.applicationStatus
        : undefined;
    const paymentStatus =
      body.paymentStatus && isMembershipPaymentStatus(body.paymentStatus) ? body.paymentStatus : undefined;

    const application = await adminTransitionMembershipApplication(auth.serviceClient, {
      applicationId,
      actorId: auth.user.id,
      actorEmail: auth.user.email ?? "",
      action: body.action,
      applicationStatus,
      paymentStatus,
      paymentId: body.paymentId,
      rejectionReason: body.rejectionReason,
      applicantVisibleNotes: body.applicantVisibleNotes,
      courier: body.courier,
      trackingNumber: body.trackingNumber,
      shippingDate: body.shippingDate,
      deliveryDate: body.deliveryDate,
      notes: body.notes,
    });

    return NextResponse.json({ application });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update application." },
      { status: 400 },
    );
  }
}
