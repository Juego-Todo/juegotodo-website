/**
 * Routes where the floating cart chrome must not cover CTAs or form actions.
 */
export function shouldHideFloatingCartChrome(pathname: string): boolean {
  if (
    pathname.startsWith("/checkout") ||
    pathname === "/cart" ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/membership") ||
    pathname.startsWith("/register-for-license") ||
    pathname.startsWith("/consultation") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/orders")
  ) {
    return true;
  }

  // Product detail pages use StickyPurchaseBar — avoid stacked bottom CTAs.
  if (/^\/shop\/[^/]+\/?$/.test(pathname)) {
    return true;
  }

  return false;
}
