import { createEffect, createSignal, onCleanup, Show } from "solid-js";

import { useClientLifecycle } from "@revolt/client";

import { gateway } from "./gatewayClient";

// New guests arrive by link at any time; this is how soon others see their tag.
const GUEST_REFRESH_MS = 60_000;
const TAG = "Guest";

const [guestIds, setGuestIds] = createSignal<ReadonlySet<string>>(new Set());

export const isGuest = (userId?: string) => Boolean(userId && guestIds().has(userId));

/** Asks the gateway who is a guest right now. */
export async function refreshGuests() {
  try {
    setGuestIds(new Set((await gateway.guests()).userIds));
  } catch (error) {
    console.error("Couldn't load the guest list:", error);
  }
}

/** Keeps the guest list fresh while the app is open and signed in. */
export function GuestList() {
  const { lifecycle } = useClientLifecycle();
  createEffect(() => {
    if (!lifecycle.loadedOnce()) return;
    refreshGuests();
    const timer = setInterval(refreshGuests, GUEST_REFRESH_MS);
    onCleanup(() => clearInterval(timer));
  });
  return null;
}

/** The small "Guest" tag beside a guest's name. `place` says where it sits. */
export function GuestTag(props: { userId?: string; place: "message" | "member" | "call" }) {
  return (
    <Show when={isGuest(props.userId)}>
      <span
        data-guest-tag={props.place}
        style={{
          "margin-inline-start": "6px",
          padding: "0 6px",
          "border-radius": "999px",
          border: "1px solid var(--md-sys-color-outline-variant)",
          color: "var(--md-sys-color-on-surface-variant)",
          "font-size": "0.7rem",
          "font-weight": 600,
          "line-height": "1.4",
          "vertical-align": "middle",
          "white-space": "nowrap",
        }}
      >
        {TAG}
      </span>
    </Show>
  );
}
