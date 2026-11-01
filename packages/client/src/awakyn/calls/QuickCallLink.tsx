import { Show } from "solid-js";

import { useClient } from "@revolt/client";
import { useNavigate } from "@revolt/routing";
import { useState } from "@revolt/state";

import { ActionButton } from "../ActionButton";
import { appAddress } from "../appAddress";
import { gateway } from "../gatewayClient";
import { destination } from "../join/joinFlow";
import { setPendingCall } from "../join/pendingCall";
import { callLink, quickRoomName } from "./callLinks";

const COPY = {
  label: "New call link",
  working: "Making link…",
  done: "Link copied",
  notCopied: "Couldn't copy the link, so the room wasn't kept. Please try again.",
};
const TEXT_TYPE = "text/plain";
// The new room reaches the app over its live connection; after this, open it anyway.
const ARRIVAL_WAIT_MS = 15_000;
const ARRIVAL_POLL_MS = 100;

/**
 * Starts the clipboard write while the press still counts as a press, with the
 * link arriving later: browsers refuse a copy made after a slow wait otherwise.
 */
async function copyWhenReady(link: Promise<string>): Promise<void> {
  if (typeof ClipboardItem === "undefined") return navigator.clipboard.writeText(await link);
  const blob = link.then((text) => new Blob([text], { type: TEXT_TYPE }));
  return navigator.clipboard.write([new ClipboardItem({ [TEXT_TYPE]: blob })]);
}

/** Taylan's one-press call: a fresh call room, its link copied, and him waiting in the call. */
export function QuickCallLink() {
  const client = useClient();
  const state = useState();
  const navigate = useNavigate();
  const isOwner = () => client().user?.id === import.meta.env.VITE_OWNER_USER_ID;
  const address = appAddress(location.origin, import.meta.env.BASE_URL);

  async function arrive(channelId: string) {
    for (let waited = 0; !client().channels.has(channelId) && waited < ARRIVAL_WAIT_MS; waited += ARRIVAL_POLL_MS) {
      await new Promise((done) => setTimeout(done, ARRIVAL_POLL_MS));
    }
    setPendingCall(channelId);
    navigate(destination({ type: "Group", channelId }));
  }

  async function start() {
    const token = state.auth.getSession()!.token;
    const room = gateway.createCallRoom(token, quickRoomName(Date.now()));
    const copied = copyWhenReady(room.then((r) => callLink(address, r.code!)));
    const [made, copy] = await Promise.allSettled([room, copied]);
    if (made.status === "rejected") throw made.reason;
    if (copy.status === "rejected") {
      console.error("Couldn't copy the call link:", copy.reason);
      await gateway.deleteCallRoom(token, made.value.id);
      throw new Error(COPY.notCopied);
    }
    await arrive(made.value.id);
  }

  return (
    <Show when={isOwner()}>
      <div data-quick-call-link style={{ "padding-inline": "var(--gap-md)", "padding-bottom": "var(--gap-md)" }}>
        <ActionButton variant="filled" label={COPY.label} working={COPY.working} done={COPY.done} run={start} />
      </div>
    </Show>
  );
}
