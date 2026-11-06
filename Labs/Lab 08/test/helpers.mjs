import assert from "node:assert/strict";

export const appURL = process.env.APP_URL ?? "http://127.0.0.1:3200";

export async function request(path, options) {
  try {
    return await fetch(appURL + path, options);
  } catch (error) {
    assert.fail(
      `Could not reach the application at ${appURL}. Start the provider and application before running tests. Original error: ${error.message}`
    );
  }
}

export async function readJSON(response) {
  assert.match(
    response.headers.get("content-type") ?? "",
    /^application\/json\b/,
    "API responses must use application/json."
  );
  return response.json();
}

export function assertErrorShape(payload) {
  assert.equal(typeof payload?.error?.code, "string");
  assert.equal(typeof payload?.error?.message, "string");
  assert.ok(payload.error.code.length > 0);
  assert.ok(payload.error.message.length > 0);
}
