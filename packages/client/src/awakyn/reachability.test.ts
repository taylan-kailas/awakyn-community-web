// Run with: node --test src/awakyn/reachability.test.ts
import assert from "node:assert/strict";
import { test } from "node:test";

import { isUnreachable, withTimeout } from "./reachability.ts";

test("every browser's 'could not connect' error counts as offline", () => {
  assert.equal(isUnreachable(new TypeError("Failed to fetch")), true); // Chrome
  assert.equal(isUnreachable(new TypeError("NetworkError when attempting to fetch resource.")), true); // Firefox
  assert.equal(isUnreachable(new TypeError("Load failed")), true); // Safari / iPhone
});

test("a server that never answers counts as offline", () => {
  assert.equal(isUnreachable(new DOMException("timed out", "TimeoutError")), true);
});

test("other problems are not mistaken for offline", () => {
  assert.equal(isUnreachable(new Error("Unauthorized")), false);
  assert.equal(isUnreachable(undefined), false);
});

test("a slow step gives up with a timeout", async () => {
  const never = new Promise(() => {});
  await assert.rejects(withTimeout(never, 20), (e: unknown) => isUnreachable(e));
});

test("a quick step passes its answer through", async () => {
  assert.equal(await withTimeout(Promise.resolve(42), 1000), 42);
});
