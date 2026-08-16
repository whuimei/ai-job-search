#!/usr/bin/env bun
// Self-contained CLI for searching Singapore job listings via MyCareersFuture's
// public v2 API — the same API the portal's own frontend calls. No external CLI
// framework, no runtime dependencies beyond `bun` + `fetch`. No authentication
// required. See url-reference.md for verified endpoint quirks.

import { runSearch, type SearchOpts } from "./commands/search.js"
import { runDetail, type DetailOpts } from "./commands/detail.js"

interface Flags {
  _: string[]
  [k: string]: string | boolean | string[]
}

function parseFlags(argv: string[]): Flags {
  const flags: Flags = { _: [] }
  const alias: Record<string, string> = { q: "query", n: "limit" }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith("--") || a.startsWith("-")) {
      const key = alias[a.replace(/^-+/, "")] ?? a.replace(/^-+/, "")
      const next = argv[i + 1]
      if (next === undefined || next.startsWith("-")) {
        flags[key] = true
      } else {
        flags[key] = next
        i++
      }
    } else {
      ;(flags._ as string[]).push(a)
    }
  }
  return flags
}

const HELP = `mycareersfuture-cli — search Singapore job listings via MyCareersFuture's public API

USAGE
  bun run src/cli.ts search [flags]
  bun run src/cli.ts detail <id|url> [--format json|plain]

SEARCH FLAGS
  --query, -q <text>   Keywords (job title, skill, or role). Recommended.
  --jobage <days>       Posted within N days (filtered client-side by posting date).
                        Default: all. Automatically sorts newest-first when set.
  --page <n>            1-indexed page. Default 1.
  --limit, -n <n>        Results per page (max 100, API-enforced). Default 10.
  --format <fmt>        json (default) | table | plain.

Note: MyCareersFuture has no city/location filter — Singapore is a single
city-state. Use --query for sector/domain terms instead.

EXAMPLES
  bun run src/cli.ts search -q "AI Solutions Consultant" --format table
  bun run src/cli.ts search -q "business analyst" --jobage 7 --format table
  bun run src/cli.ts detail 6f3a1b9ca48fd1fa23b50a3b040a6c14 --format plain

No authentication needed — public MyCareersFuture API.
`

async function main(): Promise<number> {
  const argv = process.argv.slice(2)
  const flags = parseFlags(argv)
  const cmd = (flags._ as string[])[0]

  if (!cmd || flags.help || flags.h) {
    process.stdout.write(HELP)
    return cmd ? 0 : 1
  }

  if (cmd === "search") {
    const fmt = (flags.format as string) || "json"

    const parseIntFlag = (name: string, raw: string | boolean | string[]): number | null => {
      const val = parseInt(raw as string, 10)
      if (isNaN(val)) {
        process.stderr.write(JSON.stringify({ error: `--${name} must be a number, got "${raw}"`, code: "BAD_ARG" }) + "\n")
        return null
      }
      return val
    }

    let jobage = 9999
    if (flags.jobage !== undefined) {
      const v = parseIntFlag("jobage", flags.jobage)
      if (v === null) return 1
      jobage = v
    }
    let page = 1
    if (flags.page !== undefined) {
      const v = parseIntFlag("page", flags.page)
      if (v === null) return 1
      page = Math.max(1, v)
    }
    let limit = 10
    if (flags.limit !== undefined) {
      const v = parseIntFlag("limit", flags.limit)
      if (v === null) return 1
      limit = v
    }

    const opts: SearchOpts = {
      query: typeof flags.query === "string" ? flags.query : undefined,
      jobage,
      page,
      limit,
      format: (["json", "table", "plain"].includes(fmt) ? fmt : "json") as SearchOpts["format"],
    }
    return runSearch(opts)
  }

  if (cmd === "detail") {
    const id = (flags._ as string[])[1]
    if (!id) {
      process.stderr.write(JSON.stringify({ error: "detail requires an <id|url>", code: "NO_ID" }) + "\n")
      return 1
    }
    const fmt = (flags.format as string) || "json"
    const opts: DetailOpts = {
      id,
      format: (fmt === "plain" ? "plain" : "json") as DetailOpts["format"],
    }
    return runDetail(opts)
  }

  process.stderr.write(JSON.stringify({ error: `Unknown command "${cmd}"`, code: "BAD_CMD" }) + "\n")
  return 1
}

main().then((code) => process.exit(code))
