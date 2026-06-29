# Alfa Analytics — Outreach Intelligence Dashboard

A read-only cold email outreach KPI dashboard. It connects directly to the
Alfa Analytics PostgreSQL database and visualizes sequence performance,
reply intent, segment/A-B performance, and AI personalisation stats.

**This app never writes to the database.** Every query is a `SELECT`
against `contacts`, `accounts`, and `sequence_enrollments`.

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui-style primitives
- Recharts for charts
- `pg` for a pooled, read-only Postgres connection
- Deploys to Vercel as serverless functions

## Running locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the env example and fill in your real database credentials:

   ```bash
   cp .env.local.example .env.local
   ```

   Then edit `.env.local`:

   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

If `DATABASE_URL` is missing or the database is unreachable, the page
renders a "Could not connect to the database" message instead of crashing.

## Connecting to Postgres

- Set `DATABASE_URL` to a standard Postgres connection string:
  `postgresql://<user>:<password>@<host>:<port>/<database>`.
- For managed providers (Neon, Supabase, RDS, etc.) that require TLS, append
  `?sslmode=require` to the connection string — the app only enables SSL when
  that's present (see `src/lib/db.ts`). Self-hosted or tunneled Postgres
  (e.g. via ngrok) typically has no SSL listener, so omit it in that case.
- The connection is pooled via a single `pg.Pool` (max 5 connections),
  cached on `globalThis` in development so hot-reloading doesn't leak
  connections, and reused per warm serverless instance in production.
- The app **only ever issues `SELECT` statements** — it does not create,
  migrate, or write to any table.

## Deploying to Vercel

1. Push this project to a Git repository and import it in Vercel, or run:

   ```bash
   npx vercel
   ```

2. In the Vercel project settings, add an environment variable:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | your production Postgres connection string |

   Add it for the **Production**, **Preview**, and **Development**
   environments as needed.

3. Deploy. Each route under `src/app/api/metrics/*` is built as its own
   serverless function (configured in `vercel.json`).

4. Make sure your Postgres instance allows inbound connections from
   Vercel's serverless IP ranges, or use a provider with a pooled/proxied
   connection string (e.g. Neon's pooler, Supabase's connection pooler, or
   RDS Proxy) to avoid exhausting connections under concurrent traffic.

## What each metric means

| Metric | Meaning |
|---|---|
| **Total Sent** | Distinct contacts enrolled in the `alfa-cold-outreach` sequence. |
| **Total Replies** | Distinct contacts with any non-null `replied_at`. Shows "Pending Phase 6" if no replies have been recorded yet. |
| **Reply Rate** | `Total Replies / Total Sent`, compared against the cold-email industry average of 3.43%. |
| **Positive Replies** | Distinct contacts whose `reply_intent = 'positive'`. |
| **Unsubscribes** | Distinct contacts whose `reply_intent = 'unsubscribe'` — sequence stops immediately for these. |
| **Sequence Completions** | Contacts who reached `current_step = 5` with `status = 'finished'` (finished = still active through the full sequence, not stopped early). |
| **AI Approval Rate** | Share of contacts where the AI personalisation step (`personalization_payload->>'send'`) approved sending (`'true'`) vs. skipped (`'false'`). Currently powered by **LM Studio Qwen 3.5-9b**. |
| **Stuck Leads** | Contacts the AI approved to send (`send = 'true'`) with a `valid` email that were never actually enrolled in a sequence — i.e. dropped between approval and outreach. |
| **Daily Send Volume** | Count of `sequence_enrollments.last_sent_at` per day, last 30 days. |
| **Sequence Step Drop-off** | How many contacts currently sit at each step (1–5), and how many of those were `stopped` rather than progressing. |
| **Segment Performance** | Reply rate grouped by `personalization_payload->>'segment'`. |
| **A/B Variant Performance** | Reply rate grouped by `personalization_payload->>'variant'` ('A' vs 'B'). |
| **Reply Intent Breakdown** | Distribution of `reply_intent` values (positive / ooo / unsubscribe / neutral / no_reply) across all enrolled contacts. |
| **Recent Positive Replies** | The 10 most recent replies of any intent, filtered client-side to only show `reply_intent = 'positive'`. |

## Notes on empty / pending data

- If `sequence_enrollments` is empty, every KPI renders as `0` — never an
  error.
- If `replied_at` is null for every row (i.e. reply detection hasn't gone
  live yet), the dashboard shows "Pending Phase 6" labels and empty-state
  copy instead of misleading zeros.
- The refresh button (top right) re-fetches all 9 metric endpoints in
  parallel via `Promise.all` and updates the "Last updated" timestamp.
