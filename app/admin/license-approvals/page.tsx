import { redirect } from "next/navigation";

export default function LicenseApprovalsRoute() {
  redirect("/profile?tab=licenses&view=approvals");
}
