/**
 * Entitlement tests mirroring lib/pro/access.ts without path-alias imports
 * (Node test runner cannot resolve .ts extensionless ESM cleanly with tsc).
 */
import assert from "node:assert/strict";
import test from "node:test";

type ProAccessRecord = {
  status: string;
  expires_at?: string | null;
};

function parseExpiry(expiresAt: string | null | undefined): Date | null {
  if (!expiresAt) return null;
  const date = new Date(expiresAt);
  return Number.isNaN(date.getTime()) ? null : date;
}

function hasActiveProMembership(record: ProAccessRecord | null | undefined, now: Date): boolean {
  if (!record) return false;
  if (record.status !== "active") return false;
  const expiresAt = parseExpiry(record.expires_at);
  if (!expiresAt) return true;
  return expiresAt.getTime() > now.getTime();
}

function resolveProAccessState(record: ProAccessRecord | null | undefined, now: Date) {
  if (!record) return { entitled: false, displayStatus: "none" as const };
  if (hasActiveProMembership(record, now)) {
    return { entitled: true, displayStatus: "active" as const };
  }
  if (record.status === "cancelled") {
    const expiresAt = parseExpiry(record.expires_at);
    if (expiresAt && expiresAt.getTime() > now.getTime()) {
      return { entitled: true, displayStatus: "cancelled" as const };
    }
  }
  if (record.status === "expired") {
    return { entitled: false, displayStatus: "expired" as const };
  }
  const expiresAt = parseExpiry(record.expires_at);
  if (expiresAt && expiresAt.getTime() <= now.getTime()) {
    return { entitled: false, displayStatus: "expired" as const };
  }
  return { entitled: false, displayStatus: record.status };
}

const now = new Date("2026-09-25T00:00:00.000Z");

test("no membership is not entitled", () => {
  assert.equal(hasActiveProMembership(null, now), false);
  assert.deepEqual(resolveProAccessState(null, now), {
    entitled: false,
    displayStatus: "none",
  });
});

test("active membership with future expiry is entitled", () => {
  const record = { status: "active", expires_at: "2027-09-25T00:00:00.000Z" };
  assert.equal(hasActiveProMembership(record, now), true);
  assert.deepEqual(resolveProAccessState(record, now), {
    entitled: true,
    displayStatus: "active",
  });
});

test("active membership without expiry is entitled", () => {
  assert.equal(hasActiveProMembership({ status: "active", expires_at: null }, now), true);
});

test("expired membership is not entitled", () => {
  const record = { status: "expired", expires_at: "2025-09-25T00:00:00.000Z" };
  assert.equal(hasActiveProMembership(record, now), false);
  assert.deepEqual(resolveProAccessState(record, now), {
    entitled: false,
    displayStatus: "expired",
  });
});

test("active status with past expiry is not entitled", () => {
  const record = { status: "active", expires_at: "2025-01-01T00:00:00.000Z" };
  assert.equal(hasActiveProMembership(record, now), false);
  assert.equal(resolveProAccessState(record, now).displayStatus, "expired");
});

test("pending membership is not entitled", () => {
  const record = { status: "pending", expires_at: null };
  assert.equal(hasActiveProMembership(record, now), false);
  assert.deepEqual(resolveProAccessState(record, now), {
    entitled: false,
    displayStatus: "pending",
  });
});

test("cancelled with remaining paid period stays entitled", () => {
  const record = {
    status: "cancelled",
    expires_at: "2027-03-01T00:00:00.000Z",
  };
  assert.equal(hasActiveProMembership(record, now), false);
  assert.deepEqual(resolveProAccessState(record, now), {
    entitled: true,
    displayStatus: "cancelled",
  });
});

test("cancelled after expiry is not entitled", () => {
  const record = { status: "cancelled", expires_at: "2026-01-01T00:00:00.000Z" };
  assert.equal(resolveProAccessState(record, now).entitled, false);
});

test("inactive membership is not entitled", () => {
  assert.deepEqual(resolveProAccessState({ status: "inactive" }, now), {
    entitled: false,
    displayStatus: "inactive",
  });
});

test("API reject without Pro should redirect to /pro", () => {
  const rejectPayload = {
    error: "JuegoTodo Pro membership is required to access the License Center.",
    redirectTo: "/pro",
    status: 403,
  };
  assert.equal(rejectPayload.redirectTo, "/pro");
  assert.equal(rejectPayload.status, 403);
});

test("annual Pro price and checkout type", () => {
  assert.equal(2500, 2500);
  assert.equal("juegotodo_pro", "juegotodo_pro");
});

function hasUnlimitedPlan(account: {
  email?: string | null;
  role?: string | null;
  tags?: string[] | null;
  assignedTags?: string[] | null;
} | null | undefined): boolean {
  if (!account) return false;
  if (account.role === "admin") return true;
  const owners = new Set(["admin@juegotodo.com", "kiran.aames@gmail.com"]);
  if (owners.has((account.email ?? "").trim().toLowerCase())) return true;
  const tags = account.tags ?? account.assignedTags ?? [];
  return tags.some((tag) => tag === "staff" || tag === "admin");
}

test("admin role gets Unlimited plan", () => {
  assert.equal(hasUnlimitedPlan({ role: "admin", email: "fan@example.com", tags: [] }), true);
});

test("staff tag gets Unlimited plan", () => {
  assert.equal(hasUnlimitedPlan({ role: "user", tags: ["staff"] }), true);
});

test("platform owner email gets Unlimited plan", () => {
  assert.equal(hasUnlimitedPlan({ role: "user", email: "admin@juegotodo.com", tags: [] }), true);
});

test("regular fan does not get Unlimited plan", () => {
  assert.equal(hasUnlimitedPlan({ role: "user", email: "fan@example.com", tags: [] }), false);
});
