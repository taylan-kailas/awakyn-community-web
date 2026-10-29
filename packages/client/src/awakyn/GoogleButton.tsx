import { createSignal, onMount, Show } from "solid-js";

import { Button, Column } from "@revolt/ui";

import { signInWithGoogle, takeRedirectResult } from "./google";

const LABEL = "Continue with Google";

/**
 * Runs Google sign-in and hands the token to `onToken` (sign in, or keep a
 * guest's account), showing it's working and any problem in plain words.
 * Also finishes a sign-in that went via Google's own page (browsers that
 * block the pop-up) when this page loads again — so use one per page.
 */
export function GoogleButton(props: { onToken: (idToken: string) => Promise<void>; variant?: "filled" | "tonal" }) {
  const [busy, setBusy] = createSignal(false);
  const [problem, setProblem] = createSignal<string>();

  async function run(getToken: () => Promise<string | "redirecting" | null>) {
    setBusy(true);
    setProblem(undefined);
    try {
      const token = await getToken();
      if (token === "redirecting") return; // stays busy while the page leaves for Google
      if (token) await props.onToken(token);
      setBusy(false);
    } catch (error) {
      setProblem(error instanceof Error ? error.message : String(error));
      setBusy(false);
    }
  }

  onMount(() => run(takeRedirectResult));

  return (
    <Column style={{ width: "100%" }}>
      <Button variant={props.variant ?? "filled"} isDisabled={busy()} onPress={() => run(signInWithGoogle)}>
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
