export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type ProfileRow = {
  id: string;
  email: string;
  full_name: string;
  account_type: string;
  role: string;
  gym: string;
  city: string;
  bio: string;
  phone: string;
  country: string;
  membership_tier: string;
  created_at: string;
  updated_at: string;
};

type AddressRow = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
};

type WishlistRow = {
  id: string;
  user_id: string;
  product_slug: string;
  created_at: string;
};

type SavedFighterRow = {
  id: string;
  user_id: string;
  fighter_slug: string;
  created_at: string;
};

type SavedTeamRow = {
  id: string;
  user_id: string;
  team_slug: string;
  created_at: string;
};

type SavedEventRow = {
  id: string;
  user_id: string;
  event_slug: string;
  created_at: string;
};

type NotificationRow = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
};

type OrderRow = {
  id: string;
  order_number: string;
  user_id: string;
  user_email: string;
  user_name: string;
  items: Json;
  subtotal: number;
  discount: number;
  promo_code: string | null;
  shipping: number;
  tax: number;
  total: number;
  status: string;
  payment: Json;
  shipping_address: Json;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & Pick<ProfileRow, "id" | "email">;
        Update: Partial<Omit<ProfileRow, "id">>;
        Relationships: [];
      };
      addresses: {
        Row: AddressRow;
        Insert: Partial<AddressRow> & Pick<AddressRow, "user_id" | "full_name" | "line1" | "city">;
        Update: Partial<Omit<AddressRow, "id">>;
        Relationships: [];
      };
      wishlist_items: {
        Row: WishlistRow;
        Insert: Partial<WishlistRow> & Pick<WishlistRow, "user_id" | "product_slug">;
        Update: Partial<Omit<WishlistRow, "id">>;
        Relationships: [];
      };
      saved_fighters: {
        Row: SavedFighterRow;
        Insert: Partial<SavedFighterRow> & Pick<SavedFighterRow, "user_id" | "fighter_slug">;
        Update: Partial<Omit<SavedFighterRow, "id">>;
        Relationships: [];
      };
      saved_teams: {
        Row: SavedTeamRow;
        Insert: Partial<SavedTeamRow> & Pick<SavedTeamRow, "user_id" | "team_slug">;
        Update: Partial<Omit<SavedTeamRow, "id">>;
        Relationships: [];
      };
      saved_events: {
        Row: SavedEventRow;
        Insert: Partial<SavedEventRow> & Pick<SavedEventRow, "user_id" | "event_slug">;
        Update: Partial<Omit<SavedEventRow, "id">>;
        Relationships: [];
      };
      notifications: {
        Row: NotificationRow;
        Insert: Partial<NotificationRow> & Pick<NotificationRow, "user_id" | "title" | "body">;
        Update: Partial<Omit<NotificationRow, "id">>;
        Relationships: [];
      };
      orders: {
        Row: OrderRow;
        Insert: Partial<OrderRow> &
          Pick<OrderRow, "order_number" | "user_id" | "user_email" | "user_name" | "items" | "subtotal" | "total" | "status" | "payment" | "shipping_address">;
        Update: Partial<Omit<OrderRow, "id">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type { OrderRow, ProfileRow };
