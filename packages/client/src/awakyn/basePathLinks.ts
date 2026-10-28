/**
 * Stoat writes many of its links as fixed addresses ("/login/auth", "/app").
 * When the app is served from a folder (BASE_PATH, e.g. /community-app/) those
 * would leave the app. Before any link click is handled, point Stoat's own
 * links back inside the folder; links to the rest of the website stay as they
 * are.
 */

// First path segment of every page the app itself serves (see src/index.tsx).
const APP_SECTIONS = new Set([
  "app",
  "bot",
  "channel",
  "dev",
  "discover",
  "friends",
  "i",
  "invite",
  "login",
  "pwa",
  "server",
  "settings",
]);

/** The in-app address for `pathname`, or null when it should be left alone. */
export function pathInsideApp(pathname: string, base: string): string | null {
  if (!base) return null;
  if (pathname === base || pathname.startsWith(`${base}/`)) return null;
  const section = pathname.split("/")[1];
  if (!APP_SECTIONS.has(section)) return null;
  return `${base}${pathname}`;
}

export function keepLinksInsideBasePath(base: string) {
  if (!base) return;

  const rewrite = (event: MouseEvent) => {
    const anchor = (event.target as Element | null)?.closest?.("a[href]");
    if (!(anchor instanceof HTMLAnchorElement)) return;
    if (anchor.origin !== window.location.origin) return;
    const inside = pathInsideApp(anchor.pathname, base);
    if (inside) anchor.pathname = inside;
  };

  // Capture phase, so this runs before the router's own link handling.
  window.addEventListener("click", rewrite, true);
  window.addEventListener("auxclick", rewrite, true);
}
