const pad = (n: number) => String(n).padStart(2, "0");

/** dd/mm/yyyy in the viewer's own time zone. */
export function shortDate(ms: number): string {
  const d = new Date(ms);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** The link to send: the app's join screen for this code. */
export function callLink(appAddress: string, code: string): string {
  return `${appAddress}/invite/${code}`;
}
