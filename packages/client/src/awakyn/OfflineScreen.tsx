import { createSignal } from "solid-js";

import { Lotus } from "./Lotus";
import { stoatThemeVariables } from "./theme/stoatVariables";
import { AWAKYN_THEME } from "./theme/tokens";

const COPY = {
  heading: "The community is offline right now",
  body: "It's back when Taylan's computer is on. Try again in a little while.",
  retry: "Try again",
  retrying: "Trying…",
  stillOffline: "Still offline",
};
const LOTUS_SIZE = 72;

/**
 * Shown instead of the app when the community's server can't be reached
 * (Taylan's PC is off). `onRetry` resolves once the app is reachable again.
 */
export function OfflineScreen(props: { onRetry: () => Promise<void> }) {
  // This screen shows before the app's settings and colours load, so it
  // paints the theme itself, following the device's light/dark setting.
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const themeStyle = stoatThemeVariables(AWAKYN_THEME, prefersDark);
  const [busy, setBusy] = createSignal(false);
  const [stillOffline, setStillOffline] = createSignal(false);

  async function retry() {
    setBusy(true);
    setStillOffline(false);
    try {
      await props.onRetry();
    } catch {
      setStillOffline(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main class="awakyn-offline" style={themeStyle}>
      <style>{`
        .awakyn-offline { min-height: 100dvh; display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 16px; padding: 24px 16px; text-align: center; box-sizing: border-box;
          background: var(--md-sys-color-surface); color: var(--md-sys-color-on-surface); font-family: var(--fonts-primary); }
        .awakyn-offline h1 { margin: 8px 0 0; font-size: 1.5rem; font-weight: 600; }
        .awakyn-offline p { margin: 0; max-width: 32ch; color: var(--md-sys-color-on-surface-variant); }
        .awakyn-offline button { margin-top: 8px; min-width: 140px; padding: 10px 22px; border: none; border-radius: 999px;
          font: inherit; font-weight: 600; cursor: pointer; background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary); transition: opacity .15s ease, transform .1s ease; }
        .awakyn-offline button:hover:not(:disabled) { opacity: .85; }
        .awakyn-offline button:active:not(:disabled) { transform: scale(.97); }
        .awakyn-offline button:disabled { opacity: .45; cursor: progress; }
        .awakyn-offline .still { color: var(--md-sys-color-error); font-weight: 500; }
      `}</style>
      <Lotus size={LOTUS_SIZE} />
      <h1>{COPY.heading}</h1>
      <p>{COPY.body}</p>
      <button type="button" disabled={busy()} aria-busy={busy()} onClick={retry}>
        {busy() ? COPY.retrying : COPY.retry}
      </button>
      <p class="still" role="status">{stillOffline() ? COPY.stillOffline : ""}</p>
    </main>
  );
}
