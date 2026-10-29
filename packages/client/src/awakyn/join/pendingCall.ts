import { createSignal } from "solid-js";

/** A call room someone just joined by link; the app connects them to its call once it's loaded. */
export const [pendingCall, setPendingCall] = createSignal<string>();
