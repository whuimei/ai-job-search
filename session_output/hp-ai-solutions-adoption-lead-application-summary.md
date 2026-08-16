---
Author: Claude Sonnet 5
Last Updated: 2026-07-15 14:17 CEST
---

# HP — AI Solutions and Adoption Lead — Application Summary

## Verification Checklist

**Factual accuracy**
- ✅ All claims trace to `01-candidate-profile.md` — no fabricated skills/experience
- ✅ Job titles, dates, companies, locations correct
- ✅ Contact details correct (phone intentionally omitted — not in profile)
- ✅ Every company-specific claim (HP's $1B/FY2028 AI savings target, OpenAI partnership scope, Singapore as APAC hub) independently verified via WebFetch/WebSearch — the reviewer agent's research was not trusted at face value, and two of its claims (HP's "channel partner AI" and "supply chain AI agents") were dropped after verification showed they weren't actually in the source press release

**Targeting**
- ✅ Profile statement names the exact role and adoption focus
- ✅ Bullets reframed toward the JD's language ("coaching," "agentic," "evaluation/quality")
- ✅ Key requirements addressed; genuine gaps (ERP/BI knowledge, governance/compliance experience) left honestly absent, not stuffed
- ✅ Nice-to-haves highlighted where truthfully supported (LLM/AI assistant experience, CRM)

**Consistency**
- ✅ CV: standard 2-page moderncv/banking format
- ✅ Cover letter: cover.cls template, standard structure
- ✅ Tone consistent (discovery-to-adoption framing in both)
- ✅ No contradictions between the two documents

**Quality**
- ✅ No LaTeX errors — both compiled clean
- ✅ No spelling/grammar issues; consistent British spelling throughout
- N/A Agentic-coding/Claude Code reference — this tailored version doesn't name a specific AI coding tool, so the rule isn't triggered
- ✅ Addressed "Dear Hiring Manager" (no named contact in posting)
- ✅ Cover letter fits ~1 page (297 words, within the 250-300 budget)

**Compiled PDF verification**
- ✅ CV compiled with lualatex, exactly 2 pages, no orphaned entries
- ✅ Cover letter compiled with xelatex, exactly 1 page, signature block intact
- ✅ Bullet font matches body (Raleway family; bold weight falls back to medium — cosmetic only)

**ATS & keyword verification**
- ✅ Text layer extracts cleanly, no `(cid:*)`/garbled characters
- ✅ Email survives as literal text
- ✅ Reading order matches visual order
- ✅ Keyword table below; two genuine gaps left visible, not stuffed

### Keyword Coverage Table

| Keyword/Requirement | Priority | Status | Note |
|---|---|---|---|
| 5-10+ yrs AI/automation/business systems/digital transformation | Required | Covered | "10+ years", multiple AI/automation/CRM roles |
| Hands-on AI/automation/workflow solution launches | Required | Covered | PhaseOne AI, Agentic-X, SmiLe bullets |
| Business user needs assessment & adoption | Required | Covered | "80% CRM adoption... 1-on-1 onboarding" |
| Partnership with technical teams (engineering/data/security) | Required | Synonym-only | "Cross-Functional Coordination... technical and business stakeholders" — no explicit "engineering/data/security" |
| Delivery materials (requirements, guides, test cases, training) | Required | Synonym-only | Covered via "training", not "requirements/test cases" explicitly |
| Technical & non-technical communication | Required | Covered | Implied throughout stakeholder-discovery bullets |
| LLM / AI assistant experience | Preferred | Covered | "multi-model LLM evaluation", "AI assistant solutions" |
| CRM / ERP / BI system knowledge | Preferred | Covered (CRM only) | Zoho CRM explicit; ERP/BI genuinely absent — real gap, correctly not stuffed |
| AI training program development | Preferred | Synonym-only | Only informal 1-on-1/coaching, not "program development" — honest as-is |
| Team leadership / coaching background | Preferred | Synonym-only | "Coached a marketing teammate" + Sony's "managing 10+ engineers" — present but dated/informal |
| Governance/compliance environment | Preferred | Missing (gap) | Genuine gap, correctly left out |

## Key Tailoring Decisions
1. **Led with adoption, not just deployment** — reordered competencies and bullets so the SmiLe CRM adoption story (80% in 12 months) sits front and center, since that's the closest match to HP's core mandate
2. **Reframed informal training as "coaching"** — used the JD's own term for genuine 1-on-1 onboarding/knowledge-transfer work, without claiming formal people-management not evidenced in the profile
3. **Company paragraph grounded in verified facts only** — cut the reviewer's unverified "channel partner AI" and "supply chain AI agents" claims after WebFetch didn't confirm them; kept the $1B/FY2028 target, the OpenAI partnership's training-gap observation, and Singapore's APAC-hub status, all independently confirmed
4. **Honestly addressed the biggest gap** — coaching/team-leadership is dated (Sony, non-AI) and the letter doesn't overclaim it; ERP/BI and governance/compliance gaps are left silent rather than stretched
5. **Restored the Sony 2006-2012 bullets** to the CV after the first compile showed page 2 running too sparse — relevance-weighted restoration, not padding

## Files Created
- `cv/main_hp.tex` (+ compiled `main_hp.pdf`)
- `cover_letters/cover_hp_ai-solutions-adoption-lead.tex` (+ compiled `cover_hp_ai-solutions-adoption-lead.pdf`)

## Next Steps
- **Submitted?** Run `/outcome hp` to log it in the tracker.
- **Interview scheduled?** Run `/interview` to build a stage-specific prep pack from this posting and these documents.

## Environment Note
This session installed BasicTeX plus the following packages to make LaTeX compilation possible on this machine: `moderncv`, `fontawesome6`, `titlesec`, `textpos`, `needspace`, `marvosym`, `import`, `realscripts`. This persists for all future `/apply` runs.
