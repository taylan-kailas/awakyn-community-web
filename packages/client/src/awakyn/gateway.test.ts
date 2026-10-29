// Run with: node --test src/awakyn/gateway.test.ts
import assert from "node:assert/strict";
import { test } from "node:test";

import { createGateway, gatewayUrl } from "./gateway.ts";

const answer = (status: number, body: unknown) =>
  new Response(typeof body === "string" ? body : JSON.stringify(body), { status });

test("the gateway sits beside Stoat's API", () => {
  assert.equal(gatewayUrl("https://home.example/api"), "https://home.example/awakyn");
  assert.equal(gatewayUrl("https://home.example/api/"), "https://home.example/awakyn");
});

test("a refusal carries the gateway's own plain sentence and code", async () => {
  const gateway = createGateway("https://g", async () =>
    answer(403, { error: "NeedsInvite", message: "You need an invite link to join." }),
  );
  await assert.rejects(gateway.googleSignIn("token"), { code: "NeedsInvite", message: "You need an invite link to join." });
});

test("an unreachable community says so plainly", async () => {
  const gateway = createGateway("https://g", async () => {
    throw new TypeError("Failed to fetch");
  });
  await assert.rejects(gateway.preview("abc"), {
    code: "Unreachable",
    message: "Couldn't reach the community. Try again in a moment.",
  });
});

test("a garbled answer never shows its insides", async () => {
  const gateway = createGateway("https://g", async () => answer(502, "<html>Bad Gateway</html>"));
  await assert.rejects(gateway.preview("abc"), {
    code: "Failed",
    message: "Something went wrong. Please try again.",
  });
});

test("requests go where the gateway expects them", async () => {
  const seen: [string, RequestInit | undefined][] = [];
  const gateway = createGateway("https://g", async (url, init) => {
    seen.push([String(url), init]);
    return answer(200, { session: { _id: "s", token: "t", user_id: "u" } });
  });
  await gateway.googleSignIn("tok", "code1");
  await gateway.guestJoin("code2", "Sam");
  await gateway.googleLink("tok", "session-token");
  await gateway.preview("a b");
  assert.deepEqual(
    seen.map(([url, init]) => [url, init?.method ?? "GET", init?.body ?? null]),
    [
      ["https://g/google/signin", "POST", JSON.stringify({ idToken: "tok", code: "code1" })],
      ["https://g/guest/join", "POST", JSON.stringify({ code: "code2", name: "Sam" })],
      ["https://g/google/link", "POST", JSON.stringify({ idToken: "tok" })],
      ["https://g/invite/a%20b", "GET", null],
    ],
  );
  assert.equal((seen[2][1]?.headers as Record<string, string>)["x-session-token"], "session-token");
});

test("call room requests carry the owner's session", async () => {
  const seen: [string, string, string | null, string | undefined][] = [];
  const gateway = createGateway("https://g", async (url, init) => {
    const headers = (init?.headers ?? {}) as Record<string, string>;
    seen.push([String(url), init?.method ?? "GET", (init?.body as string) ?? null, headers["x-session-token"]]);
    return answer(200, { rooms: [] });
  });
  await gateway.callRooms("t");
  await gateway.createCallRoom("t", "Friday call");
  await gateway.freshCallLink("t", "r1");
  await gateway.switchOffCallLink("t", "r1");
  await gateway.deleteCallRoom("t", "r1");
  assert.deepEqual(seen, [
    ["https://g/calls", "GET", null, "t"],
    ["https://g/calls", "POST", JSON.stringify({ name: "Friday call" }), "t"],
    ["https://g/calls/r1/fresh-link", "POST", JSON.stringify({}), "t"],
    ["https://g/calls/r1/link", "DELETE", null, "t"],
    ["https://g/calls/r1", "DELETE", null, "t"],
  ]);
});
