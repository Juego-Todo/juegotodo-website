import type { StoredUser } from "@/lib/auth/types";

export const testLoginAccount = {
  email: "test@youremail.com",
  password: "1234567890",
  fullName: "Test",
} as const;

export const testLoginStoredUser: StoredUser = {
  id: "test-user-juego-todo",
  email: testLoginAccount.email,
  password: testLoginAccount.password,
  fullName: testLoginAccount.fullName,
  accountType: "fan",
  role: "user",
  gym: "",
  city: "",
  bio: "",
  createdAt: "2026-01-01T00:00:00.000Z",
};
