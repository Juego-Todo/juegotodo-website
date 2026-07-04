/** Login/register URL for checkout — defaults to account creation, preserves return path. */
export function getCheckoutAuthHref(nextPath: string, options?: { register?: boolean }) {
  const params = new URLSearchParams({ next: nextPath });
  if (options?.register !== false) {
    params.set("mode", "register");
  }
  return `/login?${params.toString()}`;
}
