import { JOB_URL, apiGet, toDetail, writeError } from "../helpers.js"

export interface DetailOpts {
  id: string
  format: "json" | "plain"
}

/** Accept a raw 32-char uuid or a full mycareersfuture.gov.sg job URL. */
function normalizeId(input: string): string | null {
  const bare = input.match(/^[0-9a-f]{32}$/i)
  if (bare) return input
  const fromUrl = input.match(/([0-9a-f]{32})(?:$|[/?#])/i)
  if (fromUrl) return fromUrl[1]
  return null
}

export async function runDetail(opts: DetailOpts): Promise<number> {
  const id = normalizeId(opts.id)
  if (!id) {
    writeError(`Could not parse a job UUID from "${opts.id}"`, "BAD_ID")
    return 1
  }
  try {
    const raw = await apiGet<any>(`${JOB_URL}/${id}`)
    if (!raw) {
      writeError("Job not found", "NOT_FOUND")
      return 1
    }
    const job = toDetail(raw)

    if (opts.format === "plain") {
      const lines = [
        job.title,
        `${job.company || "—"} · ${job.location || "—"}`,
        "",
        job.employmentType ? `Employment: ${job.employmentType}` : "",
        job.positionLevel ? `Level: ${job.positionLevel}` : "",
        job.minimumYearsExperience != null ? `Min. experience: ${job.minimumYearsExperience} years` : "",
        job.salaryRange ? `Salary: ${job.salaryRange}` : "",
        job.expiryDate ? `Closing: ${job.expiryDate}` : "",
        "",
        job.description || "(no description)",
        "",
        `URL: ${job.url}`,
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
