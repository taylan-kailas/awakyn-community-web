import { createSignal, Match, onMount, Switch } from "solid-js";

import { CONFIGURATION } from "@revolt/common";
import { useClient, useClientLifecycle } from "@revolt/client";
import { useNavigate, useParams } from "@revolt/routing";
import { useState } from "@revolt/state";
import { Button, Column, TextField } from "@revolt/ui";

import { GatewayError, type InvitePreview, type JoinTarget } from "../gateway";
import { gateway } from "../gatewayClient";
import { GoogleButton } from "../GoogleButton";
import { signInWithToken } from "../googleSignIn";
import { Lotus } from "../Lotus";
import { destination, MAX_NAME_LENGTH, nextStep, type JoinStep } from "./joinFlow";
import { setPendingCall } from "./pendingCall";

const COPY = {
  askName: "What should we call you?",
  join: "Join",
  joining: "Joining…",
  linkOff: "This link has been switched off",
  keepAccount: "Keep your account with Google to join the community.",
};
const LOTUS_SIZE = 64;
const ALREADY_JOINED = ["AlreadyInServer", "AlreadyInGroup"];
// The room or community has to be known to the app before it can open; a
// fresh sign-in can take a moment to load. After this, open it anyway.
const ARRIVAL_WAIT_MS = 15_000;
const ARRIVAL_POLL_MS = 100;

/** Opening an invite link: a name for a call room, Google for the community. */
export function JoinPage() {
  const params = useParams();
  const navigate = useNavigate();
  const state = useState();
  const controller = useClientLifecycle();
  const client = useClient();
  const code = () => params.code as string;

  const [step, setStep] = createSignal<JoinStep | "Loading" | "Problem">("Loading");
  const [preview, setPreview] = createSignal<InvitePreview | null>(null);
  const [name, setName] = createSignal("");
  const [busy, setBusy] = createSignal(false);
  const [problem, setProblem] = createSignal<string>();

  const known = (target: JoinTarget) =>
    target.type === "Server" ? client().servers.has(target.serverId) : client().channels.has(target.channelId);

  async function arrive(target: JoinTarget) {
    for (let waited = 0; !known(target) && waited < ARRIVAL_WAIT_MS; waited += ARRIVAL_POLL_MS) {
      await new Promise((done) => setTimeout(done, ARRIVAL_POLL_MS));
    }
    if (target.type === "Group") setPendingCall(target.channelId);
    navigate(destination(target), { replace: true });
  }

  // What Stoat answers on joining: the room (or community) and who's in it, so the app knows it at once.
  function remember(joined: { type: string; channel?: { _id: string }; server?: { _id: string }; channels?: { _id: string }[]; users?: { _id: string }[] }) {
    for (const user of joined.users ?? []) client().users.getOrCreate(user._id, user as never);
    for (const channel of joined.channels ?? []) client().channels.getOrCreate(channel._id, channel as never);
    if (joined.channel) client().channels.getOrCreate(joined.channel._id, joined.channel as never);
    if (joined.server) client().servers.getOrCreate(joined.server._id, joined.server as never, true);
  }

  // A member (or a guest on a call link) joins with Stoat's own invite.
  async function joinAsMember(token: string, target: JoinTarget) {
    const res = await fetch(`${CONFIGURATION.DEFAULT_API_URL}/invites/${encodeURIComponent(code())}`, {
      method: "POST",
      headers: { "x-session-token": token },
    });
    const answer = await res.json().catch(() => null);
    if (!res.ok && !ALREADY_JOINED.includes(answer?.type)) throw new GatewayError("Failed", "Couldn't join. Please try again.");
    if (res.ok && answer) remember(answer);
    await arrive(target);
  }

  onMount(async () => {
    const session = state.auth.getSession();
    try {
      const found = await gateway.preview(code()).catch((error) => {
        if (error instanceof GatewayError && error.code === "LinkOff") return null;
        throw error;
      });
      setPreview(found);
      const isGuest = session ? (await gateway.guests()).userIds.includes(session.userId) : false;
      const next = nextStep({ signedIn: Boolean(session), isGuest, preview: found });
      if (next === "JoinDirectly" && session && found) return await joinAsMember(session.token, found.target);
      setStep(next);
    } catch (error) {
      setProblem(error instanceof Error ? error.message : String(error));
      setStep("Problem");
    }
  });

  async function joinAsGuest(event?: Event) {
    event?.preventDefault();
    if (busy()) return;
    setBusy(true);
    setProblem(undefined);
    try {
      const joined = await gateway.guestJoin(code(), name());
      controller.loginWithSession(joined.session);
      arrive(joined.target!);
    } catch (error) {
      setProblem(error instanceof Error ? error.message : String(error));
      setBusy(false);
    }
  }

  async function keepAccountThenJoin(idToken: string) {
    const session = state.auth.getSession();
    if (!session) throw new GatewayError("NotSignedIn", "Please sign in again.");
    await gateway.googleLink(idToken, session.token);
    await joinAsMember(session.token, preview()!.target);
  }

  const googleJoin = signInWithToken(controller, code(), (joined) => joined.target && arrive(joined.target));

  return (
    <Column gap="lg" style={{ "align-items": "center" }}>
      <Lotus size={LOTUS_SIZE} />
      <Switch>
        <Match when={step() === "LinkOff"}>
          <h1 style={{ margin: 0, "text-align": "center" }}>{COPY.linkOff}</h1>
        </Match>
        <Match when={step() === "Problem"}>
          <span role="status" style={{ "text-align": "center", color: "var(--md-sys-color-error)" }}>
            {problem()}
          </span>
        </Match>
        <Match when={step() === "AskName"}>
          <h1 style={{ margin: 0, "text-align": "center" }}>{preview()?.name}</h1>
          <form onSubmit={joinAsGuest} style={{ width: "100%" }}>
            <Column>
              <TextField
                autofocus
                label={COPY.askName}
                maxlength={MAX_NAME_LENGTH}
                value={name()}
                onInput={(e: InputEvent) => setName((e.currentTarget as HTMLInputElement).value)}
              />
              <Button isDisabled={busy()} onPress={() => joinAsGuest()}>
                {busy() ? COPY.joining : COPY.join}
              </Button>
              <span role="status" style={{ "text-align": "center", color: "var(--md-sys-color-error)" }}>
                {problem()}
              </span>
            </Column>
          </form>
          <GoogleButton variant="tonal" onToken={googleJoin} />
        </Match>
        <Match when={step() === "GoogleOnly"}>
          <h1 style={{ margin: 0, "text-align": "center" }}>{preview()?.name}</h1>
          <GoogleButton onToken={googleJoin} />
        </Match>
        <Match when={step() === "KeepAccountFirst"}>
          <h1 style={{ margin: 0, "text-align": "center" }}>{preview()?.name}</h1>
          <span style={{ "text-align": "center" }}>{COPY.keepAccount}</span>
          <GoogleButton onToken={keepAccountThenJoin} />
        </Match>
      </Switch>
    </Column>
  );
}
