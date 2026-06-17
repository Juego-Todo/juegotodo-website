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
import type { AccountType } from "@/lib/auth/types";

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

export function getUserCommerceData(userId: string): UserCommerceData {
  const data = readJson<UserCommerceData>(userDataKey(userId), defaultUserCommerceData());
  return { ...defaultUserCommerceData(), ...data, savedTeams: data.savedTeams ?? [] };
}

export function saveUserCommerceData(userId: string, data: UserCommerceData) {
  writeJson(userDataKey(userId), data);
}

export function getAllOrders(): Order[] {
  return readJson<Order[]>(ORDERS_KEY, []);
}

export function getUserOrders(userId: string): Order[] {
  return getAllOrders()
    .filter((order) => order.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getOrderById(orderId: string): Order | undefined {
  return getAllOrders().find((order) => order.id === orderId);
}

export function updateOrder(orderId: string, updater: (order: Order) => Order): Order {
  const orders = getAllOrders();
  const index = orders.findIndex((order) => order.id === orderId);

  if (index === -1) {
    throw new Error("Order not found.");
  }

  const updated = updater(orders[index]);
  orders[index] = updated;
  writeJson(ORDERS_KEY, orders);
  return updated;
}

export function createOrder(input: {
  userId: string;
  userEmail: string;
  userName: string;
  cart: CartItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  accountType: AccountType;
  membershipTier: MembershipTier;
  promoCode?: string;
}): Order {
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

  writeJson(ORDERS_KEY, [...getAllOrders(), order]);
  saveCart([]);
  clearCheckoutDraft();

  const userData = getUserCommerceData(input.userId);
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
  saveUserCommerceData(input.userId, userData);

  return order;
}

export function approveOrderPayment(orderId: string): Order {
  return updateOrder(orderId, (order) => {
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

export function updateOrderStatus(orderId: string, status: OrderStatus, trackingNumber?: string): Order {
  return updateOrder(orderId, (order) => ({
    ...order,
    status,
    trackingNumber: trackingNumber ?? order.trackingNumber,
    updatedAt: new Date().toISOString(),
  }));
}

export function addNotification(userId: string, notification: Omit<CommerceNotification, "id" | "createdAt" | "read">) {
  const data = getUserCommerceData(userId);
  data.notifications = [
    {
      id: crypto.randomUUID(),
      read: false,
      createdAt: new Date().toISOString(),
      ...notification,
    },
    ...data.notifications,
  ].slice(0, 20);
  saveUserCommerceData(userId, data);
}

export function isAdminUser(email: string, _accountType: AccountType): boolean {
  return email.toLowerCase() === "admin@juegotodo.com";
}
