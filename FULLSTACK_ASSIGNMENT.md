# Full-Stack Engineer — Take-Home

**Stack:** MERN (MongoDB + Express + React + Node).
**Deadline:** One day from when you receive this. Pace it however you like.
**AI tools (Copilot / Cursor / ChatGPT):** allowed.

---

## Problem

Build a small web app to track "mentions" of a brand on social media.

**Core**

- Manage **brands** (name + a few keywords).
- For a brand, manage **mentions** — each mention has at least: source (twitter / instagram / reddit / news), author, body, url, posted_at, sentiment (positive / neutral / negative), tags (free-form list).
- A **mentions list** with pagination, filter by source / sentiment / tag / date range, and search on the body.
- A **dashboard** for a selected brand: total mentions, breakdown by sentiment, breakdown by source, top tags, mentions per day for the last 30 days.

**A bit more**

- **Bulk ingest** — a way to push a batch of new mentions into the system (a `POST` endpoint that accepts an array, or a CSV / JSON upload from the UI). The app should keep working as the dataset grows from hundreds to tens of thousands of mentions — think about indexes and queries.
- **De-duplication** — the same `url` (or same `source` + external id) shouldn't create duplicate mentions when re-ingested.
- **Saved views** — the user can save a filter combination (e.g. "negative twitter mentions tagged `support`") and reopen it later.
- **Export** the current filtered list as CSV.

Single user. No auth. Seed enough fake data (a few thousand mentions across 2–3 brands) so filters and the dashboard are meaningful.

## User flow (what the user can actually do in the UI)

1. **Land on a brands page** — see a list of brands with a count of mentions next to each. Create a new brand, edit a brand, or delete a brand from here.
2. **Open a brand** — lands on that brand's **dashboard** with the cards/charts (totals, sentiment breakdown, source breakdown, top tags, mentions-per-day for last 30 days).
3. **Switch to the brand's mentions list** (tab or side nav).
   - Apply filters (source, sentiment, tag, date range) and free-text search on the body.
   - Paginate through results.
   - Click a mention row to open a detail view / drawer where they can **edit** it (sentiment, tags, etc.) or **delete** it.
   - Add a **new mention** manually via a "+ New mention" button.
4. **Bulk import** — from the brand page, open a "Import mentions" action where the user can either paste/upload a CSV or JSON file, or hit a documented endpoint. Show a result summary (added / skipped as duplicates / failed).
5. **Save the current filter as a view** — name it, and have it appear in a "Saved views" list they can click to re-apply instantly. They can also delete a saved view.
6. **Export the current filtered list as CSV** from a button on the mentions list.

UI quality is not graded — plain components are fine. What we want to see is that all the actions above are reachable, work, and feel like one app instead of disconnected pages.

## Expected output

A public GitHub repo with a README that tells us how to run it.

## Questions

If anything is unclear, ask. We'd rather answer a question than have you guess.

## Follow-up

We'll do a 30-min call. Walk us through the code, defend your choices, and make a small change live.
