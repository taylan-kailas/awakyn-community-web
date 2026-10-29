import { createEffect, runWithOwner } from "solid-js";

import { useClient, useClientLifecycle } from "@revolt/client";
import { useVoice } from "@revolt/rtc";

import { pendingCall, setPendingCall } from "./pendingCall";

/** Puts someone who arrived by call link straight into the call (after the browser's mic prompt). */
export function AutoJoinCall() {
  const client = useClient();
  const voice = useVoice();
  const { lifecycle } = useClientLifecycle();

  createEffect(() => {
    const id = pendingCall();
    if (!id || !lifecycle.loadedOnce()) return;
    const channel = client().channels.get(id);
    if (!channel) return;
    setPendingCall(undefined);
    // Joined as a button press would: the call builds live parts of its own
    // (who's in it), which must outlast this effect re-running.
    runWithOwner(null, () => voice.connect(channel))?.catch((error) => console.error("Couldn't join the call:", error));
  });

  return null;
}
