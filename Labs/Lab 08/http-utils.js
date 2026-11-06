import { readFile } from "node:fs/promises";

const publicFiles = new Map([
  ["/", ["./public/index.html", "text/html; charset=utf-8"]],
  ["/app.js", ["./public/app.js", "text/javascript; charset=utf-8"]],
  ["/styles.css", ["./public/styles.css", "text/css; charset=utf-8"]],
]);

export function sendJSON(response, status, payload, headers = {}) {
  const body = JSON.stringify(payload);

  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
    ...headers,
  });
  response.end(body);
}

export function sendText(response, status, message) {
  const body = message + "\n";

  response.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  response.end(body);
}

export async function servePublicFile(pathname, response) {
  const descriptor = publicFiles.get(pathname);
  if (!descriptor) return false;

  const body = await readFile(new URL(descriptor[0], import.meta.url));

  response.writeHead(200, {
    "Content-Type": descriptor[1],
    "Content-Length": body.byteLength,
  });
  response.end(body);
  return true;
}
