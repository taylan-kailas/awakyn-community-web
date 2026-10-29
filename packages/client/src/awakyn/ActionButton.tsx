import { createSignal, onCleanup, Show } from "solid-js";

import { Button, Column } from "@revolt/ui";

const DONE_SHOWN_MS = 2000;

/** A button that shows it's working, then briefly that it's done, or what went wrong. */
export function ActionButton(props: {
  label: string;
  working: string;
  done: string;
  run: () => Promise<unknown>;
  variant?: "filled" | "tonal" | "outlined";
  isDisabled?: boolean;
}) {
  const [state, setState] = createSignal<"idle" | "working" | "done">("idle");
  const [problem, setProblem] = createSignal<string>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  onCleanup(() => clearTimeout(timer));

  async function press() {
    if (state() === "working") return;
    setState("working");
    setProblem(undefined);
    try {
      await props.run();
      setState("done");
      clearTimeout(timer);
      timer = setTimeout(() => setState("idle"), DONE_SHOWN_MS);
    } catch (error) {
      setProblem(error instanceof Error ? error.message : String(error));
      setState("idle");
    }
  }

  const text = () => ({ idle: props.label, working: props.working, done: props.done })[state()];

  return (
    <Column gap="xs">
      <Button variant={props.variant ?? "tonal"} isDisabled={props.isDisabled || state() === "working"} onPress={press}>
        {text()}
      </Button>
      <Show when={problem()}>
        <span role="status" style={{ color: "var(--md-sys-color-error)" }}>
          {problem()}
        </span>
      </Show>
    </Column>
  );
}
