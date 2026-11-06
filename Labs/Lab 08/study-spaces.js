export class AdapterError extends Error {
  constructor(status, code, message, detail) {
    super(message);
    this.name = "AdapterError";
    this.status = status;
    this.code = code;
    this.detail = detail ?? message;
  }
}

export function readFilters(url) {
  return {
    zone: readZone(url.searchParams.get("zone")),
    minSeats: readMinSeats(url.searchParams.get("minSeats")),
  };
}

function readZone(raw) {
  if (raw === null) return "all";

  const zone = raw.trim().toLowerCase();

  if (zone === "") {
    throw new AdapterError(
      400,
      "INVALID_ZONE",
      "The zone filter must not be blank.",
    );
  }

  return zone;
}

function readMinSeats(raw) {
  if (raw === null) return 0;

  const text = raw.trim();

  if (text === "") {
    throw new AdapterError(
      400,
      "INVALID_MIN_SEATS",
      "The minimum seats filter must not be blank.",
    );
  }

  const value = Number(text);

  if (!Number.isInteger(value) || value < 0) {
    throw new AdapterError(
      400,
      "INVALID_MIN_SEATS",
      "The minimum seats filter must be a whole number of 0 or more.",
    );
  }

  return value;
}

export async function loadSpaces(config) {
  const payload = await requestProvider(config);
  return readSnapshot(payload);
}

async function requestProvider(config) {
  let response;

  try {
    response = await fetch(config.providerURL, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(config.providerTimeoutMs),
    });
  } catch (error) {
    const timedOut =
      error.name === "TimeoutError" || error.name === "AbortError";

    throw new AdapterError(
      502,
      "PROVIDER_UNAVAILABLE",
      "Study-space data is temporarily unavailable.",
      timedOut
        ? `Provider did not respond within ${config.providerTimeoutMs} ms.`
        : `Provider request failed: ${error.message}`,
    );
  }

  if (!response.ok) {
    throw new AdapterError(
      502,
      "PROVIDER_UNAVAILABLE",
      "Study-space data is temporarily unavailable.",
      `Provider responded with status ${response.status}.`,
    );
  }

  try {
    return await response.json();
  } catch (error) {
    throw new AdapterError(
      502,
      "PROVIDER_UNAVAILABLE",
      "Study-space data is temporarily unavailable.",
      `Provider body was not valid JSON: ${error.message}`,
    );
  }
}

function readSnapshot(payload) {
  if (
    payload === null ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    throw providerSchemaError("Provider payload was not an object.");
  }

  if (!isFilledString(payload.generated_at)) {
    throw providerSchemaError("Provider generated_at was missing or empty.");
  }

  if (!Array.isArray(payload.spaces)) {
    throw providerSchemaError("Provider spaces was not an array.");
  }

  return {
    updatedAt: payload.generated_at,
    spaces: payload.spaces.map(toApplicationSpace),
  };
}

function toApplicationSpace(record, index) {
  if (record === null || typeof record !== "object" || Array.isArray(record)) {
    throw providerSchemaError(`Provider record ${index} was not an object.`);
  }

  const strings = {
    id: record.space_code,
    name: record.display_name,
    zone: record.campus_zone,
    environment: record.sound_profile,
  };

  for (const [field, value] of Object.entries(strings)) {
    if (!isFilledString(value)) {
      throw providerSchemaError(
        `Provider record ${index} was missing a usable value for ${field}.`,
      );
    }
  }

  if (!Number.isInteger(record.seats_open) || record.seats_open < 0) {
    throw providerSchemaError(
      `Provider record ${index} had an unusable seats_open value.`,
    );
  }

  return {
    id: strings.id,
    name: strings.name,
    zone: strings.zone.toLowerCase(),
    availableSeats: record.seats_open,
    environment: strings.environment,
  };
}

function isFilledString(value) {
  return typeof value === "string" && value.trim() !== "";
}

function providerSchemaError(detail) {
  return new AdapterError(
    502,
    "PROVIDER_UNAVAILABLE",
    "Study-space data is temporarily unavailable.",
    detail,
  );
}

export function selectSpaces(spaces, { zone, minSeats }) {
  const matches = spaces.filter((space) => {
    const zoneMatches = zone === "all" || space.zone === zone;
    return zoneMatches && space.availableSeats >= minSeats;
  });

  matches.sort((a, b) => b.availableSeats - a.availableSeats);

  return matches;
}
