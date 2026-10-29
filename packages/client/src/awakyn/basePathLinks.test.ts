// Run with: node --test src/awakyn/basePathLinks.test.ts
import assert from "node:assert/strict";
import { test } from "node:test";

import { pathInsideApp, pathWithinApp } from "./basePathLinks.ts";

const BASE = "/community-app";

test("Stoat's own fixed links are moved inside the app", () => {
  assert.equal(pathInsideApp("/login/auth", BASE), "/community-app/login/auth");
  assert.equal(pathInsideApp("/app", BASE), "/community-app/app");
  assert.equal(pathInsideApp("/server/abc/channel/def", BASE), "/community-app/server/abc/channel/def");
  assert.equal(pathInsideApp("/invite/7QgvnPYT", BASE), "/community-app/invite/7QgvnPYT");
});

test("links already inside the app are left alone", () => {
  assert.equal(pathInsideApp("/community-app/app", BASE), null);
  assert.equal(pathInsideApp("/community-app", BASE), null);
});

test("links to the rest of the website are left alone", () => {
  assert.equal(pathInsideApp("/community", BASE), null);
  assert.equal(pathInsideApp("/meals", BASE), null);
  assert.equal(pathInsideApp("/", BASE), null);
  assert.equal(pathInsideApp("/application-form", BASE), null);
});

test("nothing changes when the app is served from the site root", () => {
  assert.equal(pathInsideApp("/login/auth", ""), null);
});

test("the page to return to after signing in is remembered without the app's folder", () => {
  assert.equal(pathWithinApp("/community-app/channel/abc", "/community-app"), "/channel/abc");
  assert.equal(pathWithinApp("/community-app", "/community-app"), "/");
  assert.equal(pathWithinApp("/channel/abc", ""), "/channel/abc");
  assert.equal(pathWithinApp("/channel/abc", "/community-app"), "/channel/abc");
});
