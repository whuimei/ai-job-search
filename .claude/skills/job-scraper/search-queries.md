# Search Queries for Job Scraper

<!-- SETUP: Customize these queries based on your skills, target roles, and location -->

## Installed portal CLIs (primary for `/scrape`)

`/scrape` discovers every portal skill under `.agents/skills/*/SKILL.md` and runs its CLI first. Shipped country-agnostic CLIs include `linkedin-search` and `freehire-search`; Danish demos, `platsbanken-search` and `mycareersfuture-search` (added via `/add-portal`), and any further skill you add the same way are included identically. You do **not** need a matching `site:` line below for those CLIs to run.

The `site:` query templates in this file are the **WebSearch fallback** — for portals without a CLI, company career pages, or when a CLI fails.

**Language scope:** write every query category in every language listed in your CLAUDE.md Languages table (typically 1-2, sometimes more). A posting requiring a language you have *not* declared, as a job condition, is excluded before scoring; a posting requiring a *higher level* than you declared in a language you *do* work in is flagged for your own judgment, not excluded — see `04-job-evaluation.md`'s Language Gate, the single source of truth for this rule. Translate each category's keywords rather than machine-translating word-for-word (e.g. "Frontend Developer" -> "Desarrollador Frontend", not a literal word-for-word translation) if you work in more than one language.

## Search Sites

Primary:
- **arbetsformedlingen.se/platsbanken** - Swedish national job board; covered by the `platsbanken-search` CLI (uses the official JobTech Dev API, not scraping). **Query in Swedish** - the underlying board has almost no English-language postings.
- **mycareersfuture.gov.sg** - Singapore national job board; covered by the `mycareersfuture-search` CLI (uses the portal's own public API). Relevant given possible relocation back to Singapore.
- **linkedin.com/jobs** - LinkedIn job listings (filter: Sweden / Denmark, Malmö / Copenhagen / Öresund, or Singapore); also covered by `linkedin-search` CLI
- **jobindex.dk** - Danish general job board (shipped portal demo, relevant given Öresund/Copenhagen scope)
- **jobnet.dk** - Danish national job board (shipped portal demo)

Secondary (company career pages via Google):
- Direct Google searches with `site:` filters for known target companies (none specified yet - add as they come up)

## Query Categories

Queries are grouped by priority. Write **each category in every language from your Languages table** (see Language scope above). Combine each query with your location terms (e.g. your city, region, or metro area) where the site supports it.

### Priority 1: AI Solutions / Implementation Consulting

These match your strongest and most desired career direction: deploying technical AI solutions to customers.

```
platsbanken-search: search -q "AI konsult" -l Malmö
platsbanken-search: search -q "AI implementation konsult" --jobage 14
mycareersfuture-search: search -q "AI Solutions Consultant" --jobage 14
mycareersfuture-search: search -q "AI Implementation Consultant"
site:linkedin.com/jobs "AI Solutions Consultant" OR "AI Implementation Consultant" OR "AI Deployment Specialist" Sweden
site:linkedin.com/jobs "AI Solutions Consultant" OR "AI Implementation Consultant" Denmark
site:linkedin.com/jobs "AI Solutions Consultant" OR "AI Implementation Consultant" Singapore
```

### Priority 2: Domain Expertise (Workflow Automation & CRM)

These match your domain expertise in client discovery, workflow automation, and CRM implementation.

```
platsbanken-search: search -q "processautomation konsult" -l Malmö
platsbanken-search: search -q "CRM konsult" --jobage 14
mycareersfuture-search: search -q "workflow automation consultant"
mycareersfuture-search: search -q "business analyst" --jobage 14
site:linkedin.com/jobs "workflow automation consultant" Sweden OR Denmark
site:linkedin.com/jobs "CRM implementation" consultant Sweden OR Denmark
site:linkedin.com/jobs "CRM implementation" OR "business analyst" consultant Singapore
```

### Priority 3: Adjacent Roles (Solutions Engineer / Technical Implementation Manager)

Adjacent roles you could pivot into.

```
mycareersfuture-search: search -q "Solutions Engineer"
mycareersfuture-search: search -q "Technical Implementation Manager"
site:linkedin.com/jobs "Solutions Engineer" AI Sweden OR Denmark OR Singapore
site:linkedin.com/jobs "Technical Implementation Manager" Sweden OR Denmark OR Singapore
site:jobindex.dk "Solutions Engineer" OR "Implementation Manager" København
```

### Priority 4: Broader Technical Consulting

Wider net for general technical/AI consulting roles.

```
platsbanken-search: search -q "teknisk konsult AI"
mycareersfuture-search: search -q "technical consultant"
site:linkedin.com/jobs "technical consultant" AI Malmö OR Copenhagen OR Singapore
site:jobnet.dk "AI" konsulent
```

## Location Filter

Three separate location scopes are in play - evaluate each posting against whichever it belongs to:

**Öresund scope** (hybrid/in-person from current base in Malmö, no relocation needed):
- Malmö and surrounding areas (ideal)
- Lund, Öresund region - Sweden side (ideal)
- Copenhagen, Denmark (acceptable - hybrid across the Öresund bridge)
- Other Danish Zealand towns near Copenhagen (borderline - depends on commute time)

**Domestic relocation scope** (Sweden, relocation):
- Stockholm
- Göteborg / Gothenburg
- Flag postings in these cities clearly as "relocation" so they're evaluated against relocation readiness, not commute distance

**Singapore scope** (relocation, citizenship-backed):
- Anywhere in Singapore is in scope; no local commute filtering needed (single city-state)
- Flag Singapore postings clearly as "relocation" so they're evaluated against relocation readiness, not commute distance

Anywhere outside all three scopes (i.e. not Öresund-hybrid-reachable, not Stockholm/Göteborg, and not Singapore) is too far - deal-breaker.

## Language Filter

Your working languages and levels are in CLAUDE.md's Languages table. When filtering scraped results, apply `04-job-evaluation.md`'s Language Gate: a posting requiring a language you haven't declared at all is excluded; a posting requiring a higher level than you declared in a language you do work in is not excluded, flag it clearly instead (see `job-scraper/SKILL.md`'s Step 3 "Quick Fit Assessment" for how the flag surfaces in `/scrape` output). Postings simply *written* in a language you don't work in, that don't require it on the job, are fine.

## Date Filter

Only include jobs posted within the last 14 days, or with an application deadline that has not yet passed. If a posting date cannot be determined, include it but flag as "date unknown".

## Adapting Queries

If the user specifies a focus area, select queries from the matching category and also generate 2-3 custom queries for that focus. For example:
- "/scrape [focus_area]" -> relevant category queries + custom focus-specific queries
