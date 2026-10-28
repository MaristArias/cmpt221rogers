export function readConfig() {
  // TODO: Read LIMIT (default 4), ROUTE (default "all"), and
  // MAX_MINUTES (default 30) from process.env.
  // Convert and validate both numeric values. Normalize and validate the route.
  // Return { limit, route, maxMinutes }.
  const limit = readInteger("LIMIT", process.env.LIMIT, 4, 1);
  const maxMinutes = readInteger("MAX_MINUTES", process.env.MAX_MINUTES, 30, 0);
  const route = readRoute("ROUTE", process.env.ROUTE, "all");

  return { limit, route, maxMinutes };
}

function readInteger(name, raw, fallback, minimum) {
  if (raw === undefined) {
    return fallback;
  }

  const text = raw.trim();

  if (text === "") {
    throw new Error(`${name} must not be empty.`);
  }

  const value = Number(text);

  if (!Number.isInteger(value)) {
    throw new Error(`${name} must be a whole number. Received "${raw}".`);
  }

  if (value < minimum) {
    throw new Error(`${name} must be ${minimum} or greater. Received ${value}.`);
  }

  return value;
}

function readRoute(name, raw, fallback) {
  if (raw === undefined) {
    return fallback;
  }

  const route = raw.trim().toLowerCase();

  if (route === "") {
    throw new Error(`${name} must not be empty.`);
  }

  return route;
}
