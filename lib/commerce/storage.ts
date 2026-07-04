import type {
  CartItem,
  CheckoutDraft,
  CommerceNotification,
  MembershipTier,
  Order,
  OrderStatus,
  PaymentMethod,
  ShippingAddress,
  UserCommerceData,
} from "@/lib/commerce/types";
import { generatePaymentReference } from "@/lib/commerce/pricing";
import { calculateLineItems } from "@/lib/commerce/pricing";
import type { AccountType, UserProfile } from "@/lib/auth/types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  approveSupabaseOrderPayment,
  createSupabaseOrder,
  fetchAllOrders,
  fetchOrderById,
  fetchUserCommerceData,
  fetchUserOrders,
  isSupabaseAdmin,
  markNotificationReadRemote,
  saveUserCommerceDataRemote,
  updateSupabaseOrderStatus,
  upsertNotification,
} from "@/lib/commerce/supabase";

const CART_KEY = "juego-todo.commerce.cart";
const ORDERS_KEY = "juego-todo.commerce.orders";
const CHECKOUT_KEY = "juego-todo.commerce.checkout";
const USER_DATA_PREFIX = "juego-todo.commerce.user.";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function userDataKey(userId: string) {
  return `${USER_DATA_PREFIX}${userId}`;
}

export function defaultUserCommerceData(): UserCommerceData {
  return {
    wishlist: [],
    savedFighters: [],
    savedTeams: [],
    savedEvents: [],
    addresses: [],
    membershipTier: "free",
    phone: "",
    country: "Philippines",
    notifications: [],
  };
}

export function initializeNewUserCommerceData(
  userId: string,
  input: Partial<Pick<UserCommerceData, "phone" | "country">> = {},
) {
  saveUserCommerceDataLocal(userId, {
    ...defaultUserCommerceData(),
    phone: input.phone?.trim() ?? "",
    country: input.country?.trim() || "Philippines",
  });
}

export function getCart(): CartItem[] {
  return readJson<CartItem[]>(CART_KEY, []);
}

export function saveCart(cart: CartItem[]) {
  writeJson(CART_KEY, cart);
}

export function getCheckoutDraft(): CheckoutDraft {
  return readJson<CheckoutDraft>(CHECKOUT_KEY, {});
}

export function saveCheckoutDraft(draft: CheckoutDraft) {
  writeJson(CHECKOUT_KEY, draft);
}

export function clearCheckoutDraft() {
  window.localStorage.removeItem(CHECKOUT_KEY);
}

function getUserCommerceDataLocal(userId: string): UserCommerceData {
  const data = readJson<UserCommerceData>(userDataKey(userId), defaultUserCommerceData());
  return { ...defaultUserCommerceData(), ...data, savedTeams: data.savedTeams ?? [] };
}

function saveUserCommerceDataLocal(userId: string, data: UserCommerceData) {
  writeJson(userDataKey(userId), data);
}

export function deleteUserCommerceDataLocal(userId: string) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(userDataKey(userId));
}

export async function deleteUserCommerceData(userId: string) {
  if (isSupabaseConfigured()) {
    deleteUserCommerceDataLocal(userId);
    return;
  }
  deleteUserCommerceDataLocal(userId);
}

export async function getUserCommerceData(userId: string): Promise<UserCommerceData> {
  if (isSupabaseConfigured()) {
    return fetchUserCommerceData(userId);
  }
  return getUserCommerceDataLocal(userId);
}

export async function saveUserCommerceData(userId: string, data: UserCommerceData) {
  if (isSupabaseConfigured()) {
    await saveUserCommerceDataRemote(userId, data);
    return;
  }
  saveUserCommerceDataLocal(userId, data);
}

function getAllOrdersLocal(): Order[] {
  return readJson<Order[]>(ORDERS_KEY, []);
}

export async function getAllOrders(): Promise<Order[]> {
  if (isSupabaseConfigured()) {
    return fetchAllOrders();
  }
  return getAllOrdersLocal();
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  if (isSupabaseConfigured()) {
    return fetchUserOrders(userId);
  }
  return getAllOrdersLocal()
    .filter((order) => order.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getOrderById(orderId: string): Promise<Order | undefined> {
  if (isSupabaseConfigured()) {
    return fetchOrderById(orderId);
  }
  return getAllOrdersLocal().find((order) => order.id === orderId);
}

function updateOrderLocal(orderId: string, updater: (order: Order) => Order): Order {
  const orders = getAllOrdersLocal();
  const index = orders.findIndex((order) => order.id === orderId);

  if (index === -1) {
    throw new Error("Order not found.");
  }

  const updated = updater(orders[index]);
  orders[index] = updated;
  writeJson(ORDERS_KEY, orders);
  return updated;
}

export async function createOrder(input: {
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
  if (isSupabaseConfigured()) {
    const order = await createSupabaseOrder(input);
    saveCart([]);
    clearCheckoutDraft();
    return order;
  }

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
  const order: Order = {
    id: crypto.randomUUID(),
    orderNumber,
    userId: input.userId,
    userEmail: input.userEmail,
    userName: input.userName,
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
    promoCode: totals.promoCode,
    shipping: totals.shipping,
    tax: totals.tax,
    total: totals.total,
    status: "pending",
    payment: {
      method: input.paymentMethod,
      status: "awaiting_verification",
      referenceNumber: generatePaymentReference(input.paymentMethod),
      amount: totals.total,
      createdAt: now,
    },
    shippingAddress: input.shippingAddress,
    createdAt: now,
    updatedAt: now,
  };

  writeJson(ORDERS_KEY, [...getAllOrdersLocal(), order]);
  saveCart([]);
  clearCheckoutDraft();

  const userData = getUserCommerceDataLocal(input.userId);
  userData.notifications = [
    {
      id: crypto.randomUUID(),
      title: "Order Placed",
      body: `Order ${order.payment.referenceNumber} is awaiting payment verification.`,
      read: false,
      createdAt: now,
    },
    ...userData.notifications,
  ].slice(0, 20);
  saveUserCommerceDataLocal(input.userId, userData);

  return order;
}

export async function approveOrderPayment(orderId: string): Promise<Order> {
  if (isSupabaseConfigured()) {
    return approveSupabaseOrderPayment(orderId);
  }

  return updateOrderLocal(orderId, (order) => {
    const now = new Date().toISOString();
    return {
      ...order,
      status: "payment_received",
      payment: {
        ...order.payment,
        status: "approved",
        verifiedAt: now,
      },
      updatedAt: now,
    };
  });
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  trackingNumber?: string,
): Promise<Order> {
  if (isSupabaseConfigured()) {
    return updateSupabaseOrderStatus(orderId, status, trackingNumber);
  }

  return updateOrderLocal(orderId, (order) => ({
    ...order,
    status,
    trackingNumber: trackingNumber ?? order.trackingNumber,
    updatedAt: new Date().toISOString(),
  }));
}

export async function addNotification(
  userId: string,
  notification: Omit<CommerceNotification, "id" | "createdAt" | "read">,
) {
  if (isSupabaseConfigured()) {
    await upsertNotification(userId, notification);
    return;
  }

  const data = getUserCommerceDataLocal(userId);
  data.notifications = [
    {
      id: crypto.randomUUID(),
      read: false,
      createdAt: new Date().toISOString(),
      ...notification,
    },
    ...data.notifications,
  ].slice(0, 20);
  saveUserCommerceDataLocal(userId, data);
}

export async function markNotificationRead(userId: string, notificationId: string) {
  if (isSupabaseConfigured()) {
    await markNotificationReadRemote(userId, notificationId);
    return;
  }

  const data = getUserCommerceDataLocal(userId);
  data.notifications = data.notifications.map((entry) =>
    entry.id === notificationId ? { ...entry, read: true } : entry,
  );
  saveUserCommerceDataLocal(userId, data);
}

export function isAdminUser(email: string, accountType: AccountType, role?: UserProfile["role"]) {
  if (role === "admin") {
    return true;
  }
  return email.toLowerCase() === "admin@juegotodo.com";
}

export function isAdminProfile(profile: Pick<UserProfile, "email" | "role">) {
  if (isSupabaseConfigured()) {
    return isSupabaseAdmin(profile);
  }
  return isAdminUser(profile.email, "fan", profile.role);
}
