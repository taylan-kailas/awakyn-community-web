/**
 * The Awakyn gateway beside the community's server: lets people in with a
 * call link and a name, or with Google. Every failure arrives as a plain
 * sentence that can be shown as it is.
 */
import { isUnreachable } from "./reachability.ts";

export type GatewaySession = { _id: string; token: string; user_id: string };
export type JoinTarget = { type: "Server"; serverId: string; channelId?: string } | { type: "Group"; channelId: string };
export type InvitePreview = { type: "Server" | "Group"; name: string; guestsAllowed: boolean; target: JoinTarget };
export type Joined = { session: GatewaySession; target?: JoinTarget };
export type CallRoom = { id: string; name: string; code: string | null; createdAt: number };

const UNREACHABLE = "Couldn't reach the community. Try again in a moment.";
const FAILED = "Something went wrong. Please try again.";

export class GatewayError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

/** The gateway's address, from Stoat's API address (both are served by the same host). */
export function gatewayUrl(apiUrl: string): string {
  return apiUrl.replace(/\/+$/, "").replace(/\/api$/, "/awakyn");
}

export function createGateway(baseUrl: string, send: typeof fetch = fetch) {
  async function ask<T>(path: string, body?: unknown, sessionToken?: string, method?: "DELETE"): Promise<T> {
    let res: Response;
    try {
      res = await send(baseUrl + path, {
        method: method ?? (body === undefined ? "GET" : "POST"),
        headers: {
          ...(body === undefined ? {} : { "content-type": "application/json" }),
          ...(sessionToken ? { "x-session-token": sessionToken } : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (error) {
      if (isUnreachable(error)) throw new GatewayError("Unreachable", UNREACHABLE);
      throw error;
    }
    const answer = await res.json().catch(() => null);
    if (res.ok && answer) return answer as T;
    if (answer && typeof answer.error === "string" && typeof answer.message === "string") {
      throw new GatewayError(answer.error, answer.message);
    }
    throw new GatewayError("Failed", FAILED);
  }

  return {
    preview: (code: string) => ask<InvitePreview>(`/invite/${encodeURIComponent(code)}`),
    guestJoin: (code: string, name: string) => ask<Joined>("/guest/join", { code, name }),
    googleSignIn: (idToken: string, code?: string) => ask<Joined>("/google/signin", { idToken, code }),
    googleLink: (idToken: string, sessionToken: string) => ask<{ ok: true }>("/google/link", { idToken }, sessionToken),
    guests: () => ask<{ userIds: string[] }>("/guests"),
    callRooms: (token: string) => ask<{ rooms: CallRoom[] }>("/calls", undefined, token),
    createCallRoom: (token: string, name: string) => ask<CallRoom>("/calls", { name }, token),
    freshCallLink: (token: string, id: string) => ask<CallRoom>(`/calls/${encodeURIComponent(id)}/fresh-link`, {}, token),
    switchOffCallLink: (token: string, id: string) =>
      ask<CallRoom>(`/calls/${encodeURIComponent(id)}/link`, undefined, token, "DELETE"),
    deleteCallRoom: (token: string, id: string) => ask<{ ok: true }>(`/calls/${encodeURIComponent(id)}`, undefined, token, "DELETE"),
  };
}

export type Gateway = ReturnType<typeof createGateway>;
