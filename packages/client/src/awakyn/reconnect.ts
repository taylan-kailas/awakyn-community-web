/** Longest wait between automatic reconnects, so a member left in the app gets back in soon after the PC returns. */
export const MAX_RECONNECT_WAIT_SECONDS = 30;

/**
 * Seconds before the next reconnect: Stoat's doubling wait with ±20% jitter
 * (`random` in 0–1), but never longer than MAX_RECONNECT_WAIT_SECONDS.
 */
export function reconnectWaitSeconds(failures: number, random: number): number {
  const stoatWait = (Math.pow(2, failures) - 1) * (0.8 + random * 0.4);
  return Math.min(stoatWait, MAX_RECONNECT_WAIT_SECONDS);
}
