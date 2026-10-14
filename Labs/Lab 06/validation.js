export function updateLabelValidity(control) {
  // TODO: Set an error if the trimmed label contains fewer than 3 characters.
  // Clear the custom error when valid.
  if (control.value.trim().length < 3) {
    control.setCustomValidity("Use at least 3 characters that are not spaces.");
  } else {
    control.setCustomValidity("");
  }
}
