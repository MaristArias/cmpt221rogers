/*
 * Input validation.
 *
 * Reads the untrusted JSON body and returns plain application values.
 * Runs before the catalog is loaded, so bad input never costs a lookup.
 */

import { invalidInput } from "./errors.js";

export const BORROWER_TYPES = ["student", "faculty"];
const MIN_HOURS = 1;
const MAX_HOURS = 168;

export function readQuoteRequest(body) {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    throw invalidInput("The request body must be a JSON object.");
  }

  const itemId = typeof body.itemId === "string"
    ? body.itemId.trim().toLowerCase()
    : "";

  if (!itemId) {
    throw invalidInput("itemId is required.");
  }

  const { requestedHours } = body;

  if (
    !Number.isInteger(requestedHours) ||
    requestedHours < MIN_HOURS ||
    requestedHours > MAX_HOURS
  ) {
    throw invalidInput(
      `requestedHours must be a whole number from ${MIN_HOURS} to ${MAX_HOURS}.`
    );
  }

  return {
    itemId,
    requestedHours,
    borrowerType: readBorrowerType(body.borrowerType),
  };
}

function readBorrowerType(raw) {
  // Missing means student, so old clients keep working.
  if (raw === undefined) return "student";

  const borrowerType = typeof raw === "string" ? raw.trim().toLowerCase() : "";

  if (!BORROWER_TYPES.includes(borrowerType)) {
    throw invalidInput(`borrowerType must be one of: ${BORROWER_TYPES.join(", ")}.`);
  }

  return borrowerType;
}
