import { AD_URL, apiFetch, parseAdDetail, writeError } from "../helpers.js"

export interface DetailOpts {
  id: string
  format: "json" | "plain"
}

/** Accept a raw ad ID or a full webpage_url like .../platsbanken/annonser/31030375. */
function normalizeId(input: string): string | null {
  const bare = input.match(/^\d+$/)
  if (bare) return input
  const fromUrl = input.match(/\/annonser\/(\d+)/)
  if (fromUrl) return fromUrl[1]
  return null
}

export async function runDetail(opts: DetailOpts): Promise<number> {
  const id = normalizeId(opts.id)
  if (!id) {
    writeError(`Could not parse an ad ID from "${opts.id}"`, "BAD_ID")
    return 1
  }
  try {
    const raw = await apiFetch<any>(`${AD_URL}/${id}`)
    if (!raw) {
      writeError("Job not found", "NOT_FOUND")
      return 1
    }
    const job = parseAdDetail(raw)

    if (opts.format === "plain") {
      const lines = [
        job.title,
        `${job.company || "—"} · ${job.location || "—"}`,
        "",
        job.employmentType ? `Employment: ${job.employmentType}` : "",
        job.workingHours ? `Hours: ${job.workingHours}` : "",
        job.deadline ? `Deadline: ${job.deadline}` : "",
        "",
        job.description || "(no description)",
        "",
        `URL: ${job.url}`,
        job.applyUrl ? `Apply: ${job.applyUrl}` : "",
      ].filter((l) => l !== "")
      process.stdout.write(lines.join("\n") + "\n")
    } else {
      process.stdout.write(JSON.stringify(job, null, 2) + "\n")
    }
    return 0
  } catch (e) {
    writeError(e instanceof Error ? e.message : String(e), "DETAIL_FAILED")
    return 1
  }
}
