---
name: mycareersfuture-search
version: 1.0.0
description: >
  Use this skill whenever the user wants to search for jobs in Singapore, find
  Singapore job listings, look up a specific MyCareersFuture (MCF) posting, or
  asks anything about the Singapore job market — even if they don't mention
  MyCareersFuture or MCF explicitly. Invoke for open positions, vacancies,
  hiring in Singapore, job opportunities in Singapore sectors, or when the
  user wants to find work in Singapore or relocate there. Trigger phrases
  include: mycareersfuture, mcf, jobs in singapore, singapore jobs, job search
  singapore, work in singapore, find work singapore, relocate to singapore,
  hiring singapore, job openings singapore, job vacancies singapore, sg jobs,
  consultant jobs singapore, business analyst singapore, 新加坡工作,
  求职 新加坡.
context: fork
allowed-tools: Bash(bun run .agents/skills/mycareersfuture-search/cli/src/cli.ts *)
---

# MyCareersFuture Search Skill

Search live Singapore job listings via **MyCareersFuture's public v2 API** — the
same API the portal's own frontend calls (verified against the live UI, not a
third-party scrape). No authentication, no API key, and **zero runtime
dependencies** — it runs with just `bun`.

> MyCareersFuture is run by Singapore's Workforce Singapore (WSG) statutory board.
> The `api.mycareersfuture.gov.sg` endpoints require no auth beyond an
> `mcf-client: jobseeker` header (the value the real frontend sends). No
> personal-use restriction found in `robots.txt`; keep request volume reasonable
> as a courtesy regardless.

## When to use this skill

- Search for job openings in Singapore by keyword, job title, or skill
- Filter by recency (posted within the last N days)
- Get the full description, salary range, experience requirement, and closing date for a specific posting

## Commands

### Search job listings

```bash
bun run .agents/skills/mycareersfuture-search/cli/src/cli.ts search [flags]
```

Key flags:
- `--query <text>` / `-q <text>` — keyword search (job title, skill, role). Recommended.
- `--jobage <days>` — posted within N days. **Filtered client-side** by each result's posting date (the API's own date-filter body fields do not actually filter — see `url-reference.md`); automatically sorts newest-first when set.
- `--page <n>` — page number (1-indexed).
- `--limit <n>` / `-n <n>` — results per page, **max 100** (API-enforced, returns a 400 above it). Default 10.
- `--format json|table|plain` — default `json`.

> **No location filter.** Singapore is a single city-state — MyCareersFuture has no
> city/region breakdown the way other markets do. Use `--query` for
> sector/domain terms instead (district-level filtering exists on the API via
> `districtIds` but is not exposed here; it did not seem worth the complexity
> for a single-city market).

### Fetch full job detail

```bash
bun run .agents/skills/mycareersfuture-search/cli/src/cli.ts detail <id|url> [--format json|plain]
```

`id` is the 32-character hex UUID from `search` results (e.g.
`6f3a1b9ca48fd1fa23b50a3b040a6c14`). You may also pass the full
`mycareersfuture.gov.sg/job/...` URL. Returns the full description, employment
type, position level, minimum years of experience, salary range, and closing date.

## Usage examples

```bash
# AI consulting roles
bun run .agents/skills/mycareersfuture-search/cli/src/cli.ts search -q "AI Solutions Consultant" --format table

# Business analyst roles, last 7 days
bun run .agents/skills/mycareersfuture-search/cli/src/cli.ts search -q "business analyst" --jobage 7 --format table

# Workflow automation / CRM roles
bun run .agents/skills/mycareersfuture-search/cli/src/cli.ts search -q "workflow automation consultant" --format table

# Full details for a specific posting
bun run .agents/skills/mycareersfuture-search/cli/src/cli.ts detail 6f3a1b9ca48fd1fa23b50a3b040a6c14 --format plain
```

## Output formats

| Format | Best for |
|--------|----------|
| `json` | Default — programmatic use, passing IDs to `detail` |
| `table` | Quick human-readable scanning |
| `plain` | Reading a single job's full detail (`detail` command) |

All errors are written to **stderr** as `{ "error": "...", "code": "..." }` and the process exits with code `1`.

## Notes

- Data is from `api.mycareersfuture.gov.sg` — the portal's own backend, not a scrape. No credentials required.
- `limit` and `page` **must** be query-string params on the request URL — passing them in the JSON body is silently ignored (API falls back to its default page size of 20). This CLI handles that correctly; it's documented here in case the endpoint is ever called directly.
- `limit` is capped at 100 by the API (400 error above it).
- English-language postings dominate; occasional Chinese-language postings exist but are rare.
- Job IDs are 32-character hex UUIDs — pass them as-is to `detail`.
