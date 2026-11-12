import test from "node:test";
import assert from "node:assert/strict";
import { makeApp, postJSON } from "./helpers.js";

test("faculty receive twice the normal duration for nonrestricted items", async () => {
  const response = await postJSON(makeApp(), {
    itemId: "audio-recorder",
    requestedHours: 72,
    borrowerType: "faculty",
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.data.borrowerType, "faculty");
  assert.equal(body.data.maxAllowedHours, 96);
  assert.equal(body.data.eligible, true);
});

test("invalid borrower types return 400 before catalog loading", async () => {
  let loadCalls = 0;
  const app = makeApp({
    loadEquipment: async () => {
      loadCalls += 1;
      return [];
    },
  });
  const response = await postJSON(app, {
    itemId: "audio-recorder",
    requestedHours: 4,
    borrowerType: "visitor",
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.error.code, "INVALID_INPUT");
  assert.equal(loadCalls, 0);
});
