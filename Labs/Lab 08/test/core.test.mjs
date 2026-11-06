import test from "node:test";
import assert from "node:assert/strict";
import { request, readJSON, assertErrorShape } from "./helpers.mjs";

test("default request returns the transformed application contract", async () => {
  const response = await request("/api/study-spaces");
  assert.equal(response.status, 200);
  const payload = await readJSON(response);

  assert.equal(payload.data.length, 5);
  assert.equal(payload.meta.count, 5);
  assert.equal(typeof payload.meta.updatedAt, "string");
  assert.equal(payload.meta.filters.zone, "all");

  for (const space of payload.data) {
    assert.deepEqual(
      Object.keys(space).sort(),
      ["availableSeats", "environment", "id", "name", "zone"]
    );
    assert.equal(typeof space.id, "string");
    assert.equal(typeof space.name, "string");
    assert.equal(typeof space.zone, "string");
    assert.equal(typeof space.availableSeats, "number");
    assert.equal(typeof space.environment, "string");
  }
});

test("zone filtering is case-insensitive after trimming", async () => {
  const response = await request("/api/study-spaces?zone=%20NORTH%20");
  assert.equal(response.status, 200);
  const payload = await readJSON(response);

  assert.equal(payload.data.length, 2);
  assert.ok(payload.data.every((space) => space.zone === "north"));
  assert.equal(payload.meta.filters.zone, "north");
});

test("a valid zone with no matches is a successful empty response", async () => {
  const response = await request("/api/study-spaces?zone=east");
  assert.equal(response.status, 200);
  const payload = await readJSON(response);

  assert.deepEqual(payload.data, []);
  assert.equal(payload.meta.count, 0);
});

test("a blank zone is invalid application input", async () => {
  const response = await request("/api/study-spaces?zone=");
  assert.equal(response.status, 400);
  assertErrorShape(await readJSON(response));
});

test("a known endpoint rejects an unsupported method", async () => {
  const response = await request("/api/study-spaces", { method: "POST" });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "GET");
  assertErrorShape(await readJSON(response));
});

test("an unknown API endpoint returns JSON 404", async () => {
  const response = await request("/api/missing");
  assert.equal(response.status, 404);
  assertErrorShape(await readJSON(response));
});
