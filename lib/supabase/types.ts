export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type ProfileRow = {
  id: string;
  email: string;
  full_name: string;
  username: string;
  account_type: string;
  role: string;
  gender: string;
  date_of_birth: string;
  gym: string;
  city: string;
  bio: string;
  phone: string;
  country: string;
  membership_tier: string;
  assigned_tags: string[];
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

type LicenseApplicationRow = {
  id: string;
  user_id: string;
  user_email: string;
  status: string;
  application_program: string;
  restriction_code: string;
  full_name: string;
  id_number: string;
  submitted_at: string;
  reviewed_at: string | null;
  payload: Json;
  created_at: string;
  updated_at: string;
  application_number: string | null;
  application_status: string;
  payment_status: string;
  amount_due: number;
  amount_paid: number;
  place_of_birth: string;
  facebook_url: string;
  martial_arts_system: string;
  fight_team: string;
  delivery_recipient_name: string;
  delivery_address: string;
  delivery_zip: string;
  delivery_landmark: string;
  delivery_contact: string;
  courier: string;
  tracking_number: string;
  shipping_date: string | null;
  delivery_date: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  completed_at: string | null;
  applicant_visible_notes: string;
  idempotency_key: string | null;
  consent_confirmed: boolean;
};

type ApplicationDocumentRow = {
  id: string;
  application_id: string;
  document_type: string;
  storage_path: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  uploaded_by: string | null;
  verification_status: string;
  rejection_reason: string;
  created_at: string;
};

type ApplicationPaymentRow = {
  id: string;
  application_id: string;
  payment_method: string;
  amount: number;
  reference_number: string;
  screenshot_document_id: string | null;
  submitted_at: string;
  verification_status: string;
  verified_by: string | null;
  verified_at: string | null;
  rejection_reason: string;
};

type ApplicationHistoryRow = {
  id: string;
  application_id: string;
  action: string;
  actor_id: string | null;
  actor_email: string;
  notes: string;
  metadata: Json;
  created_at: string;
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
      license_applications: {
        Row: LicenseApplicationRow;
        Insert: Partial<LicenseApplicationRow> & Pick<LicenseApplicationRow, "user_id" | "payload">;
        Update: Partial<Omit<LicenseApplicationRow, "id">>;
        Relationships: [];
      };
      application_documents: {
        Row: ApplicationDocumentRow;
        Insert: Partial<ApplicationDocumentRow> &
          Pick<ApplicationDocumentRow, "application_id" | "document_type" | "storage_path">;
        Update: Partial<Omit<ApplicationDocumentRow, "id">>;
        Relationships: [];
      };
      application_payments: {
        Row: ApplicationPaymentRow;
        Insert: Partial<ApplicationPaymentRow> & Pick<ApplicationPaymentRow, "application_id">;
        Update: Partial<Omit<ApplicationPaymentRow, "id">>;
        Relationships: [];
      };
      application_history: {
        Row: ApplicationHistoryRow;
        Insert: Partial<ApplicationHistoryRow> & Pick<ApplicationHistoryRow, "application_id" | "action">;
        Update: Partial<Omit<ApplicationHistoryRow, "id">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_username_available: {
        Args: { check_username: string };
        Returns: boolean;
      };
      next_membership_application_number: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type {
  ApplicationDocumentRow,
  ApplicationHistoryRow,
  ApplicationPaymentRow,
  LicenseApplicationRow,
  OrderRow,
  ProfileRow,
};
