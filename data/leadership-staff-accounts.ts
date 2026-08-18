import type { UserTypeTagId } from "@/data/user-type-tags";
import type { AccountType, UserRole } from "@/lib/auth/types";

export type LeadershipStaffAccount = {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  username: string;
  role: UserRole;
  accountType: AccountType;
  assignedTags: UserTypeTagId[];
};

export const leadershipStaffAccounts: LeadershipStaffAccount[] = [
  {
    firstName: "Perla Mae",
    lastName: "Tagacay",
    email: "coo.juegotodocorp@gmail.com",
    dateOfBirth: "1989-08-28",
    username: "perlatagacay",
    role: "admin",
    accountType: "partner",
    assignedTags: ["admin", "staff"],
  },
  {
    firstName: "Viandra",
    lastName: "Benitez",
    email: "veaby.ugbjuegotodo@gmail.com",
    dateOfBirth: "2003-10-23",
    username: "viandrabenitez",
    role: "admin",
    accountType: "partner",
    assignedTags: ["admin", "staff"],
  },
  {
    firstName: "Andrew",
    lastName: "Mabutas",
    email: "tmbjoshua143@gmail.com",
    dateOfBirth: "1997-07-30",
    username: "andrewmabutas",
    role: "admin",
    accountType: "partner",
    assignedTags: ["admin", "staff"],
  },
  {
    firstName: "Ferdinand",
    middleName: "A.",
    lastName: "Munsayac",
    email: "ceo.juegotodoofficialph@gmail.com",
    dateOfBirth: "1964-11-27",
    username: "ferdinandmunsayac",
    role: "admin",
    accountType: "partner",
    assignedTags: ["admin", "staff", "grand_council_member"],
  },
];
