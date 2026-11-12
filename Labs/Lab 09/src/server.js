import { createApp } from "./app.js";
import { loadEquipment } from "./catalog.js";

const app = createApp({
  loadEquipment,
});

app.listen(3211, "127.0.0.1", () => {
  console.log("Replacement equipment API: http://127.0.0.1:3211/api/loan-quotes");
});
