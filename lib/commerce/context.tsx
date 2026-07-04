"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/lib/auth/context";
import { calculateLineItems } from "@/lib/commerce/pricing";
import {
  approveOrderPayment,
  createOrder,
  defaultUserCommerceData,
  getCart,
  getCheckoutDraft,
  getUserCommerceData,
  getUserOrders,
  markNotificationRead as persistNotificationRead,
  saveCart,
  saveCheckoutDraft,
  saveUserCommerceData,
  updateOrderStatus,
} from "@/lib/commerce/storage";
import {
  cartItemKey,
  getCompareList,
  getRecentlyViewed,
  getSavedForLater,
  saveSavedForLater,
  toggleCompareSlug,
  trackRecentlyViewed,
} from "@/lib/commerce/cart-extras";
import type {
  CartItem,
  CheckoutDraft,
  MembershipTier,
  Order,
  OrderStatus,
  PaymentMethod,
  ShippingAddress,
  UserCommerceData,
} from "@/lib/commerce/types";

type AddToCartOptions = {
  openDrawer?: boolean;
  variantSelections?: Record<string, string>;
};

type CommerceContextValue = {
  cart: CartItem[];
  cartCount: number;
  totals: ReturnType<typeof calculateLineItems>;
  checkoutDraft: CheckoutDraft;
  userData: UserCommerceData;
  orders: Order[];
  cartDrawerOpen: boolean;
  lastAddedSlug: string | null;
  cartAddedSignal: number;
  lastAddedQuantity: number;
  pendingRemoval: CartItem | null;
  savedForLater: CartItem[];
  compareList: string[];
  recentlyViewed: string[];
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  addToCart: (productSlug: string, quantity?: number, options?: AddToCartOptions) => void;
  removeFromCart: (productSlug: string) => void;
  removeFromCartWithUndo: (productSlug: string) => void;
  undoRemove: () => void;
  dismissPendingRemoval: () => void;
  saveForLater: (productSlug: string) => void;
  moveSavedToCart: (productSlug: string) => void;
  removeSavedForLater: (productSlug: string) => void;
  toggleCompare: (productSlug: string) => void;
  trackProductView: (productSlug: string) => void;
  updateQuantity: (productSlug: string, quantity: number, maxStock?: number) => void;
  clearCart: () => void;
  setCheckoutDraft: (draft: CheckoutDraft) => void;
  toggleWishlist: (productSlug: string) => void;
  toggleSavedFighter: (fighterSlug: string) => void;
  toggleSavedTeam: (teamSlug: string) => void;
  toggleSavedEvent: (eventSlug: string) => void;
  updateUserCommerceProfile: (input: Partial<Pick<UserCommerceData, "phone" | "country" | "membershipTier">>) => void;
  saveAddress: (address: Omit<ShippingAddress, "id"> & { id?: string }) => ShippingAddress;
  deleteAddress: (addressId: string) => void;
  placeOrder: (paymentMethod: PaymentMethod, address: ShippingAddress, promoCode?: string) => Promise<Order>;
  markNotificationRead: (notificationId: string) => void;
  adminApprovePayment: (orderId: string) => Promise<Order>;
  adminUpdateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string) => Promise<Order>;
};

const CommerceContext = createContext<CommerceContextValue | null>(null);

export function CommerceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>(() => getCart());
  const [checkoutDraft, setCheckoutDraftState] = useState<CheckoutDraft>(() => getCheckoutDraft());
  const [userData, setUserData] = useState<UserCommerceData>(defaultUserCommerceData());
  const [orders, setOrders] = useState<Order[]>([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [lastAddedSlug, setLastAddedSlug] = useState<string | null>(null);
  const [cartAddedSignal, setCartAddedSignal] = useState(0);
  const [lastAddedQuantity, setLastAddedQuantity] = useState(1);
  const [pendingRemoval, setPendingRemoval] = useState<CartItem | null>(null);
  const [savedForLater, setSavedForLater] = useState<CartItem[]>(() => getSavedForLater());
  const [compareList, setCompareList] = useState<string[]>(() => getCompareList());
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => getRecentlyViewed());
  const [clearedUserId, setClearedUserId] = useState<string | null | undefined>(undefined);
  const skipInitialCartSave = useRef(true);
  const undoTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    skipInitialCartSave.current = false;
  }, []);

  useEffect(() => {
    if (skipInitialCartSave.current) {
      return;
    }
    saveCart(cart);
  }, [cart]);

  useEffect(() => {
    saveSavedForLater(savedForLater);
  }, [savedForLater]);

  useEffect(() => {
    return () => window.clearTimeout(undoTimerRef.current);
  }, []);

  if (!user) {
    if (clearedUserId !== null) {
      setClearedUserId(null);
      setUserData(defaultUserCommerceData());
      setOrders([]);
    }
  } else if (clearedUserId === null) {
    setClearedUserId(user.id);
  }

  useEffect(() => {
    if (!user) {
      return;
    }

    let active = true;

    Promise.all([getUserCommerceData(user.id), getUserOrders(user.id)]).then(([data, nextOrders]) => {
      if (active) {
        setUserData(data);
        setOrders(nextOrders);
      }
    });

    return () => {
      active = false;
    };
  }, [user]);

  const persistUserData = useCallback(
    async (next: UserCommerceData) => {
      if (!user) {
        return;
      }
      await saveUserCommerceData(user.id, next);
      setUserData(next);
    },
    [user],
  );

  const totals = useMemo(
    () =>
      calculateLineItems(cart, {
        accountType: user?.accountType,
        membershipTier: userData.membershipTier,
        promoCode: checkoutDraft.promoCode,
      }),
    [cart, user?.accountType, userData.membershipTier, checkoutDraft.promoCode],
  );

  const cartCount = totals.itemCount;

  const openCartDrawer = useCallback(() => setCartDrawerOpen(true), []);
  const closeCartDrawer = useCallback(() => setCartDrawerOpen(false), []);

  const addToCart = useCallback((productSlug: string, quantity = 1, options?: AddToCartOptions) => {
    setCart((current) => {
      const variantSelections = options?.variantSelections;
      const existing = current.find(
        (item) =>
          item.productSlug === productSlug &&
          JSON.stringify(item.variantSelections ?? {}) === JSON.stringify(variantSelections ?? {}),
      );
      if (existing) {
        return current.map((item) =>
          item.productSlug === productSlug &&
          JSON.stringify(item.variantSelections ?? {}) === JSON.stringify(variantSelections ?? {})
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...current, { productSlug, quantity, variantSelections }];
    });
    setLastAddedSlug(productSlug);
    setLastAddedQuantity(quantity);
    setCartAddedSignal((signal) => signal + 1);
    if (options?.openDrawer) {
      setCartDrawerOpen(true);
    }
  }, []);

  const dismissPendingRemoval = useCallback(() => {
    window.clearTimeout(undoTimerRef.current);
    setPendingRemoval(null);
  }, []);

  const undoRemove = useCallback(() => {
    setPendingRemoval((item) => {
      if (!item) {
        return null;
      }
      window.clearTimeout(undoTimerRef.current);
      setCart((current) => {
        if (current.some((entry) => cartItemKey(entry) === cartItemKey(item))) {
          return current;
        }
        return [...current, item];
      });
      return null;
    });
  }, []);

  const removeFromCartWithUndo = useCallback((productSlug: string) => {
    setCart((current) => {
      const item = current.find((entry) => entry.productSlug === productSlug);
      if (!item) {
        return current;
      }
      window.clearTimeout(undoTimerRef.current);
      setPendingRemoval(item);
      undoTimerRef.current = window.setTimeout(() => setPendingRemoval(null), 5000);
      return current.filter((entry) => entry.productSlug !== productSlug);
    });
  }, []);

  const saveForLater = useCallback((productSlug: string) => {
    setCart((current) => {
      const item = current.find((entry) => entry.productSlug === productSlug);
      if (!item) {
        return current;
      }
      setSavedForLater((saved) => {
        const key = cartItemKey(item);
        return [...saved.filter((entry) => cartItemKey(entry) !== key), item];
      });
      dismissPendingRemoval();
      return current.filter((entry) => entry.productSlug !== productSlug);
    });
  }, [dismissPendingRemoval]);

  const moveSavedToCart = useCallback((productSlug: string) => {
    setSavedForLater((saved) => {
      const item = saved.find((entry) => entry.productSlug === productSlug);
      if (!item) {
        return saved;
      }
      setCart((current) => {
        const key = cartItemKey(item);
        const existing = current.find((entry) => cartItemKey(entry) === key);
        if (existing) {
          return current.map((entry) =>
            cartItemKey(entry) === key ? { ...entry, quantity: entry.quantity + item.quantity } : entry,
          );
        }
        return [...current, item];
      });
      return saved.filter((entry) => entry.productSlug !== productSlug);
    });
  }, []);

  const removeSavedForLater = useCallback((productSlug: string) => {
    setSavedForLater((saved) => saved.filter((entry) => entry.productSlug !== productSlug));
  }, []);

  const toggleCompare = useCallback((productSlug: string) => {
    setCompareList(toggleCompareSlug(productSlug));
  }, []);

  const trackProductView = useCallback((productSlug: string) => {
    setRecentlyViewed(trackRecentlyViewed(productSlug));
  }, []);

  const removeFromCart = useCallback((productSlug: string) => {
    dismissPendingRemoval();
    setCart((current) => current.filter((item) => item.productSlug !== productSlug));
  }, [dismissPendingRemoval]);

  const updateQuantity = useCallback((productSlug: string, quantity: number, maxStock?: number) => {
    const capped =
      maxStock !== undefined ? Math.min(Math.max(quantity, 1), maxStock) : Math.max(quantity, 1);
    if (capped <= 0) {
      removeFromCartWithUndo(productSlug);
      return;
    }
    setCart((current) =>
      current.map((item) => (item.productSlug === productSlug ? { ...item, quantity: capped } : item)),
    );
  }, [removeFromCartWithUndo]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const setCheckoutDraft = useCallback((draft: CheckoutDraft) => {
    setCheckoutDraftState(draft);
    saveCheckoutDraft(draft);
  }, []);

  const toggleWishlist = useCallback(
    (productSlug: string) => {
      const next = { ...userData };
      next.wishlist = next.wishlist.includes(productSlug)
        ? next.wishlist.filter((slug) => slug !== productSlug)
        : [...next.wishlist, productSlug];
      void persistUserData(next);
    },
    [persistUserData, userData],
  );

  const toggleSavedFighter = useCallback(
    (fighterSlug: string) => {
      const next = { ...userData };
      next.savedFighters = next.savedFighters.includes(fighterSlug)
        ? next.savedFighters.filter((slug) => slug !== fighterSlug)
        : [...next.savedFighters, fighterSlug];
      void persistUserData(next);
    },
    [persistUserData, userData],
  );

  const toggleSavedTeam = useCallback(
    (teamSlug: string) => {
      const next = { ...userData };
      next.savedTeams = next.savedTeams.includes(teamSlug)
        ? next.savedTeams.filter((slug) => slug !== teamSlug)
        : [...next.savedTeams, teamSlug];
      void persistUserData(next);
    },
    [persistUserData, userData],
  );

  const toggleSavedEvent = useCallback(
    (eventSlug: string) => {
      const next = { ...userData };
      next.savedEvents = next.savedEvents.includes(eventSlug)
        ? next.savedEvents.filter((slug) => slug !== eventSlug)
        : [...next.savedEvents, eventSlug];
      void persistUserData(next);
    },
    [persistUserData, userData],
  );

  const updateUserCommerceProfile = useCallback(
    (input: Partial<Pick<UserCommerceData, "phone" | "country" | "membershipTier">>) => {
      void persistUserData({ ...userData, ...input });
    },
    [persistUserData, userData],
  );

  const saveAddress = useCallback(
    (address: Omit<ShippingAddress, "id"> & { id?: string }) => {
      const next = { ...userData };
      const id = address.id ?? crypto.randomUUID();
      const normalized: ShippingAddress = {
        id,
        fullName: address.fullName.trim(),
        phone: address.phone.trim(),
        line1: address.line1.trim(),
        line2: address.line2.trim(),
        city: address.city.trim(),
        province: address.province.trim(),
        postalCode: address.postalCode.trim(),
        country: address.country.trim() || "Philippines",
        isDefault: address.isDefault,
      };

      const existingIndex = next.addresses.findIndex((entry) => entry.id === id);
      if (existingIndex >= 0) {
        next.addresses[existingIndex] = normalized;
      } else {
        next.addresses = [...next.addresses, normalized];
      }

      if (normalized.isDefault) {
        next.addresses = next.addresses.map((entry) => ({
          ...entry,
          isDefault: entry.id === normalized.id,
        }));
      }

      void persistUserData(next);
      return normalized;
    },
    [persistUserData, userData],
  );

  const deleteAddress = useCallback(
    (addressId: string) => {
      void persistUserData({
        ...userData,
        addresses: userData.addresses.filter((entry) => entry.id !== addressId),
      });
    },
    [persistUserData, userData],
  );

  const placeOrder = useCallback(
    async (paymentMethod: PaymentMethod, address: ShippingAddress, promoCode?: string) => {
      if (!user) {
        throw new Error("You must be signed in to place an order.");
      }

      const order = await createOrder({
        userId: user.id,
        userEmail: user.email,
        userName: user.fullName,
        cart,
        shippingAddress: address,
        paymentMethod,
        accountType: user.accountType,
        membershipTier: userData.membershipTier,
        promoCode: promoCode ?? checkoutDraft.promoCode,
      });

      setCart([]);
      setCheckoutDraftState({});
      const [nextUserData, nextOrders] = await Promise.all([
        getUserCommerceData(user.id),
        getUserOrders(user.id),
      ]);
      setUserData(nextUserData);
      setOrders(nextOrders);
      return order;
    },
    [cart, checkoutDraft.promoCode, user, userData.membershipTier],
  );

  const markNotificationRead = useCallback(
    (notificationId: string) => {
      if (!user) {
        return;
      }

      void persistNotificationRead(user.id, notificationId).then(() => {
        setUserData((current) => ({
          ...current,
          notifications: current.notifications.map((entry) =>
            entry.id === notificationId ? { ...entry, read: true } : entry,
          ),
        }));
      });
    },
    [user],
  );

  const adminApprovePayment = useCallback(
    async (orderId: string) => {
      const order = await approveOrderPayment(orderId);
      if (user) {
        setOrders(await getUserOrders(user.id));
      }
      return order;
    },
    [user],
  );

  const adminUpdateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus, trackingNumber?: string) => {
      const order = await updateOrderStatus(orderId, status, trackingNumber);
      if (user) {
        setOrders(await getUserOrders(user.id));
      }
      return order;
    },
    [user],
  );

  const value = useMemo(
    () => ({
      cart,
      cartCount,
      totals,
      checkoutDraft,
      userData,
      orders,
      cartDrawerOpen,
      lastAddedSlug,
      cartAddedSignal,
      lastAddedQuantity,
      pendingRemoval,
      savedForLater,
      compareList,
      recentlyViewed,
      openCartDrawer,
      closeCartDrawer,
      addToCart,
      removeFromCart,
      removeFromCartWithUndo,
      undoRemove,
      dismissPendingRemoval,
      saveForLater,
      moveSavedToCart,
      removeSavedForLater,
      toggleCompare,
      trackProductView,
      updateQuantity,
      clearCart,
      setCheckoutDraft,
      toggleWishlist,
      toggleSavedFighter,
      toggleSavedTeam,
      toggleSavedEvent,
      updateUserCommerceProfile,
      saveAddress,
      deleteAddress,
      placeOrder,
      markNotificationRead,
      adminApprovePayment,
      adminUpdateOrderStatus,
    }),
    [
      cart,
      cartCount,
      totals,
      checkoutDraft,
      userData,
      orders,
      cartDrawerOpen,
      lastAddedSlug,
      cartAddedSignal,
      lastAddedQuantity,
      pendingRemoval,
      savedForLater,
      compareList,
      recentlyViewed,
      openCartDrawer,
      closeCartDrawer,
      addToCart,
      removeFromCart,
      removeFromCartWithUndo,
      undoRemove,
      dismissPendingRemoval,
      saveForLater,
      moveSavedToCart,
      removeSavedForLater,
      toggleCompare,
      trackProductView,
      updateQuantity,
      clearCart,
      setCheckoutDraft,
      toggleWishlist,
      toggleSavedFighter,
      toggleSavedTeam,
      toggleSavedEvent,
      updateUserCommerceProfile,
      saveAddress,
      deleteAddress,
      placeOrder,
      markNotificationRead,
      adminApprovePayment,
      adminUpdateOrderStatus,
    ],
  );

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export function useCommerce() {
  const context = useContext(CommerceContext);
  if (!context) {
    throw new Error("useCommerce must be used within CommerceProvider.");
  }
  return context;
}

export function useRequireAuthRedirect(nextPath: string) {
  const { user, loading } = useAuth();

  return { user, loading, loginHref: `/login?next=${encodeURIComponent(nextPath)}` };
}
