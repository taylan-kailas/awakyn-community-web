import { createSignal, onMount, Show } from "solid-js";

import { useClientLifecycle } from "@revolt/client";
import { Button, Column } from "@revolt/ui";

import type { Joined } from "./gateway";
import { gateway } from "./gatewayClient";
import { signInWithGoogle, takeRedirectResult } from "./google";

const LABEL = "Continue with Google";

/**
 * Signs in with Google through the gateway. With `code` (an invite), someone
 * without an account gets one and joins; without it, only existing members
 * get in. Also finishes a sign-in that went the long way round via Google's
 * own page (phones that block the pop-up) when this page loads again.
 */
export function GoogleButton(props: {
  code?: string;
  variant?: "filled" | "tonal";
  onSignedIn?: (joined: Joined) => void;
}) {
  const controller = useClientLifecycle();
  const [busy, setBusy] = createSignal(false);
  const [problem, setProblem] = createSignal<string>();

  async function finish(idToken: string) {
    const joined = await gateway.googleSignIn(idToken, props.code);
    controller.loginWithSession(joined.session);
    props.onSignedIn?.(joined);
  }

  async function run(getToken: () => Promise<string | "redirecting" | null>) {
    setBusy(true);
    setProblem(undefined);
    try {
      const token = await getToken();
      if (token === "redirecting") return; // stays busy while the page leaves for Google
      if (token) await finish(token);
      setBusy(false);
    } catch (error) {
      setProblem(error instanceof Error ? error.message : String(error));
      setBusy(false);
    }
  }

  onMount(() => run(takeRedirectResult));

  return (
    <Column>
      <Button
        variant={props.variant ?? "filled"}
        isDisabled={busy()}
        onPress={() => run(signInWithGoogle)}
      >
        {LABEL}
      </Button>
      <Show when={problem()}>
        <span role="status" style={{ "text-align": "center", color: "var(--md-sys-color-error)" }}>
          {problem()}
        </span>
      </Show>
    </Column>
  );
}
