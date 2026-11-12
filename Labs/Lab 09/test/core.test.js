import test from "node:test";
import assert from "node:assert/strict";
import { makeApp, postJSON, request } from "./helpers.js";

test("an available item within the limit returns an eligible quote", async () => {
  const response = await postJSON(makeApp(), {
    itemId: "audio-recorder",
    requestedHours: 12,
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /application\/json/);
  assert.deepEqual(body, {
    data: {
      itemId: "audio-recorder",
      name: "Audio Recorder",
      requestedHours: 12,
      borrowerType: "student",
      maxAllowedHours: 48,
      eligible: true,
      reason: "available",
    },
  });
});

test("an unavailable item is a successful ineligible decision", async () => {
  const response = await postJSON(makeApp(), {
    itemId: "tripod",
    requestedHours: 4,
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.data.eligible, false);
  assert.equal(body.data.reason, "unavailable");
});

test("invalid input returns 400 before catalog loading", async () => {
  let loadCalls = 0;
  const app = makeApp({
    loadEquipment: async () => {
      loadCalls += 1;
      return [];
    },
  });
  const response = await postJSON(app, { itemId: "", requestedHours: 0 });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.error.code, "INVALID_INPUT");
  assert.equal(loadCalls, 0);
});

test("an unknown item returns 404", async () => {
  const response = await postJSON(makeApp(), {
    itemId: "missing-item",
    requestedHours: 4,
  });
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.error.code, "ITEM_NOT_FOUND");
});

test("unsupported methods return 405 with Allow POST", async () => {
  const response = await request(makeApp(), "/api/loan-quotes");
  const body = await response.json();

  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "POST");
  assert.equal(body.error.code, "METHOD_NOT_ALLOWED");
});

test("unknown API routes return JSON 404", async () => {
  const response = await request(makeApp(), "/api/missing");
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.match(response.headers.get("content-type"), /application\/json/);
  assert.equal(body.error.code, "NOT_FOUND");
});

test("catalog failure returns a safe 503 response", async () => {
  const app = makeApp({
    loadEquipment: async () => {
      throw new Error("database password=secret");
    },
  });
  const response = await postJSON(app, {
    itemId: "audio-recorder",
    requestedHours: 4,
  });
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.equal(body.error.code, "CATALOG_UNAVAILABLE");
  assert.doesNotMatch(JSON.stringify(body), /password|secret|database/i);
});
