/**
 * Stoat writes many of its links as fixed addresses ("/login/auth", "/app").
 * When the app is served from a folder (BASE_PATH, e.g. /community-app/) those
 * would leave the app. Before any link click is handled, point same-site links
 * that are outside the folder back inside it.
 */
export function keepLinksInsideBasePath(base: string) {
  if (!base) return;

  const rewrite = (event: MouseEvent) => {
    const anchor = (event.target as Element | null)?.closest?.("a[href]");
    if (!(anchor instanceof HTMLAnchorElement)) return;
    if (anchor.origin !== window.location.origin) return;
    if (anchor.pathname === base || anchor.pathname.startsWith(`${base}/`)) return;
    anchor.pathname = `${base}${anchor.pathname}`;
  };

  // Capture phase, so this runs before the router's own link handling.
  window.addEventListener("click", rewrite, true);
  window.addEventListener("auxclick", rewrite, true);
}
