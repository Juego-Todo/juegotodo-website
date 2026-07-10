import { buildProfileUpsertFromAuthUser } from "@/lib/auth/profile-sync";
import type { createSupabaseServiceClient } from "@/lib/supabase/service";

type ServiceClient = NonNullable<ReturnType<typeof createSupabaseServiceClient>>;

export async function backfillMissingProfiles(serviceClient: ServiceClient) {
  const existingProfileIds = new Set<string>();
  const pageSize = 1000;
  let profileOffset = 0;

  while (true) {
    const { data, error } = await serviceClient
      .from("profiles")
      .select("id")
      .range(profileOffset, profileOffset + pageSize - 1);

    if (error) {
      throw new Error(error.message);
    }

    const rows = data ?? [];
    for (const row of rows) {
      existingProfileIds.add(row.id);
    }

    if (rows.length < pageSize) {
      break;
    }

    profileOffset += pageSize;
  }

  let page = 1;
  let backfilled = 0;

  while (true) {
    const { data, error } = await serviceClient.auth.admin.listUsers({
      page,
      perPage: pageSize,
    });

    if (error) {
      throw new Error(error.message);
    }

    const authUsers = data.users ?? [];
    const missingUsers = authUsers.filter((user) => !existingProfileIds.has(user.id));

    if (missingUsers.length > 0) {
      const { error: upsertError } = await serviceClient.from("profiles").upsert(
        missingUsers.map((user) => buildProfileUpsertFromAuthUser(user)),
        { onConflict: "id" },
      );

      if (upsertError) {
        throw new Error(upsertError.message);
      }

      for (const user of missingUsers) {
        existingProfileIds.add(user.id);
      }

      backfilled += missingUsers.length;
    }

    if (authUsers.length < pageSize) {
      break;
    }

    page += 1;
  }

  return backfilled;
}
