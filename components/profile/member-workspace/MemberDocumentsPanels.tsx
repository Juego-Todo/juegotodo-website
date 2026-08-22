"use client";

import type { MemberDocumentRecord } from "@/lib/platform/documents-server";
import {
  MemberPanelShell,
  PanelEmptyState,
  PanelErrorState,
  PanelLoadingState,
  StatusBadge,
  SupabaseUnavailableNotice,
  documentStatusTone,
  formatPanelDate,
  usePlatformResource,
} from "@/components/profile/member-workspace/shared";

function MemberDocumentsPanel({
  documentType,
  title,
  description,
  emptyMessage,
}: {
  documentType: MemberDocumentRecord["documentType"];
  title: string;
  description: string;
  emptyMessage: string;
}) {
  const { data: documents, loading, error, unavailable } = usePlatformResource<MemberDocumentRecord[]>(
    "/api/member/documents",
    "documents",
    [],
  );

  const approved = documents.filter(
    (document) => document.documentType === documentType && document.status === "approved",
  );

  return (
    <MemberPanelShell description={description} title={title}>
      {unavailable ? <SupabaseUnavailableNotice /> : null}
      {loading ? <PanelLoadingState /> : null}
      {error ? <PanelErrorState message={error} /> : null}

      {!loading && !error && !unavailable && approved.length === 0 ? (
        <PanelEmptyState message={emptyMessage} />
      ) : null}

      {!loading && !error && approved.length > 0 ? (
        <ul className="space-y-3">
          {approved.map((document) => (
            <li className="rounded-[1.25rem] border border-white/10 bg-black/30 p-4 sm:p-5" key={document.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{document.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">Issued {formatPanelDate(document.createdAt)}</p>
                </div>
                <StatusBadge label={document.status} tone={documentStatusTone(document.status)} />
              </div>
              {document.expiresAt ? (
                <p className="mt-3 text-sm text-zinc-400">Expires {formatPanelDate(document.expiresAt)}</p>
              ) : null}
              {document.notes ? <p className="mt-2 text-sm text-zinc-400">{document.notes}</p> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </MemberPanelShell>
  );
}

export function MemberCertificatesPanel() {
  return (
    <MemberDocumentsPanel
      description="Official certificates, coaching credentials, and league recognitions appear here once issued and approved."
      documentType="certificate"
      emptyMessage="No approved certificates on file yet. Credentials will appear here after league review."
      title="Certificates"
    />
  );
}

export function MemberMedicalPanel() {
  return (
    <MemberDocumentsPanel
      description="Medical clearance, expiry dates, and upload status for competition eligibility."
      documentType="medical"
      emptyMessage="No approved medical clearance on file. Upload and approval are required before sanctioned competition."
      title="Medical Clearance"
    />
  );
}
