import { createApp } from "../src/app.js";

export const fixture = [
  { id: "camera-kit", name: "Camera Kit", available: true, maxHours: 24, restricted: true },
  { id: "audio-recorder", name: "Audio Recorder", available: true, maxHours: 48, restricted: false },
  { id: "tripod", name: "Tripod", available: false, maxHours: 72, restricted: false },
  { id: "tablet", name: "Tablet", available: true, maxHours: 8, restricted: true },
];

export function makeApp(overrides = {}) {
  return createApp({
    loadEquipment: async () => fixture.map((item) => ({ ...item })),
    ...overrides,
  });
}

export async function request(app, path, options = {}) {
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const address = server.address();
  const origin = `http://127.0.0.1:${address.port}`;

  try {
    return await fetch(`${origin}${path}`, options);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
}

export function postJSON(app, body, headers = {}) {
  return request(app, "/api/loan-quotes", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}
