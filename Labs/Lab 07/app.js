import { readConfig } from "./config.js";
import { loadSnapshot } from "./data.js";
import { selectDepartures, formatReport } from "./report.js";

async function main() {
  const config = readConfig();
  const snapshot = await loadSnapshot();
  const selection = selectDepartures(snapshot.departures, config);
  console.log(formatReport(snapshot, selection));
}

try {
  await main();
} catch (error) {
  console.error("Departure report failed:", error.message);
  process.exitCode = 1;
}
