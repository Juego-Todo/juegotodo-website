import { NextResponse } from "next/server";
import { requireMembershipAdmin } from "@/lib/membership/auth";
import { listMembershipApplications } from "@/lib/membership/service";

export async function GET(request: Request) {
  const auth = await requireMembershipAdmin(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const paymentStatus = url.searchParams.get("paymentStatus");
    const query = (url.searchParams.get("q") || "").trim().toLowerCase();

    let applications = await listMembershipApplications(auth.serviceClient);

    if (status) {
      applications = applications.filter((item) => item.applicationStatus === status);
    }
    if (paymentStatus) {
      applications = applications.filter((item) => item.paymentStatus === paymentStatus);
    }
    if (query) {
      applications = applications.filter((item) => {
        const haystack = [
          item.applicationNumber,
          item.fullName,
          item.userEmail,
          item.fightTeam,
          item.martialArtsSystem,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      });
    }

    const counts = {
      paymentVerification: applications.filter((item) => item.applicationStatus === "PAYMENT_VERIFICATION").length,
      documentReview: applications.filter((item) =>
        ["DOCUMENT_REVIEW", "SUBMITTED"].includes(item.applicationStatus),
      ).length,
      actionRequired: applications.filter((item) => item.applicationStatus === "ACTION_REQUIRED").length,
      idProcessing: applications.filter((item) =>
        ["APPROVED", "ID_PROCESSING", "ID_PRINTING", "READY_FOR_DELIVERY"].includes(item.applicationStatus),
      ).length,
      shipping: applications.filter((item) => item.applicationStatus === "SHIPPED").length,
    };

    return NextResponse.json({ applications, counts });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load applications." },
      { status: 500 },
    );
  }
}
