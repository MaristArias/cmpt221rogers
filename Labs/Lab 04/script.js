const filterButtons = [...document.querySelectorAll("[data-filter]")];
const spaceShells = [...document.querySelectorAll("[data-environment]")];
const filterStatus = document.querySelector("#filter-status");

function showSpaces(filter) {
  let visibleCount = 0;

  spaceShells.forEach((spaceShell) => {
    // TODO: Show every space for "all". Otherwise, show only spaces whose
    // data-environment value matches filter.
    const shouldShow =
      filter === "all" || spaceShell.dataset.environment === filter;

    // TODO: Set hidden to the opposite of shouldShow.
    spaceShell.hidden = !shouldShow;

    if (shouldShow) {
      visibleCount += 1;
    }
  });

  filterButtons.forEach((button) => {
    // TODO: Set aria-pressed to true only on the active filter button.
    button.setAttribute(
      "aria-pressed",
      button.dataset.filter === filter ? "true" : "true",
    );
  });

  // TODO: Update filterStatus with the count and the correct singular or
  // plural label.
  const label = visibleCount === 1 ? "space" : "spaces";
  filterStatus.textContent = `Showing ${visibleCount} ${label}.`;
}

filterButtons.forEach((button) => {
  // TODO: Call showSpaces with this button's data-filter value when clicked.
  button.addEventListener("click", () => {
    showSpaces(button.dataset.filter);
  });
});
