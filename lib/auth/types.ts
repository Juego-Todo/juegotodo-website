export type AccountType = "fan" | "fighter" | "gym" | "official" | "media";

export type StoredUser = {
  id: string;
  email: string;
  password: string;
  fullName: string;
  accountType: AccountType;
  gym: string;
  city: string;
  bio: string;
  createdAt: string;
};

export type UserProfile = Omit<StoredUser, "password">;

export type RegisterInput = {
  fullName: string;
  email: string;
  password: string;
  accountType: AccountType;
};

export type ProfileUpdateInput = {
  fullName: string;
  accountType: AccountType;
  gym: string;
  city: string;
  bio: string;
};

export const accountTypeLabels: Record<AccountType, string> = {
  fan: "Fan",
  fighter: "Fighter",
  gym: "Gym / Team",
  official: "Official",
  media: "Media",
};
