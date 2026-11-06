import { createServer } from "node:http";

const host = "127.0.0.1";
const port = 4200;

const spaces = [
  { space_code: "L-NORTH-2", display_name: "North Library Quiet Floor", campus_zone: "north", seats_open: 18, sound_profile: "quiet" },
  { space_code: "I-CENTRAL-1", display_name: "Innovation Commons", campus_zone: "central", seats_open: 4, sound_profile: "collaborative" },
  { space_code: "S-SOUTH-3", display_name: "South Study Hall", campus_zone: "south", seats_open: 26, sound_profile: "quiet" },
  { space_code: "C-CENTRAL-2", display_name: "Student Center Lounge", campus_zone: "central", seats_open: 0, sound_profile: "social" },
  { space_code: "SCI-NORTH-1", display_name: "Science Lounge", campus_zone: "north", seats_open: 9, sound_profile: "collaborative" },
];

function sendJSON(response, status, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  response.end(body);
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  if (url.pathname !== "/vendor/occupancy") { sendJSON(response, 404, { vendor_message: "Unknown vendor route." }); return; }
  if (request.method !== "GET") { sendJSON(response, 405, { vendor_message: "Method not supported." }); return; }
  const mode = url.searchParams.get("mode");
  if (mode === "slow") { await new Promise((resolve) => setTimeout(resolve, 1500)); }
  if (mode === "error") { sendJSON(response, 503, { vendor_message: "Occupancy sensors are temporarily unavailable." }); return; }
  if (mode === "invalid") { sendJSON(response, 200, { generated_at: "2026-11-03T14:30:00-05:00", spaces: "sensor data unavailable" }); return; }
  sendJSON(response, 200, { generated_at: "2026-11-03T14:30:00-05:00", spaces });
});

server.listen(port, host, () => {
  console.log(`Simulated occupancy provider: http://${host}:${port}/vendor/occupancy`);
});
