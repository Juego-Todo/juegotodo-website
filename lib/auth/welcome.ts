const PENDING_WELCOME_KEY = "juego-todo.auth.pending-welcome";

export function markPendingWelcomeChooser() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(PENDING_WELCOME_KEY, "1");
}

export function consumePendingWelcomeChooser() {
  if (typeof window === "undefined") {
    return false;
  }

  const pending = window.localStorage.getItem(PENDING_WELCOME_KEY) === "1";
  if (pending) {
    window.localStorage.removeItem(PENDING_WELCOME_KEY);
  }
  return pending;
}

export function clearPendingWelcomeChooser() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(PENDING_WELCOME_KEY);
}
