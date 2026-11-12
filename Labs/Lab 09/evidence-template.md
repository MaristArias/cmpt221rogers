# Lab 9 Evidence and Decision Record

## 1. Legacy observations

Every request I sent was a POST to /api/loan-quotes with a JSON body that had an itemId and requestedHours.

**Eligible item.** The Audio Recorder for 12 hours came back 200. It had the item id, name, hours, borrower type student, max hours 48, eligible true and reason available. I kept this exactly the same.

**Unavailable item.** The Tripod came back 200 with eligible false and reason unavailable. I kept this because it is still a real answer and not an error.

**Too many hours.** The Tablet for 12 hours came back 200 with eligible false, reason duration_exceeds_limit and max hours 8. I kept this. It is different from an unknown item, which gives a 404.

**Invalid input.** An empty itemId and 0 hours came back 400 with just a text error. I kept the 400 but changed the body so it has a code INVALID_INPUT and a message.

**One unsafe thing in the old server.** When the catalog breaks, the old server sends the real error message to the user with a 500. That could show things like a database password. It is also the wrong status because the server is fine and only the catalog is down. My version sends a safe 503 with CATALOG_UNAVAILABLE instead. The old errors were also just plain text, so I made every error use the same shape with a code and a message.

## 2. Missing boundary I picked before refactoring

My test is called "an available item is eligible at its maximum and ineligible one hour past it".

The core tests never check the exact limit and never check duration_exceeds_limit. So I tested the Audio Recorder at 48 hours, which should be allowed, and at 49 hours, which should come back 200 with eligible false and reason duration_exceeds_limit.

This catches it if someone changes the less than or equal check to just less than, or mixes up the limit while moving code around.

## 3. Replacement design

request
→ express.json() reads the body (bad JSON goes straight to the error handler)
→ the route checks the input with readQuoteRequest()
→ the loan service loads the catalog, finds the item and applies the rules
→ response
↘ any error goes to errorHandler(), which sends a safe JSON error

**Making the app.** createApp() in app.js sets up the routes but never starts a server, so the tests can use it.

**Starting the server.** server.js is the only place that calls listen() and passes in the real catalog.

**Checking input.** readQuoteRequest() turns the request body into clean values before the catalog is ever loaded.

**Loan rules.** decideLoan() and maxHoursFor() hold all the rules in one place. They never see req or res.

**Catalog.** loadEquipment is passed into the loan service. Tests can pass a fake one and the real app passes the one from catalog.js.

**Errors.** AppError and errorHandler() make every failure come back in the same safe shape.

## 4. Refactoring evidence

I sent the same requests to the old server and then to my new one.

The eligible request gave the exact same answer in both.

The too many hours request gave the same answer in both. My test A also covers this.

Invalid input was 400 in both. The new one just has a proper code now.

An unknown item was 404 in both. The new one has the code ITEM_NOT_FOUND.

**A change that kept the behavior the same.** I moved the eligibility rule out of the route and into decideLoan(). The answers did not change and all the core tests and my boundary test still passed.

## 5. Change request evidence

**Faculty with a normal item.** Audio Recorder for 72 hours gave max hours 96 and eligible true.

**Faculty with a restricted item.** Camera Kit for 30 hours kept max hours at 24 and came back not eligible.

**Faculty with an unavailable item.** The Tripod still came back unavailable.

**Bad borrower type.** visitor came back 400 INVALID_INPUT and the catalog was never loaded.

**Why this is a feature change and not a refactor.** The faculty rule gives answers that did not exist before. Faculty now get double hours on items that are not restricted. If borrowerType is left out it still means student, so old requests get the same answers as before.

## 6. Catalog failure and recovery

First I made the catalog fail. The app sent back 503 with CATALOG_UNAVAILABLE and a safe message. None of the real error showed up, it only went to the server log.

Then I sent a normal request to the same app. It came back 200 with a normal quote, so the app was not broken by the failure.

## 7. My tests

**Core boundary.** "an available item is eligible at its maximum and ineligible one hour past it". None of the given tests check the exact limit. It checks that 48 hours is allowed and 49 hours is not, with the full response.

**Policy interaction.** "faculty keep the normal maximum on a restricted item". The given change tests only try faculty on a normal item. It checks that " Faculty " gets cleaned up to faculty, max hours stays 24 and the request is not eligible.

**Recovery.** "the same app recovers after one catalog failure". The core tests only check one failed request and never what happens after. It checks that the first request gets a safe 503, the second request on the same app gets a 200, and the catalog was called twice.

## 8. AI assistance record

I gave claude my finished code just so it can organise it to make it look as neat and tidy as possible.
