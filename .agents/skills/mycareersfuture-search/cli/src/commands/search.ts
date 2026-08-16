import { SEARCH_URL, apiPost, toCard, filterByJobage, writeError, type JobCard, type SearchResponse } from "../helpers.js"

export interface SearchOpts {
  query?: string
  jobage: number
  page: number
  limit: number
  format: "json" | "table" | "plain"
}

function buildUrl(opts: SearchOpts): string {
  const params = new URLSearchParams()
  params.set("limit", String(Math.min(Math.max(opts.limit, 1), 100)))
  params.set("page", String(Math.max(opts.page - 1, 0)))
  return `${SEARCH_URL}?${params.toString()}`
}

function buildBody(opts: SearchOpts): Record<string, unknown> {
  const body: Record<string, unknown> = {}
  if (opts.query) body.search = opts.query
  // Sort by newest first whenever a jobage filter is requested, so the
  // client-side date filter below actually has recent postings to keep.
  if (opts.jobage < 9999) body.sortBy = ["new_posting_date"]
  return body
}

function renderTable(cards: JobCard[]): string {
  if (cards.length === 0) return "No results."
  const rows = cards.map((c) => {
    const title = (c.title || "").slice(0, 42).padEnd(42)
    const company = (c.company || "—").slice(0, 26).padEnd(26)
    const loc = (c.location || "—").slice(0, 24).padEnd(24)
    const date = c.date || "—"
    return `${c.id.slice(0, 10).padEnd(10)} ${title} ${company} ${loc} ${date}`
  })
  const header =
    "ID".padEnd(10) + " " + "TITLE".padEnd(42) + " " + "COMPANY".padEnd(26) + " " + "LOCATION".padEnd(24) + " DATE"
  return [header, "-".repeat(header.length), ...rows].join("\n")
}

export async function runSearch(opts: SearchOpts): Promise<number> {
  try {
    const raw = await apiPost<SearchResponse>(buildUrl(opts), buildBody(opts))
    let cards = (raw.results ?? []).map(toCard)
    cards = filterByJobage(cards, opts.jobage)

    if (opts.format === "table") {
      process.stdout.write(renderTable(cards) + "\n")
    } else if (opts.format === "plain") {
      process.stdout.write(
        cards
          .map((c) => `${c.title}\n  ${c.company || "—"} · ${c.location || "—"} · ${c.date || "—"}\n  id: ${c.id}\n  ${c.url}`)
          .join("\n\n") + "\n",
      )
    } else {
      process.stdout.write(
        JSON.stringify({ meta: { count: cards.length, total: raw.total ?? cards.length, page: opts.page }, results: cards }, null, 2) + "\n",
      )
    }
    return 0
  } catch (e) {
    writeError(e instanceof Error ? e.message : String(e), "SEARCH_FAILED")
    return 1
  }
}
