import express from "express";
import { loadEquipment } from "./catalog.js";

const app = express();
app.use(express.json());

app.post("/api/loan-quotes", async (req, res) => {
  const itemId = typeof req.body?.itemId === "string"
    ? req.body.itemId.trim().toLowerCase()
    : "";
  const requestedHours = req.body?.requestedHours;

  if (!itemId || !Number.isInteger(requestedHours) || requestedHours < 1 || requestedHours > 168) {
    res.status(400).json({ error: "Invalid itemId or requestedHours." });
    return;
  }

  try {
    const equipment = await loadEquipment();
    const item = equipment.find((record) => record.id === itemId);

    if (!item) {
      res.status(404).json({ error: "Equipment item not found." });
      return;
    }

    const eligible = item.available && requestedHours <= item.maxHours;
    const reason = !item.available
      ? "unavailable"
      : requestedHours > item.maxHours
        ? "duration_exceeds_limit"
        : "available";

    res.status(200).json({
      data: {
        itemId: item.id,
        name: item.name,
        requestedHours,
        borrowerType: "student",
        maxAllowedHours: item.maxHours,
        eligible,
        reason,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3211, "127.0.0.1", () => {
  console.log("Legacy equipment API: http://127.0.0.1:3211/api/loan-quotes");
});
