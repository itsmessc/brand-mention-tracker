# Import test fixtures

Two files for exercising the bulk import endpoint and the Import dialog.

## What's in each file

### `mentions-import.csv` — 11 rows

- 10 valid mentions across all four sources (twitter, reddit, instagram, news), mixed sentiments and tags.
- 1 deliberately invalid row at the bottom with `source=facebook` (not in the enum) — should land in `failed[]`.

Expected on first import: `added: 10, skippedDuplicates: 0, failed: 1, total: 11`.

### `mentions-import.json` — 8 entries

- 6 valid mentions with URLs.
- 1 valid mention **without a URL** (uses `externalId` only) to demonstrate the URL-less code path.
- 1 entry whose URL **matches** a row in the CSV (`reddit.com/r/acme/comments/9002`) — will be a duplicate on top of the CSV.
- 1 deliberately invalid row with `body: ""` (empty body fails the zod schema).

Expected if you upload the CSV first, then this JSON: `added: 6, skippedDuplicates: 1, failed: 1, total: 8`.

## How to use them

1. Start the app (`docker compose up -d && npm run dev`).
2. Seed if you haven't: `npm run seed`.
3. Open `http://localhost:5173`, click into any brand (e.g. Acme).
4. Click **Import mentions** in the brand header.

### CSV path
- Switch to the **CSV upload** tab.
- Choose `fixtures/mentions-import.csv`.
- The preview shows the row count.
- Click **Upload**. The result panel shows `added`, `skippedDuplicates`, `failed`.

### JSON path
- Switch to the **JSON paste** tab.
- Paste the contents of `fixtures/mentions-import.json`.
- Click **Ingest**.

## What this demonstrates

| Behaviour | How to see it |
|---|---|
| Successful insert | Upload CSV — added count > 0 |
| Validation failure | Upload CSV — failed: 1 (the `facebook` row) |
| Dedupe by URL | Upload CSV, then upload it again — skippedDuplicates equals all rows |
| Cross-method dedupe | Upload CSV, then paste JSON — the JSON entry with the matching URL is skipped |
| URL-less ingest | First JSON entry has no URL but does have `externalId` — still inserted |
| Empty body rejected | Last JSON entry — fails with zod error |

## A note on brand scoping

The endpoint is `/api/brands/:brandId/mentions/bulk`. Whichever brand you have open in the UI is where the rows land. Because dedupe is brand-scoped, uploading the same CSV to two different brands inserts each row twice (once per brand), which is the intended behaviour.

## Curl examples

JSON array body:

```bash
curl -X POST http://localhost:4000/api/brands/<brandId>/mentions/bulk \
  -H "Content-Type: application/json" \
  --data @fixtures/mentions-import.json
```

CSV multipart upload:

```bash
curl -X POST http://localhost:4000/api/brands/<brandId>/mentions/bulk \
  -F file=@fixtures/mentions-import.csv
```
