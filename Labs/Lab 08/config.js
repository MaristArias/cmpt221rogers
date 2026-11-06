function readInteger(name, fallback, minimum, maximum) {
  const value = Number(process.env[name] ?? fallback);

  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(
      `${name} must be an integer from ${minimum} through ${maximum}.`
    );
  }

  return value;
}

export function readConfig() {
  const providerURL = (
    process.env.PROVIDER_URL ??
    "http://127.0.0.1:4200/vendor/occupancy"
  ).trim();

  if (!providerURL) {
    throw new Error("PROVIDER_URL must not be empty.");
  }

  return {
    host: "127.0.0.1",
    port: readInteger("PORT", "3200", 1, 65535),
    providerURL,
    providerTimeoutMs: readInteger(
      "PROVIDER_TIMEOUT_MS",
      "750",
      50,
      10000
    ),
  };
}
