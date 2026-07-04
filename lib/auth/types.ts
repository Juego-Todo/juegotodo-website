export type AccountType = "fan" | "athlete" | "coach" | "gym_owner" | "partner";
export type UserRole = "user" | "admin";

export type StoredUser = {
  id: string;
  email: string;
  password: string;
  fullName: string;
  username: string;
  accountType: AccountType;
  role: UserRole;
  gym: string;
  city: string;
  bio: string;
  createdAt: string;
};

export type UserProfile = Omit<StoredUser, "password">;

export type RegisterInput = {
  fullName: string;
  username: string;
  email: string;
  password: string;
  accountType: AccountType;
  phone?: string;
  country?: string;
  city?: string;
  gym?: string;
  bio?: string;
};

export type ProfileUpdateInput = {
  fullName: string;
  accountType: AccountType;
  gym: string;
  city: string;
  bio: string;
};

export type AdminUserUpdateInput = {
  fullName: string;
  username: string;
  email: string;
  accountType: AccountType;
  role: UserRole;
  gym: string;
  city: string;
  bio: string;
  phone?: string;
  country?: string;
};

export const accountTypeLabels: Record<AccountType, string> = {
  fan: "Fan",
  athlete: "Athlete",
  coach: "Coach",
  gym_owner: "Gym Owner",
  partner: "Partner",
};

export function migrateAccountType(value: string): AccountType {
  switch (value) {
    case "fighter":
      return "athlete";
    case "gym":
      return "gym_owner";
    case "official":
      return "coach";
    case "media":
      return "partner";
    default:
      return value as AccountType;
  }
}
