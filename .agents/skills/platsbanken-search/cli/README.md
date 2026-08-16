# platsbanken-cli

CLI for searching Swedish job listings via JobTech Dev's public Jobsearch API —
the official API behind Arbetsförmedlingen's Platsbanken.

**Data source**: `jobsearch.api.jobtechdev.se` (`search` and `ad/<id>` endpoints).
**Authentication**: None required.
**Dependencies**: None (plain `bun` + `fetch`). `bun install` is optional and only pulls dev type defs.

No personal-use restriction — this is an official open-data API meant for external
developers, unlike scraped portals such as LinkedIn.

## Installation

```bash
cd .agents/skills/platsbanken-search/cli
bun install   # optional — only installs TypeScript dev types
```

The CLI runs without any install because it has zero runtime dependencies.

## Commands

| Command | Description |
|---------|-------------|
| `search` | Search for job listings |
| `detail` | Fetch full detail for a single posting |

`search` accepts `--format json|table|plain` (default `json`); `detail` accepts `--format json|plain`.
All errors are written to **stderr** as `{ "error": "...", "code": "..." }` with exit code `1`.

## Quick examples

```bash
# AI/consulting roles in Malmö
bun run src/cli.ts search -q "AI konsult" -l Malmö --format table

# Workflow automation roles, last 14 days
bun run src/cli.ts search -q "workflow automation" --jobage 14 --format table

# Full detail for one posting
bun run src/cli.ts detail 31030375 --format plain
```

See `../SKILL.md` for the full flag reference and Swedish-query guidance.

## Search flags

| Flag | Alias | Description |
|------|-------|-------------|
| `--query` | `-q` | Keywords (title / skill / role). Recommended. |
| `--location` | `-l` | City name (Malmö, Lund, Stockholm, Göteborg, Helsingborg, Uppsala) or raw taxonomy ID/legacy code. |
| `--jobage` | | Posted within N days. |
| `--remote` | | Only remote-friendly postings. |
| `--page` | | 1-indexed page. |
| `--limit` | `-n` | Results per page (max 100, API-enforced). |
| `--format` | | `json` \| `table` \| `plain`. |
