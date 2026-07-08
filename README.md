# wish-parser

Stateless price parsing service for the wishlist. Takes a product URL, returns the
current price. Orchestration (which wishes to parse, retries, pauses, storage) lives in
`wish-api`, which calls this service per link.

## API

`POST /parse`

```json
{ "url": "https://www.tradeinn.com/..." }
```

Responses:

- `200` — `{ "available": true, "amount": 22.99, "currencyCode": "EUR" }` or `{ "available": false }`
- `400` — invalid or missing `url`
- `422` — no adapter for the host
- `502` — the shop responded with an error or the price could not be parsed

`GET /health` → `{ "status": "ok" }`

## Supported shops

tradeinn, bike24, avito, aliexpress and Shopify stores (tons.bike). Browser-based
adapters (aliexpress → Chromium, bike24 → WebKit) run through Playwright; the rest use
plain `fetch`.

## Develop

```sh
npm install
npm run dev        # node --watch, listens on PORT (default 8080)
npm run check      # typecheck
npm run lint
```

```sh
curl -s -XPOST localhost:8080/parse \
  -H 'content-type: application/json' \
  -d '{"url":"https://www.tradeinn.com/..."}'
```
