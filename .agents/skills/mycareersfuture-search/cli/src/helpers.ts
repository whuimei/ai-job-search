// Data source: MyCareersFuture Singapore's public v2 API (api.mycareersfuture.gov.sg).
// This is the same API the portal's own UI calls (verified against portal search
// results), not a third-party scrape. No authentication required, just the
// `mcf-client: jobseeker` header the real frontend sends. Clean JSON in/out.
//
// IMPORTANT verified quirks (see url-reference.md for full detail):
// - `limit` and `page` MUST be query-string params on the URL. Passing them in the
//   JSON body is silently ignored and the API falls back to its default page size (20).
// - `sortBy` is a body field but must be an ARRAY of strings (e.g. ["new_posting_date"]),
//   not a bare string — a string value gets a 400 validation error.
// - `minPostingDate` (and similar body-level date fields) do not filter results despite
//   being listed in some third-party notes; verified live with a future date that should
//   have zeroed the total but didn't. --jobage is implemented as a client-side filter
//   instead, using metadata.newPostingDate from each result.

export const SEARCH_URL = "https://api.mycareersfuture.gov.sg/v2/search"
export const JOB_URL = "https://api.mycareersfuture.gov.sg/v2/jobs"

const HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
  "mcf-client": "jobseeker",
}

export function writeError(error: string, code: string): void {
  process.stderr.write(JSON.stringify({ error, code }) + "\n")
}

/** POST/GET JSON with exponential backoff on 429/5xx. Returns null on a 404. */
async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T | null> {
  const maxRetries = 6
  let delay = 500
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, { headers: HEADERS, ...init })
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
      const body = await response.text().catch(() => "")
      throw new Error(`API request failed: ${response.status} ${response.statusText} ${body}`.trim())
    }
    return (await response.json()) as T
  }
  throw new Error("Request failed after max retries")
}

export async function apiPost<T>(url: string, body: unknown): Promise<T> {
  const result = await jsonFetch<T>(url, { method: "POST", body: JSON.stringify(body) })
  if (result === null) throw new Error("Unexpected 404 on search")
  return result
}

export async function apiGet<T>(url: string): Promise<T | null> {
  return jsonFetch<T>(url, { method: "GET" })
}

interface RawDistrict {
  region: string | null
  location: string | null
}

interface RawAddress {
  building: string | null
  street: string | null
  districts: RawDistrict[] | null
  isOverseas: boolean | null
}

interface RawCompany {
  name: string | null
}

interface RawMetadata {
  newPostingDate: string | null
  updatedAt: string | null
  jobDetailsUrl: string | null
  expiryDate?: string | null
}

interface RawResult {
  uuid: string
  title: string
  postedCompany: RawCompany | null
  hiringCompany: RawCompany | null
  address: RawAddress | null
  metadata: RawMetadata
  description?: string | null
  minimumYearsExperience?: number | null
  employmentTypes?: Array<{ employmentType: string }> | null
  positionLevels?: Array<{ position: string }> | null
  salary?: { minimum: number | null; maximum: number | null; type?: { salaryType: string | null } } | null
}

export interface SearchResponse {
  results: RawResult[]
  total: number
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
  employmentType: string | null
  positionLevel: string | null
  minimumYearsExperience: number | null
  salaryRange: string | null
  expiryDate: string | null
  description: string | null
}

function locationFrom(address: RawAddress | null): string | null {
  if (!address) return null
  if (address.isOverseas) return "Overseas"
  const district = address.districts?.[0]
  const parts = [address.building, district?.region].filter((v): v is string => !!v)
  return parts.length > 0 ? parts.join(", ") : null
}

function urlFrom(uuid: string, metadata: RawMetadata): string {
  return metadata.jobDetailsUrl || `https://www.mycareersfuture.gov.sg/job/${uuid}`
}

export function toCard(raw: RawResult): JobCard {
  return {
    id: raw.uuid,
    title: raw.title || "(untitled)",
    company: raw.postedCompany?.name ?? raw.hiringCompany?.name ?? null,
    location: locationFrom(raw.address),
    date: raw.metadata?.newPostingDate ?? raw.metadata?.updatedAt ?? null,
    url: urlFrom(raw.uuid, raw.metadata),
  }
}

/**
 * Convert a Unicode code point to a string. Uses `fromCodePoint` (not
 * `fromCharCode`) so supplementary-plane code points decode correctly.
 */
function numericEntity(cp: number): string {
  return cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : ""
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => numericEntity(parseInt(dec, 10)))
    .replace(/&#[xX]([0-9a-fA-F]+);/g, (_, hex) => numericEntity(parseInt(hex, 16)))
    .replace(/&nbsp;/g, " ")
}

/** Strip HTML tags from the rich-text job description, preserving paragraph breaks. */
export function cleanDescription(html: string | null | undefined): string | null {
  if (!html) return null
  const withBreaks = html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|li|ul|ol|div|h\d)>/gi, "\n")
  const text = decodeHtmlEntities(withBreaks.replace(/<[^>]+>/g, "")).replace(/\n{3,}/g, "\n\n").trim()
  return text || null
}

function salaryRangeFrom(salary: RawResult["salary"]): string | null {
  if (!salary || (salary.minimum == null && salary.maximum == null)) return null
  const unit = salary.type?.salaryType ? `/${salary.type.salaryType.toLowerCase()}` : ""
  return `SGD ${salary.minimum ?? "?"}-${salary.maximum ?? "?"}${unit}`
}

export function toDetail(raw: RawResult): JobDetail {
  return {
    ...toCard(raw),
    employmentType: raw.employmentTypes?.[0]?.employmentType ?? null,
    positionLevel: raw.positionLevels?.[0]?.position ?? null,
    minimumYearsExperience: raw.minimumYearsExperience ?? null,
    salaryRange: salaryRangeFrom(raw.salary),
    expiryDate: raw.metadata?.expiryDate ?? null,
    description: cleanDescription(raw.description),
  }
}

/** Client-side job-age filter: keep results dated within the last N days.
 *  (The API's own date-filter body fields do not actually filter — see notes above.) */
export function filterByJobage(cards: JobCard[], days: number): JobCard[] {
  if (!days || days <= 0 || days >= 9999) return cards
  const cutoff = Date.now() - days * 86400 * 1000
  return cards.filter((c) => {
    if (!c.date) return true
    const t = Date.parse(c.date)
    return isNaN(t) || t >= cutoff
  })
}
