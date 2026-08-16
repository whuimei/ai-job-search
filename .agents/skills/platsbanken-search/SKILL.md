---
name: platsbanken-search
version: 1.0.0
description: >
  Use this skill whenever the user wants to search for jobs in Sweden, find
  Swedish job listings, look up a specific Platsbanken/Arbetsförmedlingen
  posting, or asks anything about the Swedish job market — even if they don't
  mention Platsbanken or Arbetsförmedlingen explicitly. Invoke for open
  positions, vacancies, hiring in Sweden, job opportunities in Swedish cities
  or sectors (Malmö, Lund, Stockholm, Göteborg, Helsingborg, Uppsala, etc.), or
  when the user wants to find work in Sweden. Trigger phrases include:
  platsbanken, arbetsförmedlingen, jobb i sverige, lediga jobb, jobbsökning,
  jobbannons, sök jobb, svenska jobb, hitta jobb, jobs in sweden, swedish jobs,
  job search sweden, work in sweden, find work sweden, jobs malmö, jobs lund,
  jobs stockholm, jobs gothenburg, consultant jobs sweden, konsult jobb.
context: fork
allowed-tools: Bash(bun run .agents/skills/platsbanken-search/cli/src/cli.ts *)
---

# Platsbanken Search Skill

Search live Swedish job listings via **JobTech Dev's public Jobsearch API** — the
official, documented API behind Arbetsförmedlingen's Platsbanken (Sweden's national
public employment service job board). No authentication, no API key, and **zero
runtime dependencies** — it runs with just `bun`.

> This is an official open-data API published by Arbetsförmedlingen/JobTech Dev for
> external developers (https://jobsearch.api.jobtechdev.se). Unlike LinkedIn or other
> scraped portals, there is no personal-use restriction — it's built for this purpose.
> Still keep request volume reasonable as a courtesy.

## When to use this skill

- Search for job openings in Sweden by keyword, job title, or skill
- Filter by a specific municipality (Malmö, Lund, Stockholm, Göteborg, Helsingborg, Uppsala out of the box; other cities via a raw taxonomy ID — see `url-reference.md`)
- Filter by recency (posted within the last N days) or remote-friendly postings
- Get the full description, deadline, and apply link for a specific posting

## Commands

### Search job listings

```bash
bun run .agents/skills/platsbanken-search/cli/src/cli.ts search [flags]
```

Key flags:
- `--query <text>` / `-q <text>` — keyword search (job title, skill, role). Recommended.
- `--location <text>` / `-l <text>` — city name (`Malmö`, `Lund`, `Stockholm`, `Göteborg`, `Helsingborg`, `Uppsala`) or a raw municipality taxonomy ID/legacy code for other cities.
- `--jobage <days>` — posted within N days. Omit for all postings.
- `--remote` — only remote-friendly postings.
- `--page <n>` — page number (1-indexed).
- `--limit <n>` / `-n <n>` — results per page, max 100. Default 10.
- `--format json|table|plain` — default `json`.

> **Note on Swedish-language matching:** Platsbanken postings are almost entirely
> in Swedish. An English query like `"AI Solutions Consultant"` will often return
> zero or few hits — search with the Swedish equivalent or a bare skill/domain term
> instead (e.g. `"AI konsult"`, `"workflow automation konsult"`, `"processkonsult"`).

### Fetch full job detail

```bash
bun run .agents/skills/platsbanken-search/cli/src/cli.ts detail <id|url> [--format json|plain]
```

`id` is the numeric ad ID from `search` results (e.g. `31030375`). You may also pass
the full `webpage_url`. Returns the full description, employment type, working hours,
application deadline, and apply link.

## Usage examples

```bash
# AI/consulting roles in Malmö
bun run .agents/skills/platsbanken-search/cli/src/cli.ts search -q "AI konsult" -l Malmö --format table

# Workflow automation roles, last 14 days, anywhere in Sweden
bun run .agents/skills/platsbanken-search/cli/src/cli.ts search -q "workflow automation" --jobage 14 --format table

# Remote-friendly consultant roles
bun run .agents/skills/platsbanken-search/cli/src/cli.ts search -q konsult --remote --format table

# Full details for a specific posting
bun run .agents/skills/platsbanken-search/cli/src/cli.ts detail 31030375 --format plain
```

## Output formats

| Format | Best for |
|--------|----------|
| `json` | Default — programmatic use, passing IDs to `detail` |
| `table` | Quick human-readable scanning |
| `plain` | Reading a single job's full detail (`detail` command) |

All errors are written to **stderr** as `{ "error": "...", "code": "..." }` and the process exits with code `1`.

## Notes

- Data is from JobTech Dev's public `jobsearch.api.jobtechdev.se` — no credentials required.
- `--limit` is capped at 100 by the API; use `--page` to paginate further.
- `--location` resolves known city names to their municipality taxonomy ID internally; pass a raw taxonomy ID (e.g. `oYPt_yRA_Smm`) or legacy numeric code (e.g. `1280`) for cities not in the built-in list — look them up at `https://taxonomy.api.jobtechdev.se/v1/taxonomy/main/concepts?type=municipality&preferred-label=<City>`.
- `--remote` maps to the API's `remote=true` filter; coverage of this flag on postings is inconsistent (most Swedish employers don't tag it), so absence of a result does not mean no remote option exists.
- Ad IDs are numeric (e.g. `31030375`) — pass them as-is to `detail`.
