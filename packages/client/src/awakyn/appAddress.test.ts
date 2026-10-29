// Run with: node --test src/awakyn/appAddress.test.ts
import assert from "node:assert/strict";
import { test } from "node:test";

import { appAddress } from "./appAddress.ts";

test("shared links start at the app's own page, not the PC's address", () => {
  assert.equal(appAddress("https://awakyn.one", "/community-app/"), "https://awakyn.one/community-app");
  assert.equal(appAddress("https://awakyn.one", "/community-app/") + "/invite/7QgvnPYT", "https://awakyn.one/community-app/invite/7QgvnPYT");
});

test("an app served from the site root has no folder", () => {
  assert.equal(appAddress("http://localhost:4610", "/"), "http://localhost:4610");
});
