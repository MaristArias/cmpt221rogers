const form = document.querySelector("#filters");
const status = document.querySelector("#status");
const updated = document.querySelector("#updated");
const list = document.querySelector("#spaces");
const button = form.querySelector("button");

function renderSpaces(spaces) {
  list.replaceChildren();

  for (const space of spaces) {
    const item = document.createElement("li");
    const heading = document.createElement("h2");
    const details = document.createElement("p");

    heading.textContent = space.name;
    details.textContent =
      `${space.availableSeats} seats open · ${space.zone} · ${space.environment}`;

    item.append(heading, details);
    list.append(item);
  }
}

async function readError(response) {
  try {
    const payload = await response.json();
    return payload.error?.message ??
      `Request failed with status ${response.status}.`;
  } catch {
    return `Request failed with status ${response.status}.`;
  }
}

async function loadSpaces() {
  const query = new URLSearchParams(new FormData(form));

  status.textContent = "Loading study spaces…";
  updated.textContent = "";
  list.replaceChildren();
  button.disabled = true;

  try {
    const response = await fetch(`/api/study-spaces?${query}`, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(await readError(response));
    }

    const payload = await response.json();

    if (
      !Array.isArray(payload.data) ||
      !payload.meta ||
      typeof payload.meta.count !== "number"
    ) {
      throw new Error("The application server returned an invalid response.");
    }

    renderSpaces(payload.data);
    status.textContent = payload.meta.count === 0
      ? "No study spaces match these filters."
      : `${payload.meta.count} study spaces match these filters.`;
    updated.textContent = `Updated: ${payload.meta.updatedAt}`;
  } catch (error) {
    status.textContent = `Unable to load study spaces: ${error.message}`;
  } finally {
    button.disabled = false;
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  loadSpaces();
});

loadSpaces();
