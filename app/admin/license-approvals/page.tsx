import { redirect } from "next/navigation";

export default function LicenseApprovalsRoute() {
  redirect("/profile?tab=membership&view=approvals");
}
