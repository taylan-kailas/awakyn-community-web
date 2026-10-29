/** How long to wait for the community's server before showing the offline screen. */
export const CONNECT_TIMEOUT_MS = 12000;

/**
 * Whether an error means the server couldn't be reached at all. Browsers word
 * it differently (Chrome "Failed to fetch", Firefox "NetworkError…", Safari
 * "Load failed") but all raise a TypeError from fetch; a timeout counts too.
 */
export function isUnreachable(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  return error instanceof DOMException && error.name === "TimeoutError";
}

/** Resolves with `step`, or rejects with a TimeoutError after `ms`. */
export function withTimeout<T>(step: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new DOMException("The server did not answer in time", "TimeoutError")), ms);
    step.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
