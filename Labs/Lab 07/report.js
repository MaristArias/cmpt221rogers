export function selectDepartures(departures, { route, maxMinutes, limit }) {
  // TODO: Filter by route and maximum wait, sort by shortest wait,
  // apply the limit, and return { visible, total }.
  const matches = departures.filter((departure) => {
    const routeMatches = route === "all" || departure.route.toLowerCase() === route;
    return routeMatches && departure.minutes <= maxMinutes;
  });

  matches.sort((a, b) => a.minutes - b.minutes);

  return {
    visible: matches.slice(0, limit),
    total: matches.length
  };
}

export function formatReport(snapshot, { visible, total }) {
  // TODO: Return one formatted string containing the heading, snapshot time,
  // departure lines or the empty message, and the displayed/matching count.
  const lines = ["Campus departure board.", `Snapshot time: ${snapshot.updatedAt}`];

  if (total === 0) {
    lines.push("No matching departures.");
    return lines.join("\n");
  }

  visible.forEach((departure) => {
    lines.push(
      `- ${departure.route} → ${departure.destination}: ` +
      `${formatWait(departure.minutes)} (${departure.status})`
    );
  });

  lines.push(`Showing ${visible.length} of ${total} matching departures.`);

  return lines.join("\n");
}

function formatWait(minutes) {
  return minutes === 0 ? "due now" : `${minutes} min`;
}
