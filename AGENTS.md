# Repository Guidelines

## Stack
- Node.js CommonJS app using Express 4 and body-parser.
- Browser UI is static HTML, CSS, and JavaScript in `public/`.
- Persistence is the JSON file `data/db.json`, via `lib/store.js`.

## Module map
### `routes/`
- `routes/customers.js` — customer list and Khata settlement endpoints.
- `routes/orders.js` — order list/read/create and cancellation endpoints.
- `routes/products.js` — product list and active coupon endpoints.
- `routes/reports.js` — dashboard, GST reconciliation, pricing preview, and admin export endpoints.
### `lib/`
- `lib/coupons.js` — coupon lookup, validation, discount calculation, and active coupon list.
- `lib/dates.js` — current date, date key normalization, and fiscal year helper.
- `lib/inventory.js` — product lookup, sellable stock, checks, reservation, release, and summary.
- `lib/invoice.js` — invoice figure calculation and printable HTML rendering.
- `lib/ledger.js` — customer balances, Khata order debits/reversals, and settlements.
- `lib/orders.js` — order add/get/cancel/list operations.
- `lib/pricing.js` — subtotal, coupon discount, and order total calculation.
- `lib/reports.js` — dashboard summary and invoice/ledger GST reconciliation.
- `lib/store.js` — JSON data read/write, structure defaults, and audit entries.
- `lib/tax.js` — item GST rate/slab resolution and CGST/SGST split.

## Commands
- Start the app: `npm start` (runs `node server.js`; default port is 3000).
- Run tests: `node --test` (runs the Node.js built-in tests in `test/`).

## Rules
1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket
Invoice total and GST breakdown do not match what the customer was billed. Allowed files: `lib/invoice.js` (`lib/tax.js` only if truly needed).
