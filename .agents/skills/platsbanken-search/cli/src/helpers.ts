// Data source: JobTech Dev's public "Jobsearch" API — the official, documented,
// no-auth-required search API behind Arbetsförmedlingen's Platsbanken job board
// (https://jobsearch.api.jobtechdev.se). Clean JSON in and out; no HTML parsing needed.

export const SEARCH_URL = "https://jobsearch.api.jobtechdev.se/search"
export const AD_URL = "https://jobsearch.api.jobtechdev.se/ad"

export function writeError(error: string, code: string): void {
  process.stderr.write(JSON.stringify({ error, code }) + "\n")
}

/** Fetch JSON with exponential backoff on 429/5xx. Returns null on a 404. */
export async function apiFetch<T>(url: string): Promise<T | null> {
  const maxRetries = 6
  let delay = 500
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    })
    if (response.status === 429 || response.status >= 500) {
      if (attempt === maxRetries) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }
      const jitter = Math.floor(Math.random() * 500)
      await new Promise((r) => setTimeout(r, delay + jitter))
      delay = Math.min(delay * 2, 8000)
      continue
    }
    if (response.status === 404) return null
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }
    return (await response.json()) as T
  }
  throw new Error("Request failed after max retries")
}

/** A handful of common Skåne/major-city municipality taxonomy IDs, so --location
 *  works out of the box for names. Any other city can be passed as a raw
 *  taxonomy concept ID or legacy numeric code (see url-reference.md). */
export const MUNICIPALITY_IDS: Record<string, string> = {
  malmö: "oYPt_yRA_Smm",
  malmo: "oYPt_yRA_Smm",
  lund: "muSY_tsR_vDZ",
  stockholm: "AvNB_uwa_6n6",
  göteborg: "PVZL_BQT_XtL",
  goteborg: "PVZL_BQT_XtL",
  gothenburg: "PVZL_BQT_XtL",
  helsingborg: "qj3q_oXH_MGR",
  uppsala: "otaF_bQY_4ZD",
}

/** Resolve a --location value to a municipality taxonomy ID. Accepts a known
 *  city name (case-insensitive) or passes through anything else unchanged
 *  (assumed to already be a taxonomy ID or legacy numeric code). */
export function resolveMunicipality(location: string): string {
  const key = location.trim().toLowerCase()
  return MUNICIPALITY_IDS[key] ?? location.trim()
}

interface RawAd {
  id: string
  headline: string
  webpage_url: string
  publication_date: string | null
  application_deadline: string | null
  employer: { name: string | null } | null
  workplace_address: { municipality: string | null; city: string | null } | null
  employment_type: { label: string | null } | null
  working_hours_type: { label: string | null } | null
  description: { text: string | null } | null
  application_details: { url: string | null; email: string | null } | null
}

interface RawSearchResponse {
  total: { value: number }
  hits: RawAd[]
}

export interface JobCard {
  id: string
  title: string
  company: string | null
  location: string | null
  date: string | null
  url: string
}

export interface JobDetail extends JobCard {
  deadline: string | null
  employmentType: string | null
  workingHours: string | null
  description: string | null
  applyUrl: string | null
}

function toCard(ad: RawAd): JobCard {
  return {
    id: String(ad.id),
    title: ad.headline ?? "(untitled)",
    company: ad.employer?.name ?? null,
    location: ad.workplace_address?.municipality ?? ad.workplace_address?.city ?? null,
    date: ad.publication_date,
    url: ad.webpage_url,
  }
}

export interface SearchResult {
  total: number
  cards: JobCard[]
}

export function parseSearchResponse(raw: RawSearchResponse): SearchResult {
  return { total: raw.total?.value ?? 0, cards: (raw.hits ?? []).map(toCard) }
}

export function parseAdDetail(raw: RawAd): JobDetail {
  return {
    ...toCard(raw),
    deadline: raw.application_deadline,
    employmentType: raw.employment_type?.label ?? null,
    workingHours: raw.working_hours_type?.label ?? null,
    description: raw.description?.text ?? null,
    applyUrl: raw.application_details?.url ?? null,
  }
}

/** Convert a job-age in days to the API's `published-after` ISO timestamp. */
export function jobageToPublishedAfter(days: number): string | null {
  if (!days || days <= 0 || days >= 9999) return null
  const cutoff = new Date(Date.now() - days * 86400 * 1000)
  return cutoff.toISOString().replace(/\.\d+Z$/, "")
}
