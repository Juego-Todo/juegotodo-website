"use client";

import { ChevronRight, FileBadge2, Users } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AdminMemberDirectoryPanel } from "@/components/admin/AdminMemberDirectoryPanel";
import { BackButton } from "@/components/BackButton";
import { LicenseApprovalPanel } from "@/components/profile/LicenseApprovalPanel";

function MembershipBackLink() {
  return <BackButton href="/profile?tab=licenses" label="Back to Licenses" />;
}

function HubCard({
  description,
  href,
  icon: Icon,
  title,
}: {
  description: string;
  href: string;
  icon: typeof Users;
  title: string;
}) {
  return (
    <Link
      className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.02] p-6 transition hover:border-[#FF1010]/30 hover:bg-white/[0.04] sm:p-8"
      href={href}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,16,16,0.12),transparent_55%)] opacity-0 transition group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="space-y-4">
          <div className="inline-flex rounded-2xl border border-[#FF1010]/20 bg-[#FF1010]/10 p-3 text-[#FF1010]">
            <Icon size={22} aria-hidden />
          </div>
          <div>
            <h3 className="font-display text-3xl uppercase text-white sm:text-4xl">{title}</h3>
            <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-400">{description}</p>
          </div>
        </div>
        <ChevronRight
          className="mt-2 shrink-0 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-[#FF1010]"
          size={24}
          aria-hidden
        />
      </div>
    </Link>
  );
}

function AdminMembershipHub() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-3xl uppercase text-white sm:text-4xl">Licenses</h2>
        <p className="mt-2 max-w-3xl text-sm text-zinc-400">
          Choose a workspace to manage registered members or review license applications awaiting approval.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <HubCard
          description="Full directory of users who have signed up. Search profiles, review standing, manage account tags, and edit member records."
          href="/profile?tab=licenses&view=members"
          icon={Users}
          title="Members Directory"
        />
        <HubCard
          description="Review membership and license applications submitted through Register For License. Inspect submissions, attachments, and approval actions."
          href="/profile?tab=licenses&view=approvals"
          icon={FileBadge2}
          title="License Approvals"
        />
      </div>
    </div>
  );
}

export function AdminMembershipPanel() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");

  if (view === "members") {
    return (
      <div className="space-y-6">
        <MembershipBackLink />
        <AdminMemberDirectoryPanel />
      </div>
    );
  }

  if (view === "approvals") {
    return (
      <div className="space-y-6">
        <MembershipBackLink />
        <LicenseApprovalPanel />
      </div>
    );
  }

  return <AdminMembershipHub />;
}
