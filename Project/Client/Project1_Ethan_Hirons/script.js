const LABELS = {
  clear: "Clear",
  cloudy: "Cloudy",
  rain: "Rain",
  storm: "Storm",
  snow: "Snow",
};
const ICONS = { clear: "☀", cloudy: "☁", rain: "☂", storm: "⚡", snow: "❄" };
const SORTERS = {
  name: (a, b) => a.name.localeCompare(b.name),
  "temp-desc": (a, b) => b.temperatureC - a.temperatureC,
  "temp-asc": (a, b) => a.temperatureC - b.temperatureC,
  "precip-desc": (a, b) => b.precipChance - a.precipChance,
  "wind-desc": (a, b) => b.windKph - a.windKph,
};

const state = { index: 0, snapshot: null, saved: [] };
const $ = (id) => document.getElementById(id);

function el(tag, { data, ...props } = {}, ...children) {
  const node = Object.assign(document.createElement(tag), props);
  Object.assign(node.dataset, data);
  node.append(...children);
  return node;
}

function fetchSnapshot(index, shouldFail) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) return reject(new Error("Data source unavailable"));
      resolve(
        window.WEATHER_SNAPSHOTS[index % window.WEATHER_SNAPSHOTS.length],
      );
    }, 900);
  });
}

const units = () => document.querySelector('input[name="units"]:checked').value;
const temp = (c) =>
  Math.round(units() === "F" ? (c * 9) / 5 + 32 : c) + "°" + units();
const formatDate = (iso) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
const isSaved = (id) => state.saved.some((s) => s.locationId === id);
const findLocation = (id) => state.snapshot?.locations.find((l) => l.id === id);

function announce(message) {
  $("status").textContent = "";
  setTimeout(() => ($("status").textContent = message), 50);
}

function visibleLocations() {
  if (!state.snapshot) return [];
  const term = $("search-input").value.trim().toLowerCase();
  const condition = $("condition-select").value;
  return state.snapshot.locations
    .filter((l) => (l.name + " " + l.region).toLowerCase().includes(term))
    .filter((l) => condition === "all" || l.condition === condition)
    .sort(SORTERS[$("sort-select").value]);
}

function createCard(l) {
  const saved = isSaved(l.id);
  const fact = (term, value) => [
    el("dt", { textContent: term }),
    el("dd", { textContent: value }),
  ];
  return el(
    "li",
    { className: "card" + (saved ? " is-saved" : "") },
    el(
      "div",
      { className: "card-top" },
      el(
        "div",
        {},
        el("h3", { textContent: l.name }),
        el("p", { className: "region", textContent: l.region }),
      ),
      el("p", { className: "temp", textContent: temp(l.temperatureC) }),
    ),
    el("p", {
      className: "badge " + l.condition,
      textContent: ICONS[l.condition] + " " + LABELS[l.condition],
    }),
    el(
      "dl",
      { className: "facts" },
      ...fact("Feels like", temp(l.feelsLikeC)),
      ...fact("Wind", l.windKph + " km/h"),
      ...fact("Humidity", l.humidity + "%"),
      ...fact("Chance of rain", l.precipChance + "%"),
    ),
    el(
      "div",
      { className: "card-actions" },
      el("button", {
        type: "button",
        className: saved ? "secondary" : "",
        textContent: (saved ? "Remove " : "Save ") + l.name,
        data: { action: saved ? "remove" : "save", id: l.id },
      }),
    ),
  );
}

function createSavedItem(entry) {
  const l = findLocation(entry.locationId);
  const name = l ? l.name : entry.locationId;
  return el(
    "li",
    { className: "saved-item" },
    el("h3", { textContent: name }),
    el("p", {
      className: "region",
      textContent: l ? temp(l.temperatureC) + ", " + LABELS[l.condition] : "",
    }),
    el(
      "div",
      { className: "note-field" },
      el("label", {
        htmlFor: "note-" + entry.locationId,
        textContent: "Note for " + name,
      }),
      el("textarea", {
        id: "note-" + entry.locationId,
        value: entry.note,
        data: { id: entry.locationId },
      }),
    ),
    el(
      "div",
      { className: "button-row" },
      el("button", {
        type: "button",
        className: "secondary",
        textContent: "Remove",
        data: { action: "remove", id: entry.locationId },
      }),
    ),
  );
}

function renderResults() {
  const list = visibleLocations();
  $("results-list").replaceChildren(...list.map(createCard));
  $("empty-state").hidden = !state.snapshot || list.length > 0;
  $("result-count").textContent = state.snapshot
    ? `Showing ${list.length} of ${state.snapshot.locations.length} cities`
    : "";
}

function render() {
  const snapshot = state.snapshot;
  $("last-updated").textContent = snapshot
    ? formatDate(snapshot.updatedAt)
    : "Not loaded yet";
  $("stale-note").hidden = !snapshot?.stale;
  renderResults();
  $("saved-list").replaceChildren(...state.saved.map(createSavedItem));
  $("saved-empty").hidden = state.saved.length > 0;
}

function loadData(index, shouldFail) {
  const buttons = [$("refresh-button"), $("error-button")];
  let failed = false;
  $("loading-state").hidden = false;
  $("error-state").hidden = true;
  $("empty-state").hidden = true;
  $("results-list").hidden = true;
  buttons.forEach((b) => (b.disabled = true));
  announce("Loading the latest conditions.");

  return fetchSnapshot(index, shouldFail)
    .then((snapshot) => {
      state.snapshot = snapshot;
      state.index = index;
    })
    .catch(() => (failed = true))
    .finally(() => {
      $("loading-state").hidden = true;
      $("results-list").hidden = failed;
      $("error-state").hidden = !failed;
      buttons.forEach((b) => (b.disabled = false));
      render();
      if (failed) {
        $("empty-state").hidden = true;
        $("result-count").textContent = "";
        announce("Error. Could not load conditions.");
      } else {
        announce(
          "Conditions updated. " + formatDate(state.snapshot.updatedAt) + ".",
        );
      }
    });
}

function handleAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const id = button.dataset.id;
  const saving = button.dataset.action === "save";
  if (saving) {
    state.saved.push({
      locationId: id,
      note: "",
      savedAt: new Date().toISOString(),
    });
  } else {
    state.saved = state.saved.filter((s) => s.locationId !== id);
  }
  announce(
    findLocation(id).name +
      (saving ? " saved." : " removed from saved cities."),
  );
  render();
  (
    document.querySelector(`#results-list button[data-id="${id}"]`) ||
    $("refresh-button")
  ).focus();
}

$("refresh-button").addEventListener("click", () =>
  loadData((state.index + 1) % window.WEATHER_SNAPSHOTS.length, false),
);
$("error-button").addEventListener("click", () => loadData(state.index, true));
$("retry-button").addEventListener("click", () => loadData(state.index, false));
$("clear-filters-button").addEventListener("click", () => {
  $("search-input").value = "";
  $("condition-select").value = "all";
  renderResults();
  announce("Search and filter cleared.");
  $("search-input").focus();
});
$("controls").addEventListener("submit", (event) => event.preventDefault());
$("controls").addEventListener("input", () => {
  render();
  const count = visibleLocations().length;
  announce(count + (count === 1 ? " city shown." : " cities shown."));
});
$("results-list").addEventListener("click", handleAction);
$("saved-list").addEventListener("click", handleAction);
$("saved-list").addEventListener("input", (event) => {
  const entry = state.saved.find(
    (s) => s.locationId === event.target.dataset.id,
  );
  if (entry) entry.note = event.target.value;
});

loadData(0, false);
