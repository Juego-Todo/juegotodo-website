import { isPlatformOwnerEmail } from "@/lib/auth/platform-owners";

type AdminProfileLike = {
  role?: string | null;
  email?: string | null;
};

export function isServerAdminUser(
  authEmail: string | null | undefined,
  profile: AdminProfileLike | null | undefined,
) {
  const email = (authEmail ?? profile?.email ?? "").trim().toLowerCase();

  if (profile?.role === "admin") {
    return true;
  }

  return isPlatformOwnerEmail(email);
}
