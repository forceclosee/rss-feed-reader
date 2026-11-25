# Frontpage

A personalized front page for tech content. Subscribe to RSS and Atom feeds, organize them into Categories, and read Items in one calm place.

This is a [Frontend Mentor](https://www.frontendmentor.io) product challenge built with TanStack Start, Drizzle, Neon, and Cloudflare.

## Tech stack

- **App**: TanStack Start (SSR), React 19, Tailwind CSS v4
- **Data**: Drizzle ORM on Neon Postgres (shared Feed cache)
- **Ingestion**: `fast-xml-parser`, `sanitize-html`
- **Tooling**: Vite, Vitest, Playwright, Biome

## Getting started

```bash
pnpm install
cp .env.example .env      # set DATABASE_URL to a Postgres database
pnpm db:push             # create the feeds and items tables
pnpm dev                 # http://127.0.0.1:3000
```

Seed the Starter Pack (19 curated Feeds, 5 Categories):

```bash
pnpm db:seed
```

Seeding is idempotent: run it again to refresh existing Feeds and Items instead of duplicating them. Feeds that fail to fetch are recorded and skipped, so one dead URL does not stop the pack.

## Feed ingestion

Feed sources and Items are stored once and shared across every User (see `docs/adr/0001-shared-feed-cache.md`). The pipeline lives in `src/feed/`:

| Module | Responsibility |
| --- | --- |
| `fetch.ts` | 10-second timeout, redirect following, conditional ETag/Last-Modified requests |
| `parse.ts` | RSS 2.0, Atom 1.0, and RSS 1.0/RDF parsing, encodings, entities, dates |
| `sanitize.ts` | Strips scripts, frames, forms, event handlers, and unsafe URLs at ingest |
| `ingest.ts` | Normalizes a fetched document into safe Feed and Item values |
| `store.ts` | Persists to the shared cache and records fetch failures |
| `seed.ts` | Seeds the Starter Pack from `data/sample-feeds.json` |

Design choices worth knowing:

- **Feed identity is the canonical URL.** A permanent redirect updates the stored URL, and if the target URL is already cached the two rows merge instead of fetching one source twice.
- **Item identity is `(feedId, guid)`.** Re-ingest updates in place, so Items never duplicate. Feeds that omit `guid`, `link`, and date get a stable generated identity that ignores summary text so edits do not mint new Items.
- **HTML is sanitized once at ingest.** The stored `content_html`, `plain_text`, and `excerpt` are already safe to render; no sanitization runs on read.
- **Date-only and timezone-less dates are read as UTC** so the server and browser render the same instant.

## Testing

```bash
pnpm test          # Vitest unit and component tests
pnpm test:e2e      # Playwright smoke tests (starts the dev server)
pnpm verify        # typecheck + lint + test + e2e
```

Parser and sanitizer edge cases are driven by fixtures in `tests/fixtures/`.

## Project layout

```
docs/spec/     product, requirements, and design challenges
docs/guidance/ brand kit, UI/UX patterns, accessibility checklist
docs/adr/      architecture decision records
data/          canonical Starter Pack and sample feeds
src/feed/      feed fetching, parsing, sanitizing, and persistence
src/routes/    TanStack Start routes
tests/         Vitest and Playwright suites
```
