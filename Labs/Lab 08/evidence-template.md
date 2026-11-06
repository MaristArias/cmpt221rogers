# Lab 8 Evidence

## 1. Field mapping

| Provider field | App field | Type | What I did |
|---|---|---|---|
| `space_code` | `id` | string | copied it |
| `display_name` | `name` | string | copied it |
| `campus_zone` | `zone` | string | made it lowercase |
| `seats_open` | `availableSeats` | number | checked it is a whole number 0 or more |
| `sound_profile` | `environment` | string | copied it |
| `generated_at` | `meta.updatedAt` | string | copied it |

## 2. Design

The browser only talks to my server at `/api/study-spaces`. It never talks to the provider.

`server.js` handles the HTTP part. It checks the method, calls the adapter, and sends JSON back.

`study-spaces.js` is the adapter. It reads the filters, calls the provider with a timeout, checks the provider data, and renames the fields into the app names. If the provider changes a field name, this is the only file I need to change.

Every failure becomes an `AdapterError`. It has a safe message for the browser and a detail message that only goes in the server log.

## 3. Core evidence

`npm run test:core` passed 6 out of 6.

`npm start` returned status 200 with 5 spaces and `updatedAt` 2026-11-03T14:30:00-05:00.

## 4. Change evidence

`npm run test:change` passed 6 out of 6. `npm test` passed 12 out of 12.

The filters come back in `meta.filters` as `{ zone, minSeats }`. A blank zone or a bad minSeats gives a 400 with a clear message.

## 5. Failure evidence

| Mode | Browser got | Server log said |
|---|---|---|
| `provider-error` | 502 PROVIDER_UNAVAILABLE | Provider responded with status 503. |
| `provider-invalid` | 502 PROVIDER_UNAVAILABLE | Provider spaces was not an array. |
| `provider-slow` | 502 PROVIDER_UNAVAILABLE | Provider did not respond within 250 ms. |

The browser message was always "Study-space data is temporarily unavailable." The server stayed up after each failure and a second request also got a 502.

## 6. AI use

I used Claude to help plan the adapter, write the code, and run the tests. I read through the code and can explain each part.

## 7. Reflection

The main thing I learned is that data from another server cannot be trusted. My server has to check it before the browser sees it. Keeping all the provider details in one file means the rest of the app does not break when the provider changes.
