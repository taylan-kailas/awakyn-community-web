import { createSignal, Show } from "solid-js";

import { useState } from "@revolt/state";
import { Column, Text } from "@revolt/ui";

import { gateway } from "./gatewayClient";
import { GoogleButton } from "./GoogleButton";
import { isGuest, refreshGuests } from "./guests";

const COPY = {
  title: "Keep your account",
  body: "You joined with just a name, so this account lives in this browser. Connect Google to keep it everywhere.",
  kept: "Your account is kept with Google. Next time, sign in with Google.",
};

/** For guests: connect Google so the account (name, messages) can be signed in to anywhere. */
export function KeepAccount() {
  const state = useState();
  const [kept, setKept] = createSignal(false);
  const userId = () => state.auth.getSession()?.userId;

  async function keep(idToken: string) {
    await gateway.googleLink(idToken, state.auth.getSession()!.token);
    await refreshGuests();
    setKept(true);
  }

  return (
    <Show when={isGuest(userId()) || kept()}>
      <Column gap="md" style={{ padding: "16px", "border-radius": "16px", background: "var(--md-sys-color-surface-container-high)" }}>
        <Text class="title">{COPY.title}</Text>
        <Show when={!kept()} fallback={<Text>{COPY.kept}</Text>}>
          <Text>{COPY.body}</Text>
          <GoogleButton onToken={keep} />
        </Show>
      </Column>
    </Show>
  );
}
