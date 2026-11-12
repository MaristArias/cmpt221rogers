/*
 * Error boundary.
 *
 * Every known failure is an AppError with a status, a stable code, and a
 * message that is safe to show. The final middleware turns any error into
 * that same JSON shape. Internal details only go to the server log.
 */

export class AppError extends Error {
  constructor(status, code, message, options = {}) {
    super(message, options);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}

export function invalidInput(message) {
  return new AppError(400, "INVALID_INPUT", message);
}

export function itemNotFound() {
  return new AppError(404, "ITEM_NOT_FOUND", "Equipment item not found.");
}

export function catalogUnavailable(cause) {
  return new AppError(
    503,
    "CATALOG_UNAVAILABLE",
    "The equipment catalog is temporarily unavailable.",
    { cause }
  );
}

export function sendError(res, status, code, message) {
  res.status(status).json({ error: { code, message } });
}

// Turns any error into a stable public response.
export function errorHandler({ logError = console.error } = {}) {
  return (error, req, res, next) => {
    if (res.headersSent) {
      next(error);
      return;
    }

    // The JSON parser rejected the body before it reached the route.
    if (error.type === "entity.parse.failed") {
      sendError(res, 400, "INVALID_INPUT", "The request body must be valid JSON.");
      return;
    }

    if (error instanceof AppError) {
      if (error.cause) logError(`${error.code}:`, error.cause);
      sendError(res, error.status, error.code, error.message);
      return;
    }

    logError("Unexpected request failure:", error);
    sendError(res, 500, "INTERNAL_ERROR", "Unexpected server error.");
  };
}
