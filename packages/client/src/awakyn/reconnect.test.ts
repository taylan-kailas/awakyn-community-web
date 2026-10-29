// Run with: node --test src/awakyn/reconnect.test.ts
import assert from "node:assert/strict";
import { test } from "node:test";

import { MAX_RECONNECT_WAIT_SECONDS, reconnectWaitSeconds } from "./reconnect.ts";

test("early retries come quickly, as Stoat had them", () => {
  // Stoat's own timing: (2^failures - 1) seconds, give or take 20%.
  assert.equal(reconnectWaitSeconds(1, 0.5), 1);
  assert.ok(Math.abs(reconnectWaitSeconds(3, 0) - 5.6) < 1e-9);
});

test("after a long outage the wait never grows past the cap", () => {
  assert.equal(MAX_RECONNECT_WAIT_SECONDS, 30);
  assert.equal(reconnectWaitSeconds(13, 0.9), MAX_RECONNECT_WAIT_SECONDS);
  assert.equal(reconnectWaitSeconds(40, 0), MAX_RECONNECT_WAIT_SECONDS);
});
