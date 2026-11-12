/*
 * Loan decision service.
 *
 * Works only with application values. It never sees req or res, so it can
 * be tested and reused without Express. The borrower policy lives here.
 */

import { catalogUnavailable, itemNotFound } from "./errors.js";

export function createLoanService({ loadEquipment }) {
  if (typeof loadEquipment !== "function") {
    throw new TypeError("createLoanService requires a loadEquipment function.");
  }

  return {
    async quote({ itemId, requestedHours, borrowerType }) {
      const equipment = await loadCatalog(loadEquipment);
      const item = equipment.find((record) => record.id === itemId);

      if (!item) throw itemNotFound();

      return decideLoan(item, requestedHours, borrowerType);
    },
  };
}

async function loadCatalog(loadEquipment) {
  let equipment;

  try {
    equipment = await loadEquipment();
  } catch (error) {
    throw catalogUnavailable(error);
  }

  if (!Array.isArray(equipment)) {
    throw catalogUnavailable(new Error("Catalog did not return an array."));
  }

  return equipment;
}

// Faculty get double time, except on restricted items.
export function maxHoursFor(item, borrowerType) {
  if (borrowerType === "faculty" && !item.restricted) {
    return item.maxHours * 2;
  }
  return item.maxHours;
}

export function decideLoan(item, requestedHours, borrowerType) {
  const maxAllowedHours = maxHoursFor(item, borrowerType);

  let reason = "available";
  if (!item.available) {
    reason = "unavailable";
  } else if (requestedHours > maxAllowedHours) {
    reason = "duration_exceeds_limit";
  }

  return {
    itemId: item.id,
    name: item.name,
    requestedHours,
    borrowerType,
    maxAllowedHours,
    eligible: reason === "available",
    reason,
  };
}
