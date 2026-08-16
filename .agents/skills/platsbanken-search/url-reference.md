# Platsbanken / JobTech Dev API Reference

Public, unauthenticated JSON API published by Arbetsförmedlingen's JobTech Dev team
as the official search backend for Platsbanken. Documented at
https://jobsearch.api.jobtechdev.se (Swagger UI at `/`). No terms-of-service
restriction on automated access — this is the intended integration path.

## Search

```
GET https://jobsearch.api.jobtechdev.se/search
```

Query params:

| Param | Meaning | Example |
|-------|---------|---------|
| `q` | Free-text query (Swedish gives far better recall than English) | `AI konsult` |
| `municipality` | Municipality taxonomy concept ID **or** legacy numeric code | `oYPt_yRA_Smm` or `1280` (both = Malmö) |
| `remote` | `true` restricts to postings tagged remote-friendly | `true` |
| `published-after` | ISO 8601 timestamp, no milliseconds/timezone suffix | `2026-07-01T00:00:00` |
| `sort` | `relevance` (default) or `pubdate-desc` | `pubdate-desc` |
| `limit` | Results per page. **Max 100**, default 10 | `50` |
| `offset` | Pagination offset (0-indexed) | `0`, `10`, `20`, … |

Returns `{ total: { value }, hits: [...] }`. Each hit is a full ad object (same
shape as the `detail` endpoint below) — `id`, `headline`, `employer.name`,
`workplace_address.municipality`, `publication_date`, `webpage_url`, etc.

`municipality` does **not** accept a free-text city name — it must be a taxonomy
concept ID or the legacy numeric code. Look up any Swedish municipality:

```
GET https://taxonomy.api.jobtechdev.se/v1/taxonomy/main/concepts?type=municipality&preferred-label=<City>
```

Municipality IDs hardcoded in `cli/src/helpers.ts` (`MUNICIPALITY_IDS`): Malmö
(`oYPt_yRA_Smm`), Lund (`muSY_tsR_vDZ`), Stockholm (`AvNB_uwa_6n6`), Göteborg
(`PVZL_BQT_XtL`), Helsingborg (`qj3q_oXH_MGR`), Uppsala (`otaF_bQY_4ZD`).

## Detail

```
GET https://jobsearch.api.jobtechdev.se/ad/<id>
```

Returns the same full ad object as a search hit, including `description.text`
(plain text, already HTML-stripped — `description.text_formatted` has the HTML
version if ever needed), `application_deadline`, `employment_type.label`,
`working_hours_type.label`, and `application_details.url` (apply link).
404 on an unknown or removed ad ID.

## Notes

- No authentication required; both endpoints support CORS (`access-control-allow-origin: *`).
- `robots.txt` on `arbetsformedlingen.se` disallows `/platsbanken/annonser` only for
  the site's own named bots (`i3bot`, `i3agent`); it is not disallowed for a generic
  user agent, and this skill talks to the separate `jobsearch.api.jobtechdev.se` API
  host anyway, not the HTML site.
- Swedish-language queries return dramatically more matches than English ones —
  the SKILL.md usage notes recommend Swedish query terms.
- `total.value` reflects the full match count regardless of `limit`/`offset`.
