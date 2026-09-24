import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  MembershipApplicationDraftInput,
  MembershipApplicationRecord,
  MembershipApplicationStatus,
  MembershipCourier,
  MembershipDocumentType,
  MembershipHistoryRecord,
  MembershipPaymentStatus,
} from "@/data/membership-applications";
import {
  buildMembershipPayload,
  mapMembershipApplication,
  mapMembershipDocument,
  mapMembershipHistory,
  mapMembershipPayment,
} from "@/lib/membership/validation";
import type { Database, Json } from "@/lib/supabase/types";

type AnyClient = SupabaseClient<Database>;

export async function writeApplicationHistory(
  client: AnyClient,
  input: {
    applicationId: string;
    action: string;
    actorId?: string | null;
    actorEmail?: string;
    notes?: string;
    metadata?: Record<string, unknown>;
  },
) {
  const { error } = await client.from("application_history").insert({
    application_id: input.applicationId,
    action: input.action,
    actor_id: input.actorId ?? null,
    actor_email: input.actorEmail ?? "",
    notes: input.notes ?? "",
    metadata: (input.metadata ?? {}) as Json,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function notifyUser(
  client: AnyClient,
  userId: string,
  title: string,
  body: string,
) {
  const { error } = await client.from("notifications").insert({
    user_id: userId,
    title,
    body,
    read: false,
  });

  if (error) {
    // Notifications should not block core workflow.
    console.error("notification insert failed", error.message);
  }
}

export async function fetchMembershipApplicationBundle(
  client: AnyClient,
  applicationId: string,
): Promise<MembershipApplicationRecord | null> {
  const { data, error } = await client
    .from("license_applications")
    .select("*")
    .eq("id", applicationId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    return null;
  }

  const [documentsResult, paymentsResult, historyResult] = await Promise.all([
    client.from("application_documents").select("*").eq("application_id", applicationId).order("created_at"),
    client.from("application_payments").select("*").eq("application_id", applicationId).order("submitted_at", { ascending: false }),
    client.from("application_history").select("*").eq("application_id", applicationId).order("created_at", { ascending: false }),
  ]);

  if (documentsResult.error) throw new Error(documentsResult.error.message);
  if (paymentsResult.error) throw new Error(paymentsResult.error.message);
  if (historyResult.error) throw new Error(historyResult.error.message);

  return mapMembershipApplication(data as never, {
    documents: (documentsResult.data ?? []).map((row) => mapMembershipDocument(row as never)),
    payments: (paymentsResult.data ?? []).map((row) => mapMembershipPayment(row as never)),
    history: (historyResult.data ?? []).map((row) => mapMembershipHistory(row as never)),
  });
}

export async function listMembershipApplications(
  client: AnyClient,
  options?: { userId?: string },
) {
  let query = client
    .from("license_applications")
    .select("*")
    .eq("application_program", "jt1_member")
    .order("updated_at", { ascending: false });
  if (options?.userId) {
    query = query.eq("user_id", options.userId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapMembershipApplication(row as never));
}

export async function createOrUpdateMembershipDraft(
  client: AnyClient,
  input: {
    userId: string;
    userEmail: string;
    draft: MembershipApplicationDraftInput;
    applicationId?: string;
  },
) {
  const payload = buildMembershipPayload(input.draft) as Json;
  const fullName = buildMembershipPayload(input.draft).fullName;

  if (input.applicationId) {
    const existing = await fetchMembershipApplicationBundle(client, input.applicationId);
    if (!existing || existing.userId !== input.userId) {
      throw new Error("Application not found.");
    }
    if (!["DRAFT", "ACTION_REQUIRED", "PAYMENT_PENDING"].includes(existing.applicationStatus)) {
      throw new Error("This application can no longer be edited.");
    }

    const { data, error } = await client
      .from("license_applications")
      .update({
        user_email: input.userEmail,
        full_name: fullName,
        place_of_birth: input.draft.placeOfBirth,
        facebook_url: input.draft.facebookUrl,
        martial_arts_system: input.draft.martialArtsSystem,
        fight_team: input.draft.fightTeam,
        delivery_recipient_name: input.draft.deliveryRecipientName,
        delivery_address: input.draft.deliveryAddress,
        delivery_zip: input.draft.deliveryZip,
        delivery_landmark: input.draft.deliveryLandmark,
        delivery_contact: input.draft.deliveryContact,
        amount_paid: input.draft.amountPaid,
        consent_confirmed: input.draft.consentConfirmed,
        payload,
      })
      .eq("id", input.applicationId)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return mapMembershipApplication(data as never);
  }

  if (input.draft.idempotencyKey) {
    const { data: existingByKey } = await client
      .from("license_applications")
      .select("*")
      .eq("user_id", input.userId)
      .eq("idempotency_key", input.draft.idempotencyKey)
      .maybeSingle();

    if (existingByKey) {
      return mapMembershipApplication(existingByKey as never);
    }
  }

  const { data: numberData, error: numberError } = await client.rpc("next_membership_application_number");
  if (numberError) {
    throw new Error(numberError.message);
  }

  const applicationNumber = typeof numberData === "string" ? numberData : `JT-${Date.now()}`;

  const { data, error } = await client
    .from("license_applications")
    .insert({
      user_id: input.userId,
      user_email: input.userEmail,
      application_program: "jt1_member",
      restriction_code: "JT1",
      full_name: fullName,
      id_number: applicationNumber,
      application_number: applicationNumber,
      application_status: "DRAFT",
      payment_status: "UNPAID",
      place_of_birth: input.draft.placeOfBirth,
      facebook_url: input.draft.facebookUrl,
      martial_arts_system: input.draft.martialArtsSystem,
      fight_team: input.draft.fightTeam,
      delivery_recipient_name: input.draft.deliveryRecipientName,
      delivery_address: input.draft.deliveryAddress,
      delivery_zip: input.draft.deliveryZip,
      delivery_landmark: input.draft.deliveryLandmark,
      delivery_contact: input.draft.deliveryContact,
      amount_paid: input.draft.amountPaid,
      consent_confirmed: input.draft.consentConfirmed,
      idempotency_key: input.draft.idempotencyKey ?? null,
      payload: payload as Json,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  await writeApplicationHistory(client, {
    applicationId: data.id,
    action: "application_draft_created",
    actorId: input.userId,
    actorEmail: input.userEmail,
    notes: "Membership application draft created.",
    metadata: { applicantVisible: true },
  });

  return mapMembershipApplication(data as never);
}

export async function submitMembershipApplication(
  client: AnyClient,
  input: {
    applicationId: string;
    userId: string;
    userEmail: string;
    draft: MembershipApplicationDraftInput;
    paymentScreenshotDocumentId?: string | null;
  },
) {
  const existing = await fetchMembershipApplicationBundle(client, input.applicationId);
  if (!existing || existing.userId !== input.userId) {
    throw new Error("Application not found.");
  }

  // Idempotent re-submit: already past draft/action-required means payment was recorded.
  if (!["DRAFT", "ACTION_REQUIRED"].includes(existing.applicationStatus)) {
    return existing;
  }

  const requiredTypes: MembershipDocumentType[] = ["VALID_ID", "PHOTO_1X1", "E_SIGNATURE"];
  const docs = existing.documents ?? [];
  for (const type of requiredTypes) {
    if (!docs.some((doc) => doc.documentType === type)) {
      throw new Error(`Missing required document: ${type}.`);
    }
  }

  if (!input.draft.paymentMethod) {
    throw new Error("Payment method is required.");
  }
  if (!(input.draft.amountPaid > 0)) {
    throw new Error("Amount paid is required.");
  }
  if (input.draft.paymentMethod !== "cash" && !input.draft.paymentReferenceNumber.trim()) {
    throw new Error("Payment reference number is required.");
  }
  if (!input.paymentScreenshotDocumentId && !docs.some((doc) => doc.documentType === "PAYMENT_SCREENSHOT")) {
    throw new Error("Payment screenshot is required.");
  }

  const draftPayload = buildMembershipPayload(input.draft);
  const payload = draftPayload as Json;
  const now = new Date().toISOString();

  const { data, error } = await client
    .from("license_applications")
    .update({
      full_name: draftPayload.fullName,
      place_of_birth: input.draft.placeOfBirth,
      facebook_url: input.draft.facebookUrl,
      martial_arts_system: input.draft.martialArtsSystem,
      fight_team: input.draft.fightTeam,
      delivery_recipient_name: input.draft.deliveryRecipientName,
      delivery_address: input.draft.deliveryAddress,
      delivery_zip: input.draft.deliveryZip,
      delivery_landmark: input.draft.deliveryLandmark,
      delivery_contact: input.draft.deliveryContact,
      amount_paid: input.draft.amountPaid,
      consent_confirmed: true,
      application_status: "PAYMENT_VERIFICATION",
      payment_status: "UNDER_VERIFICATION",
      submitted_at: existing.submittedAt && existing.applicationStatus !== "DRAFT" ? existing.submittedAt : now,
      payload,
      status: "pending",
    })
    .eq("id", input.applicationId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  const screenshotId =
    input.paymentScreenshotDocumentId ||
    docs.find((doc) => doc.documentType === "PAYMENT_SCREENSHOT")?.id ||
    null;

  const { error: paymentError } = await client.from("application_payments").insert({
    application_id: input.applicationId,
    payment_method: input.draft.paymentMethod,
    amount: input.draft.amountPaid,
    reference_number: input.draft.paymentReferenceNumber,
    screenshot_document_id: screenshotId,
    verification_status: "UNDER_VERIFICATION",
    submitted_at: now,
  });

  if (paymentError) throw new Error(paymentError.message);

  await writeApplicationHistory(client, {
    applicationId: input.applicationId,
    action: "application_submitted",
    actorId: input.userId,
    actorEmail: input.userEmail,
    notes: "Application submitted with payment proof for admin verification.",
    metadata: { applicantVisible: true },
  });

  await writeApplicationHistory(client, {
    applicationId: input.applicationId,
    action: "payment_submitted",
    actorId: input.userId,
    actorEmail: input.userEmail,
    notes: "Payment screenshot uploaded. Awaiting admin verification.",
    metadata: { applicantVisible: true },
  });

  await notifyUser(
    client,
    input.userId,
    "Application Received",
    `Your membership application ${data.application_number ?? existing.applicationNumber} was submitted. Payment status: Pending Verification.`,
  );

  return fetchMembershipApplicationBundle(client, input.applicationId);
}

export async function adminTransitionMembershipApplication(
  client: AnyClient,
  input: {
    applicationId: string;
    actorId: string;
    actorEmail: string;
    applicationStatus?: MembershipApplicationStatus;
    paymentStatus?: MembershipPaymentStatus;
    paymentId?: string;
    rejectionReason?: string;
    applicantVisibleNotes?: string;
    courier?: MembershipCourier;
    trackingNumber?: string;
    shippingDate?: string | null;
    deliveryDate?: string | null;
    action: string;
    notes?: string;
  },
) {
  const existing = await fetchMembershipApplicationBundle(client, input.applicationId);
  if (!existing) {
    throw new Error("Application not found.");
  }

  const now = new Date().toISOString();
  const updates: Database["public"]["Tables"]["license_applications"]["Update"] = {};

  if (input.applicationStatus) {
    updates.application_status = input.applicationStatus;
    if (input.applicationStatus === "APPROVED") updates.approved_at = now;
    if (input.applicationStatus === "REJECTED") updates.rejected_at = now;
    if (input.applicationStatus === "COMPLETED") updates.completed_at = now;
    if (input.applicationStatus === "SHIPPED" && input.shippingDate !== undefined) {
      updates.shipping_date = input.shippingDate;
    }
    if (input.applicationStatus === "DELIVERED" && input.deliveryDate !== undefined) {
      updates.delivery_date = input.deliveryDate ?? now;
    }
    updates.reviewed_at = now;
  }

  if (input.paymentStatus) {
    updates.payment_status = input.paymentStatus;
  }

  if (input.applicantVisibleNotes !== undefined) {
    updates.applicant_visible_notes = input.applicantVisibleNotes;
  }
  if (input.courier !== undefined) updates.courier = input.courier;
  if (input.trackingNumber !== undefined) updates.tracking_number = input.trackingNumber;
  if (input.shippingDate !== undefined) updates.shipping_date = input.shippingDate;
  if (input.deliveryDate !== undefined) updates.delivery_date = input.deliveryDate;

  if (Object.keys(updates).length > 0) {
    const { error } = await client
      .from("license_applications")
      .update(updates)
      .eq("id", input.applicationId);
    if (error) throw new Error(error.message);
  }

  if (input.paymentId && input.paymentStatus) {
    const paymentUpdates: Database["public"]["Tables"]["application_payments"]["Update"] = {
      verification_status: input.paymentStatus,
    };
    if (input.paymentStatus === "VERIFIED") {
      paymentUpdates.verified_by = input.actorId;
      paymentUpdates.verified_at = now;
      paymentUpdates.rejection_reason = "";
    }
    if (input.paymentStatus === "REJECTED") {
      paymentUpdates.verified_by = input.actorId;
      paymentUpdates.verified_at = now;
      paymentUpdates.rejection_reason = input.rejectionReason ?? "Payment rejected.";
    }

    const { error: paymentError } = await client
      .from("application_payments")
      .update(paymentUpdates)
      .eq("id", input.paymentId);
    if (paymentError) throw new Error(paymentError.message);
  }

  await writeApplicationHistory(client, {
    applicationId: input.applicationId,
    action: input.action,
    actorId: input.actorId,
    actorEmail: input.actorEmail,
    notes: input.notes ?? input.rejectionReason ?? "",
    metadata: {
      applicantVisible: true,
      applicationStatus: input.applicationStatus,
      paymentStatus: input.paymentStatus,
    },
  });

  const notificationMap: Record<string, { title: string; body: string }> = {
    payment_verified: {
      title: "Payment Verified",
      body: `Payment for application ${existing.applicationNumber} was verified.`,
    },
    payment_rejected: {
      title: "Payment Rejected",
      body: `Payment for application ${existing.applicationNumber} was rejected. ${input.rejectionReason ?? ""}`.trim(),
    },
    changes_requested: {
      title: "Additional Information Required",
      body: input.applicantVisibleNotes || `Please update your application ${existing.applicationNumber}.`,
    },
    application_approved: {
      title: "Application Approved",
      body: `Your application ${existing.applicationNumber} was approved.`,
    },
    application_rejected: {
      title: "Application Rejected",
      body: input.applicantVisibleNotes || `Your application ${existing.applicationNumber} was rejected.`,
    },
    id_processing: {
      title: "ID Processing",
      body: `Your membership ID for ${existing.applicationNumber} is being processed.`,
    },
    id_printing: {
      title: "ID Printing",
      body: `Your membership ID for ${existing.applicationNumber} is being printed.`,
    },
    ready_for_delivery: {
      title: "ID Ready for Delivery",
      body: `Your membership ID for ${existing.applicationNumber} is ready for delivery.`,
    },
    application_shipped: {
      title: "ID Shipped",
      body: `Your membership ID for ${existing.applicationNumber} was shipped${input.trackingNumber ? ` via ${input.courier || "courier"} (${input.trackingNumber})` : ""}.`,
    },
    application_delivered: {
      title: "ID Delivered",
      body: `Your membership ID for ${existing.applicationNumber} was marked delivered.`,
    },
    application_completed: {
      title: "Application Completed",
      body: `Your membership application ${existing.applicationNumber} is complete.`,
    },
  };

  const notice = notificationMap[input.action];
  if (notice) {
    await notifyUser(client, existing.userId, notice.title, notice.body);
  }

  if (input.applicationStatus === "APPROVED" || input.applicationStatus === "COMPLETED") {
    const { data: profile } = await client
      .from("profiles")
      .select("assigned_tags, membership_tier, account_type")
      .eq("id", existing.userId)
      .maybeSingle();

    const existingTags = Array.isArray(profile?.assigned_tags)
      ? (profile.assigned_tags as string[])
      : [];
    const nextTags = existingTags.includes("regular_member")
      ? existingTags
      : [...existingTags, "regular_member"];

    const profileUpdates: Database["public"]["Tables"]["profiles"]["Update"] = {
      assigned_tags: nextTags,
    };

    // Promote paid local members without overwriting elite/pro upgrades already set.
    if (!profile?.membership_tier || profile.membership_tier === "free") {
      profileUpdates.membership_tier = "pro";
    }

    const { error: profileError } = await client
      .from("profiles")
      .update(profileUpdates)
      .eq("id", existing.userId);

    if (profileError) {
      console.error("membership profile promotion failed", profileError.message);
    }
  }

  return fetchMembershipApplicationBundle(client, input.applicationId);
}

export function buildStoragePath(userId: string, applicationId: string, documentType: string, filename: string) {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  return `${userId}/${applicationId}/${documentType}-${Date.now()}-${safeName}`;
}

export async function registerUploadedDocument(
  client: AnyClient,
  input: {
    applicationId: string;
    userId: string;
    documentType: MembershipDocumentType;
    storagePath: string;
    originalFilename: string;
    mimeType: string;
    fileSize: number;
  },
) {
  // Replace previous document of same type for drafts / resubmissions.
  await client
    .from("application_documents")
    .delete()
    .eq("application_id", input.applicationId)
    .eq("document_type", input.documentType);

  const { data, error } = await client
    .from("application_documents")
    .insert({
      application_id: input.applicationId,
      document_type: input.documentType,
      storage_path: input.storagePath,
      original_filename: input.originalFilename,
      mime_type: input.mimeType,
      file_size: input.fileSize,
      uploaded_by: input.userId,
      verification_status: "PENDING",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  await writeApplicationHistory(client, {
    applicationId: input.applicationId,
    action: "document_uploaded",
    actorId: input.userId,
    notes: `${input.documentType} uploaded.`,
    metadata: { documentType: input.documentType, applicantVisible: true },
  });

  return mapMembershipDocument(data as never);
}

export function filterApplicantVisibleHistory(history: MembershipHistoryRecord[] = []) {
  return history.filter((entry) => entry.applicantVisible !== false);
}
