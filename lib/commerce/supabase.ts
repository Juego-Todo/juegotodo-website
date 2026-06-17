import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { OrderRow, ProfileRow } from "@/lib/supabase/types";
import type {
  CommerceNotification,
  MembershipTier,
  Order,
  OrderItem,
  OrderPayment,
  OrderStatus,
  PaymentMethod,
  ShippingAddress,
  UserCommerceData,
} from "@/lib/commerce/types";
import type { AccountType, UserProfile } from "@/lib/auth/types";
import { calculateLineItems, generatePaymentReference } from "@/lib/commerce/pricing";
import type { CartItem } from "@/lib/commerce/types";

function mapAddress(row: {
  id: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}): ShippingAddress {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    line1: row.line1,
    line2: row.line2,
    city: row.city,
    province: row.province,
    postalCode: row.postal_code,
    country: row.country,
    isDefault: row.is_default,
  };
}

function mapOrder(row: OrderRow): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    userId: row.user_id,
    userEmail: row.user_email,
    userName: row.user_name,
    items: row.items as OrderItem[],
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    promoCode: row.promo_code ?? undefined,
    shipping: Number(row.shipping),
    tax: Number(row.tax),
    total: Number(row.total),
    status: row.status as OrderStatus,
    payment: row.payment as OrderPayment,
    shippingAddress: row.shipping_address as ShippingAddress,
    trackingNumber: row.tracking_number ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchUserCommerceData(userId: string): Promise<UserCommerceData> {
  const supabase = createSupabaseBrowserClient();

  const [
    profileResult,
    wishlistResult,
    fightersResult,
    teamsResult,
    eventsResult,
    addressesResult,
    notificationsResult,
  ] = await Promise.all([
    supabase.from("profiles").select("phone, country, membership_tier").eq("id", userId).single(),
    supabase.from("wishlist_items").select("product_slug").eq("user_id", userId),
    supabase.from("saved_fighters").select("fighter_slug").eq("user_id", userId),
    supabase.from("saved_teams").select("team_slug").eq("user_id", userId),
    supabase.from("saved_events").select("event_slug").eq("user_id", userId),
    supabase.from("addresses").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (profileResult.error) {
    throw new Error(profileResult.error.message);
  }

  return {
    wishlist: (wishlistResult.data ?? []).map((row) => row.product_slug),
    savedFighters: (fightersResult.data ?? []).map((row) => row.fighter_slug),
    savedTeams: (teamsResult.data ?? []).map((row) => row.team_slug),
    savedEvents: (eventsResult.data ?? []).map((row) => row.event_slug),
    addresses: (addressesResult.data ?? []).map(mapAddress),
    membershipTier: (profileResult.data.membership_tier as MembershipTier) ?? "free",
    phone: profileResult.data.phone ?? "",
    country: profileResult.data.country ?? "Philippines",
    notifications: (notificationsResult.data ?? []).map(
      (row): CommerceNotification => ({
        id: row.id,
        title: row.title,
        body: row.body,
        read: row.read,
        createdAt: row.created_at,
      }),
    ),
  };
}

export async function saveUserCommerceDataRemote(userId: string, data: UserCommerceData) {
  const supabase = createSupabaseBrowserClient();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      phone: data.phone,
      country: data.country,
      membership_tier: data.membershipTier,
    })
    .eq("id", userId);

  if (profileError) {
    throw new Error(profileError.message);
  }

  await Promise.all([
    supabase.from("wishlist_items").delete().eq("user_id", userId),
    supabase.from("saved_fighters").delete().eq("user_id", userId),
    supabase.from("saved_teams").delete().eq("user_id", userId),
    supabase.from("saved_events").delete().eq("user_id", userId),
    supabase.from("addresses").delete().eq("user_id", userId),
  ]);

  if (data.wishlist.length > 0) {
    const { error } = await supabase.from("wishlist_items").insert(
      data.wishlist.map((productSlug) => ({ user_id: userId, product_slug: productSlug })),
    );
    if (error) throw new Error(error.message);
  }

  if (data.savedFighters.length > 0) {
    const { error } = await supabase.from("saved_fighters").insert(
      data.savedFighters.map((fighterSlug) => ({ user_id: userId, fighter_slug: fighterSlug })),
    );
    if (error) throw new Error(error.message);
  }

  if (data.savedTeams.length > 0) {
    const { error } = await supabase.from("saved_teams").insert(
      data.savedTeams.map((teamSlug) => ({ user_id: userId, team_slug: teamSlug })),
    );
    if (error) throw new Error(error.message);
  }

  if (data.savedEvents.length > 0) {
    const { error } = await supabase.from("saved_events").insert(
      data.savedEvents.map((eventSlug) => ({ user_id: userId, event_slug: eventSlug })),
    );
    if (error) throw new Error(error.message);
  }

  if (data.addresses.length > 0) {
    const { error } = await supabase.from("addresses").insert(
      data.addresses.map((address) => ({
        id: address.id,
        user_id: userId,
        full_name: address.fullName,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        province: address.province,
        postal_code: address.postalCode,
        country: address.country,
        is_default: address.isDefault,
      })),
    );
    if (error) throw new Error(error.message);
  }
}

export async function upsertNotification(userId: string, notification: Omit<CommerceNotification, "id" | "createdAt" | "read">) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    title: notification.title,
    body: notification.body,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function markNotificationReadRemote(userId: string, notificationId: string) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("id", notificationId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function fetchUserOrders(userId: string): Promise<Order[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapOrder);
}

export async function fetchAllOrders(): Promise<Order[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapOrder);
}

export async function fetchOrderById(orderId: string): Promise<Order | undefined> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapOrder(data) : undefined;
}

export async function createSupabaseOrder(input: {
  userId: string;
  userEmail: string;
  userName: string;
  cart: CartItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  accountType: AccountType;
  membershipTier: MembershipTier;
  promoCode?: string;
}): Promise<Order> {
  const totals = calculateLineItems(input.cart, {
    accountType: input.accountType,
    membershipTier: input.membershipTier,
    promoCode: input.promoCode,
  });

  if (totals.items.length === 0) {
    throw new Error("Cart is empty.");
  }

  const now = new Date().toISOString();
  const orderNumber = `JT-ORD-${Date.now().toString(36).toUpperCase()}`;
  const payment: OrderPayment = {
    method: input.paymentMethod,
    status: "awaiting_verification",
    referenceNumber: generatePaymentReference(input.paymentMethod),
    amount: totals.total,
    createdAt: now,
  };

  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      user_id: input.userId,
      user_email: input.userEmail,
      user_name: input.userName,
      items: totals.items.map((item) => ({
        productSlug: item.productSlug,
        name: item.name,
        category: item.category,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        lineTotal: item.lineTotal,
      })),
      subtotal: totals.subtotal,
      discount: totals.promoDiscount,
      promo_code: totals.promoCode ?? null,
      shipping: totals.shipping,
      tax: totals.tax,
      total: totals.total,
      status: "pending",
      payment,
      shipping_address: input.shippingAddress,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await upsertNotification(input.userId, {
    title: "Order Placed",
    body: `Order ${payment.referenceNumber} is awaiting payment verification.`,
  });

  return mapOrder(data);
}

export async function approveSupabaseOrderPayment(orderId: string): Promise<Order> {
  const supabase = createSupabaseBrowserClient();
  const existing = await fetchOrderById(orderId);

  if (!existing) {
    throw new Error("Order not found.");
  }

  const now = new Date().toISOString();
  const payment: OrderPayment = {
    ...existing.payment,
    status: "approved",
    verifiedAt: now,
  };

  const { data, error } = await supabase
    .from("orders")
    .update({
      status: "payment_received",
      payment,
    })
    .eq("id", orderId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapOrder(data);
}

export async function updateSupabaseOrderStatus(
  orderId: string,
  status: OrderStatus,
  trackingNumber?: string,
): Promise<Order> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("orders")
    .update({
      status,
      tracking_number: trackingNumber ?? null,
    })
    .eq("id", orderId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapOrder(data);
}

export function isSupabaseAdmin(profile: Pick<ProfileRow, "role" | "email"> | Pick<UserProfile, "role" | "email">) {
  return profile.role === "admin" || profile.email.toLowerCase() === "admin@juegotodo.com";
}