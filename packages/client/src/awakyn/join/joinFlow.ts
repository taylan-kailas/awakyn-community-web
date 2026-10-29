import type { InvitePreview, JoinTarget } from "../gateway.ts";

/** The gateway's limit on names (server/gateway/limits.mjs). */
export const MAX_NAME_LENGTH = 32;

export type JoinStep = "LinkOff" | "AskName" | "GoogleOnly" | "JoinDirectly" | "KeepAccountFirst";

/**
 * What opening an invite link shows. Guests (a name, no account) are for
 * private call rooms only; the community needs a Google sign-in.
 */
export function nextStep({
  signedIn,
  isGuest,
  preview,
}: {
  signedIn: boolean;
  isGuest: boolean;
  preview: InvitePreview | null;
}): JoinStep {
  if (!preview) return "LinkOff";
  if (signedIn) return isGuest && preview.type === "Server" ? "KeepAccountFirst" : "JoinDirectly";
  return preview.guestsAllowed ? "AskName" : "GoogleOnly";
}

/** Where in the app a joined link lands. */
export function destination(target: JoinTarget): string {
  return target.type === "Server" ? `/server/${target.serverId}` : `/channel/${target.channelId}`;
}
