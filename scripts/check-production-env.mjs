const sites = [
  "https://juegotodo-website.vercel.app",
  "https://juegotodo.com",
];

const expectedRef = "zqdromghvhjkxrhheaet";

for (const base of sites) {
  console.log(`\n=== ${base} ===`);
  try {
    const loginRes = await fetch(`${base}/login?mode=register`, { redirect: "follow" });
    console.log("login status", loginRes.status);

    const usernameRes = await fetch(`${base}/api/auth/check-username?username=coolhc`, {
      redirect: "follow",
    });
    console.log("check-username status", usernameRes.status);
    if (usernameRes.ok) {
      console.log("check-username body", await usernameRes.text());
    }

    const membersRes = await fetch(`${base}/api/admin/members`, { redirect: "follow" });
    console.log("admin/members status", membersRes.status);

    const html = await loginRes.text();
    const chunkUrls = [...html.matchAll(/\/_next\/static\/chunks\/[^"' ]+\.js/g)].map((m) => m[0]);
    let foundRef = html.includes(expectedRef);
    let checked = 0;

    for (const chunk of chunkUrls.slice(0, 25)) {
      checked += 1;
      const chunkRes = await fetch(`${base}${chunk}`);
      if (!chunkRes.ok) continue;
      const js = await chunkRes.text();
      if (js.includes(expectedRef)) {
        foundRef = true;
        console.log("supabase project ref found in chunk", chunk);
        break;
      }
      if (js.includes("NEXT_PUBLIC_SUPABASE_URL") || js.includes("supabase.co")) {
        console.log("supabase-related strings in chunk", chunk);
      }
    }

    console.log("chunks checked", checked);
    console.log("supabase configured in client bundle", foundRef ? "YES" : "NO/UNKNOWN");
  } catch (error) {
    console.log("error", error instanceof Error ? error.message : error);
  }
}
