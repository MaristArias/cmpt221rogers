# Lab 9 Challenge Files: Legacy Equipment API

Follow [Lab-09](../README.md).

This package contains two applications at the start:

- `src/legacy-server.js`: the working single-file system you must observe but not edit.
- `src/app.js` and `src/server.js`: the testable replacement, initially returning 501.

## Install and observe

~~~sh
npm install
npm run start:legacy
~~~

The legacy server runs at <http://127.0.0.1:3211>.

### Eligible request

~~~sh
curl -i -X POST http://127.0.0.1:3211/api/loan-quotes \
  -H 'Content-Type: application/json' \
  -d '{"itemId":"audio-recorder","requestedHours":12}'
~~~

### Unavailable item

~~~sh
curl -i -X POST http://127.0.0.1:3211/api/loan-quotes \
  -H 'Content-Type: application/json' \
  -d '{"itemId":"tripod","requestedHours":4}'
~~~

### Excessive duration

~~~sh
curl -i -X POST http://127.0.0.1:3211/api/loan-quotes \
  -H 'Content-Type: application/json' \
  -d '{"itemId":"tablet","requestedHours":12}'
~~~

### Invalid request

~~~sh
curl -i -X POST http://127.0.0.1:3211/api/loan-quotes \
  -H 'Content-Type: application/json' \
  -d '{"itemId":"","requestedHours":0}'
~~~

Stop the legacy server before starting the replacement application.

## Replacement commands

~~~sh
npm run check
npm run test:core
npm run test:change
npm run test:student
npm test
npm start
~~~

The replacement server uses the same port. The initial 501 responses are intentional.

## Supplied tests

- `core.test.js` demonstrates representative preserved behavior and safe failures; it intentionally leaves boundary gaps.
- `change.test.js` demonstrates representative borrower-policy behavior; it intentionally leaves interaction gaps.
- `student.test.js` belongs to you and must contain one core-boundary test, one policy-interaction or error-path test, and one recovery-sequence test.

Do not repeat a supplied test with different data. Do not edit the supplied core or change tests. The instructor may use additional acceptance tests that are not included in the student package. There is no published reference solution.
