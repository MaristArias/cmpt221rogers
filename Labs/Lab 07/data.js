import { readFile } from "node:fs/promises";

export async function loadSnapshot() {
  // TODO: Resolve data/departures.json relative to this module.
  // Read it as UTF-8, parse it, validate the top-level snapshot,
  // and validate every departure before returning the snapshot.
  const path = new URL("./data/departures.json", import.meta.url);
  const text = await readFile(path, "utf8");
  const snapshot = JSON.parse(text);

  if (snapshot === null || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    throw new Error("Snapshot must be an object.");
  }

  if (!isFilledString(snapshot.updatedAt)) {
    throw new Error("Snapshot updatedAt must be a nonempty string.");
  }

  if (!Array.isArray(snapshot.departures)) {
    throw new Error("Snapshot departures must be an array.");
  }

  snapshot.departures.forEach((departure, index) => {
    validateDeparture(departure, index);
  });

  return snapshot;
}

function isFilledString(value) {
  return typeof value === "string" && value.trim() !== "";
}

function validateDeparture(departure, index) {
  const where = `Departure ${index}`;

  if (departure === null || typeof departure !== "object" || Array.isArray(departure)) {
    throw new Error(`${where} must be an object.`);
  }

  ["id", "route", "destination", "status"].forEach((field) => {
    if (!isFilledString(departure[field])) {
      throw new Error(`${where} needs a nonempty ${field}.`);
    }
  });

  if (!Number.isInteger(departure.minutes) || departure.minutes < 0) {
    throw new Error(`${where} needs minutes as a whole number of 0 or more.`);
  }
}
