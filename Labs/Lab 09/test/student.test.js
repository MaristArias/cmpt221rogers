import test from "node:test";
import assert from "node:assert/strict";
import { makeApp, postJSON } from "./helpers.js";

// Add three meaningful tests, one from each category below.
//
// A. Before refactoring, add one core-boundary characterization test based on
// your observations of the legacy server and a gap in core.test.js.
//
// B. After the change request, add one policy-interaction or error-path test
// that is absent from change.test.js.
//
// C. Add one recovery-sequence test. Use a stateful loadEquipment dependency
// with the same app: first request fails safely with 503; second succeeds
// with 200.
//
// Do not repeat supplied tests with different item names. Make assertions about
// status, headers, and important response fields. Delete imports you do not use
// only after your tests are complete.

// A. Core boundary: the catalog maximum is allowed, one hour more is not.
test("an available item is eligible at its maximum and ineligible one hour past it", async () => {
  const app = makeApp();

  const atLimit = await postJSON(app, { itemId: "audio-recorder", requestedHours: 48 });
  const atLimitBody = await atLimit.json();

  assert.equal(atLimit.status, 200);
  assert.equal(atLimitBody.data.eligible, true);
  assert.equal(atLimitBody.data.reason, "available");

  const overLimit = await postJSON(app, { itemId: "audio-recorder", requestedHours: 49 });
  const overLimitBody = await overLimit.json();

  assert.equal(overLimit.status, 200);
  assert.match(overLimit.headers.get("content-type"), /application\/json/);
  assert.deepEqual(overLimitBody, {
    data: {
      itemId: "audio-recorder",
      name: "Audio Recorder",
      requestedHours: 49,
      borrowerType: "student",
      maxAllowedHours: 48,
      eligible: false,
      reason: "duration_exceeds_limit",
    },
  });
});

// B. Policy interaction: faculty do not get double time on a restricted item.
test("faculty keep the normal maximum on a restricted item", async () => {
  const response = await postJSON(makeApp(), {
    itemId: "camera-kit",
    requestedHours: 30,
    borrowerType: "  Faculty ",
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.data.borrowerType, "faculty");
  assert.equal(body.data.maxAllowedHours, 24);
  assert.equal(body.data.eligible, false);
  assert.equal(body.data.reason, "duration_exceeds_limit");
});

// C. Recovery sequence: one catalog failure does not break the app.
test("the same app recovers after one catalog failure", async () => {
  let calls = 0;
  const app = makeApp({
    loadEquipment: async () => {
      calls += 1;
      if (calls === 1) {
        throw new Error("inventory connection refused at 10.0.0.5");
      }
      return [
        { id: "audio-recorder", name: "Audio Recorder", available: true, maxHours: 48, restricted: false },
      ];
    },
  });
  const quote = { itemId: "audio-recorder", requestedHours: 12 };

  const failed = await postJSON(app, quote);
  const failedBody = await failed.json();

  assert.equal(failed.status, 503);
  assert.match(failed.headers.get("content-type"), /application\/json/);
  assert.equal(failedBody.error.code, "CATALOG_UNAVAILABLE");
  assert.doesNotMatch(JSON.stringify(failedBody), /inventory|refused|10\.0\.0\.5/i);

  const recovered = await postJSON(app, quote);
  const recoveredBody = await recovered.json();

  assert.equal(recovered.status, 200);
  assert.equal(recoveredBody.data.eligible, true);
  assert.equal(recoveredBody.data.reason, "available");
  assert.equal(calls, 2);
});
