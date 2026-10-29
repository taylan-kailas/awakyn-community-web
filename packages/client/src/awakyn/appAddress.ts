/**
 * Where members open the app (e.g. https://awakyn.one/community-app). Shared
 * links (invites, channels, messages) start here — not at the PC's server
 * address — so they work from anywhere and show the offline screen when the
 * PC is off, instead of a browser error.
 */
export function appAddress(locationOrigin: string, baseUrl: string): string {
  return `${locationOrigin}${baseUrl.replace(/\/$/, "")}`;
}
