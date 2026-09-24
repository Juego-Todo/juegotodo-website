/** JuegoTodo Pro — annual platform entitlement (separate from JT1 Local Membership). */

export const PRO_PLAN = "pro" as const;
export type ProPlan = typeof PRO_PLAN;

export const PRO_MEMBERSHIP_STATUSES = [
  "inactive",
  "active",
  "expired",
  "cancelled",
  "past_due",
  "pending",
] as const;
export type ProMembershipStatus = (typeof PRO_MEMBERSHIP_STATUSES)[number];

export const PRO_PAYMENT_STATUSES = [
  "unpaid",
  "pending",
  "paid",
  "failed",
  "refunded",
  "comped",
] as const;
export type ProPaymentStatus = (typeof PRO_PAYMENT_STATUSES)[number];

/** Annual Pro price in Philippine pesos. */
export const PRO_ANNUAL_PRICE_PHP = 2500;

/** Membership duration in months after activation. */
export const PRO_DURATION_MONTHS = 12;

/** Days before expiry to surface renewal reminders. */
export const PRO_REMINDER_DAYS = [30, 14, 7] as const;

export const PRO_CHECKOUT_TYPE = "juegotodo_pro" as const;

export const PRO_PRODUCT_NAME = "JuegoTodo Pro";
export const PRO_PRODUCT_DESCRIPTION =
  "Annual Pro membership unlocking the License Center and credential applications.";

export const PRO_BENEFITS = [
  {
    title: "License Center access",
    description: "Apply for fighter, coach, official, and council credentials.",
  },
  {
    title: "Credential applications",
    description: "Submit and track role license applications in one place.",
  },
  {
    title: "Member priority",
    description: "Stay ready for sanctioned events and official roles year-round.",
  },
] as const;

export const PRO_PAGE_PATH = "/pro";
export const PRO_REDIRECT_HINT = { redirectTo: PRO_PAGE_PATH } as const;
