export type ShopCategory =
  | "official-gear"
  | "protective-equipment"
  | "competition-equipment"
  | "training-equipment"
  | "apparel"
  | "championship-collection"
  | "digital-products";

export type MembershipTier = "free" | "pro" | "elite";

export type OrderStatus =
  | "pending"
  | "payment_received"
  | "processing"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentMethod =
  | "gcash"
  | "maya"
  | "credit_card"
  | "bank_transfer"
  | "cash_pickup";

export type PaymentStatus = "pending" | "awaiting_verification" | "approved" | "rejected";

export type CartItem = {
  productSlug: string;
  quantity: number;
};

export type ShippingAddress = {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

export type UserCommerceData = {
  wishlist: string[];
  savedFighters: string[];
  savedTeams: string[];
  savedEvents: string[];
  addresses: ShippingAddress[];
  membershipTier: MembershipTier;
  phone: string;
  country: string;
  notifications: CommerceNotification[];
};

export type CommerceNotification = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export type OrderItem = {
  productSlug: string;
  name: string;
  category: ShopCategory;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type OrderPayment = {
  method: PaymentMethod;
  status: PaymentStatus;
  referenceNumber: string;
  amount: number;
  createdAt: string;
  verifiedAt?: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  promoCode?: string;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  payment: OrderPayment;
  shippingAddress: ShippingAddress;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
};

export type CheckoutDraft = {
  addressId?: string;
  paymentMethod?: PaymentMethod;
  promoCode?: string;
};

export const shopCategoryLabels: Record<ShopCategory, string> = {
  "official-gear": "Official Gear",
  "protective-equipment": "Protective Equipment",
  "competition-equipment": "Competition Equipment",
  "training-equipment": "Training Equipment",
  apparel: "Apparel",
  "championship-collection": "Championship Collection",
  "digital-products": "Digital Products",
};

export const shopNavCategories: { label: string; href: string; category?: ShopCategory }[] = [
  { label: "All Products", href: "/shop" },
  { label: "Official Gear", href: "/shop?category=official-gear", category: "official-gear" },
  { label: "Protective Equipment", href: "/shop?category=protective-equipment", category: "protective-equipment" },
  { label: "Competition Equipment", href: "/shop?category=competition-equipment", category: "competition-equipment" },
  { label: "Training Equipment", href: "/shop?category=training-equipment", category: "training-equipment" },
  { label: "Apparel", href: "/shop?category=apparel", category: "apparel" },
  { label: "Championship Collection", href: "/shop?category=championship-collection", category: "championship-collection" },
  { label: "Digital Products", href: "/shop?category=digital-products", category: "digital-products" },
];

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending: "Pending",
  awaiting_verification: "Awaiting Verification",
  approved: "Approved",
  rejected: "Rejected",
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  gcash: "GCash",
  maya: "Maya",
  credit_card: "Credit Card",
  bank_transfer: "Bank Transfer",
  cash_pickup: "Cash on Pickup",
};

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  payment_received: "Payment Received",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const membershipTierLabels: Record<MembershipTier, string> = {
  free: "Fan Member",
  pro: "Pro Member",
  elite: "Elite Member",
};
