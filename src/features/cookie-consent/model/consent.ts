export type Consent = "all" | "essential";

const KEY = "aipm-cookie-consent";
const EVENT = "aipm:consent";

export function readConsent(): Consent | null {
  try {
    const value = localStorage.getItem(KEY);
    return value === "all" || value === "essential" ? value : null;
  } catch {
    return null;
  }
}

export function writeConsent(value: Consent) {
  try {
    localStorage.setItem(KEY, value);
  } catch {
    // Private mode: the choice lasts for this page view only.
  }
  window.dispatchEvent(new CustomEvent<Consent>(EVENT, { detail: value }));
}

export function onConsentChange(listener: (value: Consent) => void) {
  const handler = (event: Event) => listener((event as CustomEvent<Consent>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}

/** useSyncExternalStore adapter: server snapshot is "unknown" so nothing flashes before hydration. */
export function subscribeConsent(callback: () => void) {
  const unsubscribe = onConsentChange(() => callback());
  window.addEventListener("storage", callback);
  return () => {
    unsubscribe();
    window.removeEventListener("storage", callback);
  };
}

export function consentSnapshot(): Consent | "none" {
  return readConsent() ?? "none";
}

export function consentServerSnapshot(): "unknown" {
  return "unknown";
}
