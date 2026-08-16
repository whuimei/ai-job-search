# mycareersfuture-cli

CLI for searching Singapore job listings via MyCareersFuture's public v2 API —
the same API the portal's own frontend uses.

**Data source**: `api.mycareersfuture.gov.sg` (`search` and `jobs/<uuid>` endpoints).
**Authentication**: None required (just an `mcf-client: jobseeker` header).
**Dependencies**: None (plain `bun` + `fetch`). `bun install` is optional and only pulls dev type defs.

## Installation

```bash
cd .agents/skills/mycareersfuture-search/cli
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
# AI consulting roles
bun run src/cli.ts search -q "AI Solutions Consultant" --format table

# Business analyst roles, last 7 days
bun run src/cli.ts search -q "business analyst" --jobage 7 --format table

# Full detail for one posting
bun run src/cli.ts detail 6f3a1b9ca48fd1fa23b50a3b040a6c14 --format plain
```

See `../SKILL.md` for the full flag reference and `../url-reference.md` for verified API quirks (notably: `limit`/`page` must be query params, not body fields).

## Search flags

| Flag | Alias | Description |
|------|-------|-------------|
| `--query` | `-q` | Keywords (title / skill / role). Recommended. |
| `--jobage` | | Posted within N days (client-side filter). |
| `--page` | | 1-indexed page. |
| `--limit` | `-n` | Results per page (max 100, API-enforced). |
| `--format` | | `json` \| `table` \| `plain`. |
