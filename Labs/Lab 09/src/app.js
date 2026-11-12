import express from "express";
import { errorHandler, sendError } from "./errors.js";
import { createLoanService } from "./loan-service.js";
import { readQuoteRequest } from "./quote-request.js";

/*
 * Builds the app but never calls listen(). server.js owns the listener,
 * and tests pass their own loadEquipment.
 */
export function createApp(options = {}) {
  const loans = createLoanService({ loadEquipment: options.loadEquipment });

  const app = express();
  app.disable("x-powered-by");
  app.use(express.json());

  app.post("/api/loan-quotes", async (req, res) => {
    // Validate first so bad input never loads the catalog.
    const quoteRequest = readQuoteRequest(req.body);
    const data = await loans.quote(quoteRequest);
    res.status(200).json({ data });
  });

  app.all("/api/loan-quotes", (req, res) => {
    res.set("Allow", "POST");
    sendError(res, 405, "METHOD_NOT_ALLOWED", "This endpoint only supports POST.");
  });

  app.use("/api", (req, res) => {
    sendError(res, 404, "NOT_FOUND", "API route not found.");
  });

  app.use(errorHandler({ logError: options.logError }));

  return app;
}
