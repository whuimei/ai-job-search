# MyCareersFuture API Reference

Public JSON API used directly by MyCareersFuture's own frontend (Singapore's
Workforce Singapore statutory board job portal). Verified live 2026-07-15 by
comparing against the portal's own network requests structure, not a
third-party document.

> No authentication required beyond the `mcf-client: jobseeker` header, which
> the real frontend also sends. No `robots.txt` disallow found on the site;
> `api.mycareersfuture.gov.sg` itself has no `robots.txt` (404).

## Search

```
POST https://api.mycareersfuture.gov.sg/v2/search
Headers: Content-Type: application/json, mcf-client: jobseeker
```

**Query-string params** (verified — passing these in the body instead is silently
ignored and the API falls back to its default page size of 20):

| Param | Meaning | Example |
|-------|---------|---------|
| `limit` | Results per page. **Max 100** — a `limit` above 100 returns a 400. Default 20 if omitted. | `50` |
| `page` | 0-indexed page number | `0`, `1`, `2`, … |

**Body params** (JSON):

| Param | Meaning | Example |
|-------|---------|---------|
| `search` | Free-text query | `"AI Solutions Consultant"` |
| `sortBy` | **Must be an array of strings** — a bare string gets a 400 validation error (`must be array`). `["new_posting_date"]` sorts newest-first; omitting it sorts by relevance. | `["new_posting_date"]` |

**Verified NOT to work as filters** (despite being documented in some
third-party notes as POST body params): `minPostingDate`, `postingDate`,
`newPostingDate` in various shapes (string, ISO datetime, `{min: ...}`) — all
silently accepted but produced an identical `total` count even with a
deliberately-impossible future date, confirming they are not applied. This
skill implements `--jobage` as a **client-side filter** over each result's
`metadata.newPostingDate` instead (see `cli/src/helpers.ts`).

Other documented-but-unverified body params (present in third-party notes,
not exercised here): `salary`, `company`, `employmentTypes`, `schemes`,
`positionLevels`, `categories`, `districtIds`, `postingCompany`,
`flexibleWorkArrangements`, `responsiveEmployer`, `skillUuids`.

Returns `{ total, countWithoutFilters, results: [...], _links, searchRankingId }`.
Each result has (fields actually used by this CLI in bold):

- **`uuid`** — job ID
- **`title`**
- **`postedCompany.name`** (fallback **`hiringCompany.name`**)
- **`address.building`** + **`address.districts[0].region`** — combined into a location string
- **`metadata.newPostingDate`** (fallback `metadata.updatedAt`)
- **`metadata.jobDetailsUrl`** — full pretty URL (fallback: construct `https://www.mycareersfuture.gov.sg/job/<uuid>`)
- `salary.minimum` / `salary.maximum` / `salary.type.salaryType`
- `employmentTypes[].employmentType`, `positionLevels[].position`
- `skills[]`, `categories[]`, `schemes[]` (not surfaced by this CLI, available for future extension)

## Detail

```
GET https://api.mycareersfuture.gov.sg/v2/jobs/<uuid>
Headers: mcf-client: jobseeker
```

Returns the same shape as a search result, plus:

- **`description`** — rich HTML (this CLI strips tags and decodes entities, preserving paragraph breaks)
- **`minimumYearsExperience`**
- **`metadata.expiryDate`** — posting closing date
- `otherRequirements`, `screeningQuestions`, `postedCompany.description` (company blurb)

404 on an unknown or removed job UUID.

## Notes

- Job UUIDs are 32-character lowercase hex strings, e.g. `6f3a1b9ca48fd1fa23b50a3b040a6c14`.
- CORS is open (`access-control-allow-credentials: true`); requests work from any origin.
- No pagination cursor beyond `page`/`limit` — `_links.next`/`_links.last` in the search response give the pattern if deeper crawling is ever needed.
- Singapore has no meaningful city/region subdivision the way other markets do; `districtIds` (numbered planning-area codes, e.g. district 1 = Marina/Raffles Place) exists on the API for finer filtering but is not exposed by this CLI's `--location` flag (there isn't one) to keep the skill simple for a single-city market.
