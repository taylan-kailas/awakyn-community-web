// Run with: node --test src/awakyn/join/joinFlow.test.ts
import assert from "node:assert/strict";
import { test } from "node:test";

import { destination, nextStep } from "./joinFlow.ts";

const CALL = { type: "Group" as const, name: "Friday call", guestsAllowed: true, target: { type: "Group" as const, channelId: "g1" } };
const COMMUNITY = {
  type: "Server" as const,
  name: "Awakyn",
  guestsAllowed: false,
  target: { type: "Server" as const, serverId: "s1" },
};

test("a switched-off or mistyped link says so", () => {
  assert.equal(nextStep({ signedIn: false, isGuest: false, preview: null }), "LinkOff");
  assert.equal(nextStep({ signedIn: true, isGuest: false, preview: null }), "LinkOff");
});

test("someone new on a call link is asked their name", () => {
  assert.equal(nextStep({ signedIn: false, isGuest: false, preview: CALL }), "AskName");
});

test("someone new on a community link can only continue with Google", () => {
  assert.equal(nextStep({ signedIn: false, isGuest: false, preview: COMMUNITY }), "GoogleOnly");
});

test("with guests switched off, a call link also needs Google", () => {
  assert.equal(nextStep({ signedIn: false, isGuest: false, preview: { ...CALL, guestsAllowed: false } }), "GoogleOnly");
});

test("a member joins any link straight away", () => {
  assert.equal(nextStep({ signedIn: true, isGuest: false, preview: CALL }), "JoinDirectly");
  assert.equal(nextStep({ signedIn: true, isGuest: false, preview: COMMUNITY }), "JoinDirectly");
});

test("a returning guest skips the name on a call link", () => {
  assert.equal(nextStep({ signedIn: true, isGuest: true, preview: CALL }), "JoinDirectly");
});

test("a returning guest must keep their account with Google before joining the community", () => {
  assert.equal(nextStep({ signedIn: true, isGuest: true, preview: COMMUNITY }), "KeepAccountFirst");
});

test("call rooms open as the room, the community as the community", () => {
  assert.equal(destination({ type: "Group", channelId: "g1" }), "/channel/g1");
  assert.equal(destination({ type: "Server", serverId: "s1", channelId: "c1" }), "/server/s1");
});
