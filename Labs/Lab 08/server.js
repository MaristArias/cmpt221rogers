import { createServer } from "node:http";
import { readConfig } from "./config.js";
import { sendJSON, sendText, servePublicFile } from "./http-utils.js";
import {
  AdapterError,
  readFilters,
  loadSpaces,
  selectSpaces,
} from "./study-spaces.js";

const config = readConfig();

async function handleStudySpaces(request, response, url) {
  if (request.method !== "GET") {
    sendJSON(
      response,
      405,
      {
        error: {
          code: "METHOD_NOT_ALLOWED",
          message: "This endpoint only supports GET.",
        },
      },
      { Allow: "GET" },
    );
    return;
  }

  try {
    const filters = readFilters(url);
    const snapshot = await loadSpaces(config);
    const data = selectSpaces(snapshot.spaces, filters);

    sendJSON(response, 200, {
      data,
      meta: {
        count: data.length,
        updatedAt: snapshot.updatedAt,
        filters,
      },
    });
  } catch (error) {
    if (!(error instanceof AdapterError)) throw error;

    console.error(`Study-space request failed (${error.code}):`, error.detail);

    sendJSON(response, error.status, {
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(
    request.url ?? "/",
    `http://${request.headers.host ?? "localhost"}`,
  );

  try {
    if (url.pathname === "/api/study-spaces") {
      await handleStudySpaces(request, response, url);
      return;
    }

    if (url.pathname.startsWith("/api/")) {
      sendJSON(response, 404, {
        error: {
          code: "NOT_FOUND",
          message: "API route not found.",
        },
      });
      return;
    }

    if (request.method !== "GET") {
      sendText(response, 405, "Method not allowed.");
      return;
    }

    if (await servePublicFile(url.pathname, response)) return;
    sendText(response, 404, "Page not found.");
  } catch (error) {
    console.error("Unexpected request failure:", error);

    if (!response.headersSent) {
      sendJSON(response, 500, {
        error: {
          code: "INTERNAL_ERROR",
          message: "Unexpected server error.",
        },
      });
    } else {
      response.destroy();
    }
  }
});

server.listen(config.port, config.host, () => {
  console.log(`Study-space application: http://${config.host}:${config.port}`);
  console.log("Provider configured.");
});
