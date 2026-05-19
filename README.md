# Sanrove — Brand Mention Tracker

Small MERN app to track and analyse social-media mentions of a brand. Built for the Sanrove full-stack take-home.

## Stack

- **Backend:** Node + Express + Mongoose (ESM, layered architecture).
- **Validation:** zod at the API boundary, Mongoose at the persistence layer.
- **Frontend:** Vite + React + Tailwind + Radix primitives + TanStack Query + Recharts.
- **Database:** MongoDB 7 (run via Docker locally, or use Atlas).

## Repo layout

```
sanrove-assign/
├── server/                       # Express API
│   ├── src/
│   │   ├── config/               # env + db connection
│   │   ├── models/               # Mongoose schemas
│   │   ├── validators/           # zod request schemas
│   │   ├── middleware/           # asyncHandler, validate, errorHandler
│   │   ├── services/             # business logic
│   │   ├── controllers/          # HTTP layer
│   │   ├── routes/               # Express routers
│   │   ├── lib/                  # csv streaming, ApiError
│   │   ├── app.js                # composes the Express app
│   │   └── server.js             # bootstrap (db connect + listen)
│   └── scripts/seed.js           # faker-based seed (3 brands, ~15k mentions)
├── client/                       # Vite React SPA
│   └── src/
│       ├── app/                  # App shell + router
│       ├── pages/                # Route-level page components
│       ├── features/             # Feature-based modules (api + hooks + UI)
│       │   ├── brands/
│       │   ├── mentions/
│       │   ├── dashboard/
│       │   └── savedViews/
│       ├── components/ui/        # Reusable UI primitives (button, dialog, ...)
│       └── lib/                  # apiClient, queryKeys, utils
├── docker-compose.yml            # local Mongo
└── package.json                  # root scripts (concurrent dev)
```

The frontend is feature-based: each `features/<domain>/` folder colocates its API client, TanStack Query hooks, and React components. Pages compose features; they don't fetch data themselves.

The backend is layered: `routes → controllers → services → models`. Controllers only marshal HTTP; services hold business logic; models own persistence and indexes.

## Prerequisites

- Node 18+
- npm 9+
- One of: Docker, or a MongoDB Atlas connection string

## Run it

### 1) Install dependencies

```bash
npm run install:all
```

### 2) Start MongoDB

**Option A — Docker (recommended):**

```bash
docker compose up -d
```

That starts Mongo 7 on `localhost:27017`. No further config needed; the server defaults to `mongodb://localhost:27017/sanrove`.

**Option B — MongoDB Atlas:**

```bash
cp server/.env.example server/.env
# then edit server/.env and set MONGODB_URI to your Atlas connection string
```

### 3) Seed the database

```bash
npm run seed
```

This wipes everything, creates 3 brands (Acme, Globex, Initech), and inserts ~5,000 mentions per brand over the last 90 days. To change the volume:

```bash
SEED_PER_BRAND=20000 npm run seed
```

### 4) Start the app

```bash
npm run dev
```

- Server: http://localhost:4000
- Client: http://localhost:5173

The Vite dev server proxies `/api/*` to the backend, so the client uses relative URLs.

## API

All routes are under `/api`.

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/brands` | List brands with mention counts |
| POST | `/brands` | Create a brand `{ name, keywords[] }` |
| GET | `/brands/:brandId` | Get one brand |
| PUT | `/brands/:brandId` | Update a brand |
| DELETE | `/brands/:brandId` | Delete a brand (cascades to its mentions + saved views) |
| GET | `/brands/:brandId/dashboard` | Stats: total, by sentiment, by source, top tags, per-day (last 30) |
| GET | `/brands/:brandId/mentions` | List mentions. Query: `source`, `sentiment`, `tag`, `from`, `to`, `q`, `page`, `limit` |
| POST | `/brands/:brandId/mentions` | Create a mention |
| POST | `/brands/:brandId/mentions/bulk` | Bulk ingest — JSON array body, **or** multipart `file` field with CSV |
| GET | `/brands/:brandId/mentions/export.csv` | Stream filtered CSV |
| PUT | `/mentions/:mentionId` | Update a mention |
| DELETE | `/mentions/:mentionId` | Delete a mention |
| GET | `/brands/:brandId/views` | List saved views |
| POST | `/brands/:brandId/views` | Save a view `{ name, filters }` |
| DELETE | `/views/:viewId` | Delete a saved view |

### Mention shape

```json
{
  "source": "twitter | instagram | reddit | news",
  "author": "string?",
  "body": "string",
  "url": "string?",
  "externalId": "string?",
  "postedAt": "ISO date",
  "sentiment": "positive | neutral | negative",
  "tags": ["string", ...]
}
```

### Bulk ingest

Two ways:

**JSON body (curl example):**

```bash
curl -X POST http://localhost:4000/api/brands/<brandId>/mentions/bulk \
  -H "Content-Type: application/json" \
  -d '[{"source":"twitter","body":"hello","postedAt":"2025-04-01T00:00:00Z","url":"https://x.com/1"}]'
```

**Multipart CSV:**

```bash
curl -X POST http://localhost:4000/api/brands/<brandId>/mentions/bulk \
  -F file=@./mentions.csv
```

CSV headers accepted: `source, body, postedAt` (required), plus `author, url, externalId, sentiment, tags` (optional). `posted_at` and `external_id` snake-case headers also work. Tags can be `|`-, `,`- or `;`-separated inside the CSV cell.

Response:

```json
{ "added": 42, "skippedDuplicates": 3, "failed": [], "total": 45 }
```

## De-duplication

Two **brand-scoped** partial-unique indexes on `mentions`:

- `{ brand: 1, url: 1 }` unique where `url` exists — same URL never inserted twice **for the same brand**.
- `{ brand: 1, source: 1, externalId: 1 }` unique where `externalId` exists — fallback when there's no URL.

Scoping dedupe by brand lets the same social/news post be tracked under more than one brand (e.g. an article mentioning both Acme and Globex). Inside a brand, re-ingesting the same URL is a no-op.

`insertMany(..., { ordered: false })` continues past duplicate-key errors; the ingest service classifies those as `skippedDuplicates` and reports them. Other write errors land in `failed[]` with a reason.

## How it scales

The mentions list and dashboard are designed to stay snappy as the dataset grows from hundreds to tens of thousands:

- **Keyset pagination** on the mentions list — sort `{ postedAt: -1, _id: -1 }` and walk forward via an opaque cursor. No `skip`, no count-then-jump. The compound index `{ brand, postedAt, _id }` covers it.
- **Substring search** on `body` uses a case-insensitive regex (`$regex`/`$options: 'i'`). The user input is regex-escaped on the server. This was a deliberate trade — Mongo's `$text` index is whole-word only ("od" wouldn't match "odio"), and Atlas Search isn't available locally. The regex is unindexed but only runs over whatever the brand + filter compound indexes have already narrowed to, which stays cheap at this scale. For real-scale free-text search I'd reach for Atlas Search.
- **Streaming CSV ingest** — uploads go to disk (multer `diskStorage`), `csv-parse` streams rows off the file, and the ingest service batch-inserts 500 rows at a time. Memory usage stays flat regardless of file size. There's a 100 MB upload cap and a 10,000-row cap per ingest call (configurable via `MAX_BULK_ROWS`).
- Compound indexes on the brand-scoped query shapes: `{ brand, postedAt, _id }`, `{ brand, source, postedAt }`, `{ brand, sentiment, postedAt }`, `{ brand, tags, postedAt }`.
- The dashboard is a **single aggregation pipeline** with `$facet`, so all five panels share one Mongo round-trip.
- CSV export streams rows through a Mongo cursor instead of buffering them in memory.

### Pagination request/response shapes

```
GET /api/brands/:brandId/mentions?limit=25&cursor=<opaque>
→ { items: [...], total: 14829, nextCursor: "...", limit: 25 }
```

The client tracks a stack of cursors for prev/next nav. Cursors are not in the URL — saved views capture filters only.

## Tradeoffs / what I'd do next

- **Bulk ingest at scale:** today it's synchronous. A real system would push a job onto a queue and return a job id to poll.
- **No auth** by design (single-user per the brief).
- **Sentiment** is stored, not computed — there's no NLP pipeline.
