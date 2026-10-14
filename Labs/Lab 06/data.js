export async function loadReadings(url = "./data/readings.json") {
  // TODO: Await fetch(url), reject non-successful HTTP responses,
  // await the JSON body, and return the parsed payload.
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}.`);
  }

  const payload = await response.json();
  return payload;
}
