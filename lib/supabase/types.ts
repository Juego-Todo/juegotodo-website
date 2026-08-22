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

type GenericTable<T extends Record<string, unknown>> = {
  Row: T;
  Insert: Partial<T>;
  Update: Partial<T>;
  Relationships: [];
};

type InquiryRow = {
  id: string;
  inquiry_type: string;
  status: string;
  full_name: string;
  email: string;
  phone: string;
  organization: string;
  subject: string;
  message: string;
  metadata: Json;
  created_at: string;
  updated_at: string;
};

type CalendarEventRow = {
  id: string;
  slug: string;
  title: string;
  event_date: string;
  published: boolean;
  operational_status: string;
  payload: Json;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type AnnouncementRow = {
  id: string;
  title: string;
  body: string;
  audience: string;
  published: boolean;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type MemberDocumentRow = {
  id: string;
  user_id: string;
  document_type: string;
  title: string;
  status: string;
  storage_path: string;
  expires_at: string | null;
  notes: string;
  metadata: Json;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
};

type CompetitionEntryRow = {
  id: string;
  user_id: string;
  calendar_event_id: string | null;
  event_title: string;
  division: string;
  status: string;
  notes: string;
  metadata: Json;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
};

type OfficialAssignmentRow = {
  id: string;
  official_user_id: string;
  calendar_event_id: string | null;
  role: string;
  event_title: string;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

type CouncilRecordRow = {
  id: string;
  record_type: string;
  title: string;
  summary: string;
  status: string;
  metadata: Json;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type CoachRosterLinkRow = {
  id: string;
  coach_user_id: string;
  fighter_user_id: string | null;
  fighter_name: string;
  fighter_slug: string;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

type ShopCatalogProductRow = {
  slug: string;
  payload: Json;
  active: boolean;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

type ConsultationBookingRow = {
  id: string;
  user_id: string | null;
  service_slug: string;
  slot_start: string;
  slot_end: string;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes: string;
  payment_status: string;
  metadata: Json;
  created_at: string;
  updated_at: string;
};

type PromoCodeRow = {
  code: string;
  user_id: string | null;
  discount_percent: number;
  redeemed: boolean;
  redeemed_at: string | null;
  order_id: string | null;
  expires_at: string | null;
  created_at: string;
};

type FightRecordRow = {
  id: string;
  fighter_slug: string;
  fighter_user_id: string | null;
  opponent_name: string;
  event_title: string;
  event_date: string | null;
  result: string;
  method: string;
  round: string;
  metadata: Json;
  created_at: string;
  updated_at: string;
};

type EmailOutboxRow = {
  id: string;
  to_email: string;
  subject: string;
  body: string;
  template: string;
  status: string;
  error_message: string;
  metadata: Json;
  created_at: string;
  sent_at: string | null;
};

export type Database = {
  public: {
    Tables: {
      profiles: GenericTable<ProfileRow>;
      addresses: GenericTable<AddressRow>;
      wishlist_items: GenericTable<WishlistRow>;
      saved_fighters: GenericTable<SavedFighterRow>;
      saved_teams: GenericTable<SavedTeamRow>;
      saved_events: GenericTable<SavedEventRow>;
      notifications: GenericTable<NotificationRow>;
      orders: GenericTable<OrderRow>;
      license_applications: GenericTable<LicenseApplicationRow>;
      application_documents: GenericTable<ApplicationDocumentRow>;
      application_payments: GenericTable<ApplicationPaymentRow>;
      application_history: GenericTable<ApplicationHistoryRow>;
      inquiries: GenericTable<InquiryRow>;
      calendar_events: GenericTable<CalendarEventRow>;
      announcements: GenericTable<AnnouncementRow>;
      member_documents: GenericTable<MemberDocumentRow>;
      competition_entries: GenericTable<CompetitionEntryRow>;
      official_assignments: GenericTable<OfficialAssignmentRow>;
      council_records: GenericTable<CouncilRecordRow>;
      coach_roster_links: GenericTable<CoachRosterLinkRow>;
      shop_catalog_products: GenericTable<ShopCatalogProductRow>;
      consultation_bookings: GenericTable<ConsultationBookingRow>;
      promo_codes: GenericTable<PromoCodeRow>;
      fight_records: GenericTable<FightRecordRow>;
      email_outbox: GenericTable<EmailOutboxRow>;
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
