# Content tool

A content factory that runs inside Claude Code (flat-rate on the Max plan)
instead of the metered Anthropic API. The **ops dashboard** (ops.tacotech.se)
owns the queue; the **CMS** (cms.tacotech.se) holds finished content as drafts.

```
ops content_plan (status: briefed)         ← the queue, edited in ops.tacotech.se
        │
        ▼  /content-tool <siteId>           ← the driver skill (Claude Code, Max plan)
  GET /api/content-tool/queue               → items + ready-made writer systemPrompt
        ├─ writer subagent  (per item)      → researches + writes (no metered API)
        ├─ upload.mjs                        → creates a CMS DRAFT (pages/reviews)
        └─ POST /api/content-tool/complete   → ops item → "review", links the page, logs it
        │
        ▼
  CMS admin → human reviews the draft → Publish   ← the quality gate
```

## Why this shape

- **The queue stays in ops**, visible/editable where you already work. We added two
  thin, bearer-authed endpoints to the dashboard (`/api/content-tool/queue` and
  `/api/content-tool/complete`) so the driver never needs direct DB access.
- **Generation moves off the metered API.** The dashboard's `lib/anthropic.ts`
  (Opus + web search per article) is the expensive path; here a Claude Code
  subagent does the writing on the flat-rate Max plan. The endpoint still hands
  over the saved `writer_prompt`, so output matches the dashboard's voice/SEO rules.
- **Per-site identity** comes from the CMS `Sites` record + the ops site context —
  one engine, many brand brains. Nothing is forked per site.
- **Nothing auto-publishes.** Drafts land in the CMS; the ops item moves to
  `review`. A human publishes.

## Setup

`affiliate-cms/.env` (gitignored) needs:

```bash
PAYLOAD_CMS_URL=https://cms.tacotech.se     # CMS (upload target)
PAYLOAD_API_KEY=<Users API key>
OPS_URL=https://ops.tacotech.se             # ops dashboard (the queue)
CONTENT_TOOL_TOKEN=<openssl rand -hex 32>   # must match the dashboard's env var
```

The dashboard must be deployed with the new `/api/content-tool/*` routes and the
same `CONTENT_TOOL_TOKEN`.

## Run

From Claude Code: `/content-tool <cmsSiteId> [status]` (status defaults to `briefed`).

Manual pieces (run from `affiliate-cms/`):

```bash
node content-tool/ops.mjs queue --site 1 --status briefed   # inspect the queue
node content-tool/upload.mjs content-tool/.work/<id>.json   # upload one draft
node content-tool/ops.mjs complete --item <id> --page <id>  # report back to ops
```

## Files

- `ops.mjs` — client for the ops queue/complete endpoints (the source of truth).
- `upload.mjs` — uploads one article to the CMS as a draft; writes a `.result.json` sidecar.
- `lib.mjs` — CMS auth + idempotent draft-upsert (by slug + site); auto-loads `.env`.
- `.work/` — writer subagents drop article JSON + result sidecars here (gitignored).

## YMYL guardrail

The first site is credit cards in Swedish — a financial (YMYL) niche with a high
E-E-A-T bar. The draft gate is not optional: verify every rate/fee/term before
publishing (the writer flags unverified figures with `<!-- VERIFY -->`), keep each
site's content genuinely its own, and favour real value per page over volume.
