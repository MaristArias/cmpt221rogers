import { loadReadings } from "./data.js";
import { updateLabelValidity } from "./validation.js";

const form = document.querySelector("#save-form");
const sensorSelect = document.querySelector("#sensor");
const labelControl = document.querySelector("#label");
const saveButton = document.querySelector("#save");
const refreshButton = document.querySelector("#refresh");
const dataStatus = document.querySelector("#data-status");
const saveStatus = document.querySelector("#save-status");
const updated = document.querySelector("#updated");
const readingsList = document.querySelector("#readings");
const watchlistList = document.querySelector("#watchlist");
const watchlistHeading = document.querySelector("#watchlist-heading");

let readings = [];
let savedItems = [];

function setStatus(element, message, state = "") {
  element.textContent = message;
  element.dataset.state = state;
}

function renderReadings(payload) {
  readingsList.replaceChildren();
  sensorSelect.replaceChildren();
  const prompt = document.createElement("option");
  prompt.value = "";
  prompt.textContent = readings.length ? "Choose a sensor" : "No readings available";
  sensorSelect.append(prompt);

  readings.forEach((reading) => {
    const item = document.createElement("li");
    item.textContent = `${reading.location}: ${reading.temperatureC} °C`;
    readingsList.append(item);

    const option = document.createElement("option");
    option.value = reading.id;
    option.textContent = reading.location;
    sensorSelect.append(option);
  });

  updated.textContent = `Data updated: ${new Date(payload.updatedAt).toLocaleString()}`;
}

function renderWatchlist() {
  watchlistList.replaceChildren();
  if (savedItems.length === 0) {
    const item = document.createElement("li");
    item.textContent = "No saved readings yet.";
    watchlistList.append(item);
    return;
  }

  savedItems.forEach((saved) => {
    const item = document.createElement("li");
    const text = document.createElement("span");
    text.textContent = `${saved.label} — ${saved.location}: ${saved.temperatureC} °C (saved snapshot)`;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Remove";
    remove.setAttribute("aria-label", `Remove ${saved.label} from watchlist`);
    remove.addEventListener("click", () => {
      savedItems = savedItems.filter((entry) => entry.sensorId !== saved.sensorId);
      renderWatchlist();
      watchlistHeading.focus();
      setStatus(saveStatus, `Removed ${saved.label}.`);
    });
    item.append(text, remove);
    watchlistList.append(item);
  });
}

async function refreshReadings() {
  sensorSelect.disabled = true;
  saveButton.disabled = true;
  refreshButton.disabled = true;
  setStatus(dataStatus, "Loading readings…");

  try {
    // TODO: Await loadReadings(), store payload.readings in readings,
    // and call renderReadings(payload).
    const payload = await loadReadings();
    readings = payload.readings;
    renderReadings(payload);

    // TODO: Enable the select and Save only if readings are available.
    // Report a loaded count or an empty-results message.
    if (readings.length > 0) {
      sensorSelect.disabled = false;
      saveButton.disabled = false;
      const label = readings.length === 1 ? "reading" : "readings";
      setStatus(dataStatus, `Loaded ${readings.length} ${label}.`, "success");
    } else {
      setStatus(dataStatus, "No readings are available right now.");
    }
  } catch (error) {
    console.error(error);
    // TODO: Clear readings and old results, replace the select with an
    // unavailable option, clear updated, and display useful error feedback.
    // The select and Save must remain disabled.
    readings = [];
    readingsList.replaceChildren();
    sensorSelect.replaceChildren();
    const unavailable = document.createElement("option");
    unavailable.value = "";
    unavailable.textContent = "Readings unavailable";
    sensorSelect.append(unavailable);
    updated.textContent = "";
    setStatus(dataStatus, `Could not load readings. ${error.message}`, "error");
  } finally {
    refreshButton.disabled = false;
  }
}

form.addEventListener("submit", (event) => {
  // TODO: Prevent the default submission and update custom label validity.
  event.preventDefault();
  updateLabelValidity(labelControl);

  // TODO: Check validity; report errors and return before saving.
  if (!form.checkValidity()) {
    setStatus(saveStatus, "Fix the highlighted fields before saving.", "error");
    form.reportValidity();
    return;
  }

  // TODO: Read FormData, then find the reading matching values.sensorId.
  // If there is no matching reading, show an error and focus the select.
  const values = Object.fromEntries(new FormData(form));
  const match = readings.find((reading) => reading.id === values.sensorId);

  if (!match) {
    setStatus(saveStatus, "Choose a sensor from the list.", "error");
    sensorSelect.focus();
    return;
  }

  // TODO: Reject an already-saved sensor with some(), show feedback,
  // and focus the select.
  if (savedItems.some((entry) => entry.sensorId === match.id)) {
    setStatus(saveStatus, `${match.location} is already on your watchlist.`, "error");
    sensorSelect.focus();
    return;
  }

  // TODO: Push a record with sensorId, trimmed label, location, temperatureC.
  // Rerender the watchlist, reset the form, clear custom validity,
  // focus the label control, and announce success.
  const label = values.label.trim();

  savedItems.push({
    sensorId: match.id,
    label: label,
    location: match.location,
    temperatureC: match.temperatureC
  });

  renderWatchlist();
  form.reset();
  labelControl.setCustomValidity("");
  labelControl.focus();
  setStatus(saveStatus, `Saved ${label}.`, "success");
});
labelControl.addEventListener("input", () => updateLabelValidity(labelControl));
refreshButton.addEventListener("click", refreshReadings);
renderWatchlist();
refreshReadings();
