import type { Metadata } from "next";
import { UserProfilePage } from "@/components/UserProfilePage";

export const metadata: Metadata = {
  title: "Your Profile",
  description: "Manage your Juego Todo account profile, affiliation, and registration details.",
};

export default function ProfilePage() {
  return <UserProfilePage />;
}
