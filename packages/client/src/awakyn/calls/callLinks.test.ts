// Run with: node --test src/awakyn/calls/callLinks.test.ts
import assert from "node:assert/strict";
import { test } from "node:test";

import { callLink, shortDate } from "./callLinks.ts";

test("dates read day/month/year", () => {
  assert.equal(shortDate(new Date(2026, 9, 29, 23, 59).getTime()), "29/10/2026");
  assert.equal(shortDate(new Date(2027, 0, 3).getTime()), "03/01/2027");
});

test("a call link opens the app's join screen", () => {
  assert.equal(callLink("https://awakyn.one/community-app", "Ab12"), "https://awakyn.one/community-app/invite/Ab12");
});
