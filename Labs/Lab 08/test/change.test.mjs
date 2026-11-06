import test from "node:test";
import assert from "node:assert/strict";
import { request, readJSON, assertErrorShape } from "./helpers.mjs";

test("minSeats filters results and results are ordered greatest-first", async () => {
  const response = await request("/api/study-spaces?minSeats=10");
  assert.equal(response.status, 200);
  const payload = await readJSON(response);

  assert.deepEqual(payload.data.map((space) => space.availableSeats), [26, 18]);
  assert.deepEqual(payload.meta.filters, { zone: "all", minSeats: 10 });
});

test("zone and minimum seats combine", async () => {
  const response = await request("/api/study-spaces?zone=central&minSeats=1");
  assert.equal(response.status, 200);
  const payload = await readJSON(response);

  assert.equal(payload.data.length, 1);
  assert.equal(payload.data[0].name, "Innovation Commons");
  assert.equal(payload.data[0].availableSeats, 4);
});

for (const value of ["-1", "2.5", "many", ""]) {
  test(`minSeats=${JSON.stringify(value)} returns 400`, async () => {
    const response = await request(
      `/api/study-spaces?minSeats=${encodeURIComponent(value)}`
    );
    assert.equal(response.status, 400);
    assertErrorShape(await readJSON(response));
  });
}
