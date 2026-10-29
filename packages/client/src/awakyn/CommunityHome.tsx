import { Show } from "solid-js";

import { useClient } from "@revolt/client";
import { Navigate } from "@revolt/routing";
import { useState } from "@revolt/state";

import { pathWithinApp } from "./basePathLinks";
import { DIRECT_MESSAGES_PATH } from "./paths";

/** The app opens on the community; someone not in it (a call-room guest) gets their conversations. */
export function CommunityHome() {
  const client = useClient();
  const state = useState();
  const community = () => client().servers.toList()[0];
  // The remembered place includes the app's folder; the router adds it again.
  const lastPlaceIn = (serverId: string) =>
    pathWithinApp(
      state.layout.getLastActiveServerPath(serverId),
      import.meta.env.BASE_URL.replace(/\/$/, ""),
    );

  return (
    <Show
      when={community()}
      fallback={<Navigate href={DIRECT_MESSAGES_PATH} />}
    >
      {(server) => <Navigate href={lastPlaceIn(server().id)} />}
    </Show>
  );
}
