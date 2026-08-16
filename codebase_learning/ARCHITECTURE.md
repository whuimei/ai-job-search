# AI Job Search Architecture Guide

## Why this guide exists

This repository is a prompt-driven job search system for Claude Code.

It is not a conventional application with one executable workflow.

Its architecture lives across commands, skills, state files, agents, and generated documents.

This guide explains those relationships from a learner's perspective.

## The big picture

The system is a guided pipeline with five stages.

```text
Personal setup
      |
      v
Portal search and capture
      |
      v
Cheap batch ranking
      |
      v
Deep application workflow
      |
      v
Outcome tracking and later calibration
```

The strongest design choice is progressive commitment.

Cheap steps process many jobs. Expensive steps process only shortlisted jobs.

The main weakness is its feedback loop.

Outcomes are recorded, but user judgments are not captured as structured training examples.

## Mental model

Think of the repository as an operating manual with small portal tools.

Claude Code reads the manual and performs the workflow.

```text
Commands                Skills                 Durable state
What happens next       How to judge           What happened before

/scrape                 Candidate profile      seen_jobs.json
/rank                   Evaluation rubric      job_search_tracker.csv
/apply                  Writing guidance       application outputs
/outcome                Portal instructions    calibration notes
```

The commands are the conductors. Skills supply reusable knowledge and rules.

The JSON, CSV, profile files, and outputs provide memory between sessions.

## Architectural layers

### 1. Orchestration layer

Files in `.claude/commands/` define the user-facing workflows.

Each command describes its inputs, sequence, checkpoints, and stopping rules.

Important commands include:

| Command | Responsibility | Stop condition |
|---|---|---|
| `/setup` | Build or update the candidate profile | Required profile information exists |
| `/scrape` | Search portals and deduplicate results | Search sources finish or report failure |
| `/rank` | Triage unreviewed jobs | Ranked shortlist is presented |
| `/apply` | Evaluate, draft, review, and verify | Documents pass final checks |
| `/outcome` | Record application results | Tracker and archive are updated |
| `/add-portal` | Create a portal adapter | Live search and detail tests pass |

This layer is declarative. The Markdown tells an agent what to do.

### 2. Knowledge layer

Files in `.claude/skills/` contain reusable domain guidance.

The job application assistant holds four important knowledge types.

| Knowledge | Source |
|---|---|
| Candidate evidence | `01-candidate-profile.md` |
| Behavioral preferences | `02-behavioral-profile.md` |
| Writing rules | `03-writing-style.md` |
| Fit scoring | `04-job-evaluation.md` |

Search queries live in `.claude/skills/job-scraper/search-queries.md`.

This gives the user durable control over keywords and portal coverage.

### 3. Adapter layer

Files in `.agents/skills/*-search/` wrap individual job portals.

Each adapter exposes a similar search and detail interface.

```text
Claude command
     |
     v
Portal skill instructions
     |
     v
Small command-line program
     |
     v
Portal API or public page
```

The shared contract lets `/scrape` use several portals consistently.

The adapters still preserve portal-specific behavior and limitations.

### 4. State layer

The system uses local files instead of a database.

`job_scraper/seen_jobs.json` stores discovered jobs and ranking state.

`job_search_tracker.csv` stores applications and later outcomes.

Generated CVs, letters, and summaries provide an application archive.

This approach is inspectable. It also requires careful schema discipline.

### 5. Artifact layer

The `/apply` command creates LaTeX source files and compiled PDFs.

It treats document generation as both content work and build work.

Compilation and visual inspection are mandatory final stages.

The system remembers which LaTeX engine works for each document type.

## End-to-end data flow

```text
Candidate answers
      |
      v
Candidate and behavior profiles
      |
      +----------------------+
      |                      |
      v                      v
Search query config      Evaluation rubric
      |                      |
      v                      |
Portal adapters              |
      |                      |
      v                      |
seen_jobs.json --------------+
      |
      v
/rank batch agents
      |
      v
Ranked shortlist
      |
      v
/apply fit checkpoint
      |
   user approves
      |
      v
CV and letter drafts
      |
      v
Fresh reviewer agent and company research
      |
      v
Revisions, compilation, and verification
      |
      v
Application archive and tracker
      |
      v
/outcome and later setup calibration
```

## How ranking works

`/rank` is deliberately cheaper than `/apply`.

It scores posting text against the candidate profile without company research.

The formula is:

```text
overall = technical x 0.30
        + experience x 0.25
        + behavioral x 0.15
        + career alignment x 0.30
```

Location is a veto, not another weighted score.

A failed location constraint removes the job regardless of overall score.

The verdict bands come from `04-job-evaluation.md`.

| Score | Triage verdict |
|---|---|
| 75 or higher | Strong fit |
| 60 to 74 | Good fit |
| 45 to 59 | Moderate fit |
| 30 to 44 | Weak fit |
| Below 30 | Poor fit |

These numbers create consistency. They do not prove that the rubric is correct.

That distinction matters for future evaluation design.

## How subagents are used

The system uses agents for bounded work with fresh context.

### Batch ranking

`/rank` assigns about five jobs to each parallel agent.

The parent passes a compact rubric and job list directly.

Agents fetch full postings before scoring them.

They mark inaccessible postings as expired instead of guessing from titles.

### Application review

`/apply` uses one fresh reviewer after the first drafts exist.

The reviewer researches the company and critiques both documents.

It returns exact replacements plus narrative suggestions.

The main agent verifies company claims before using them.

This creates useful separation between drafting and critique.

## Human approval boundaries

The workflow has one important checkpoint before document drafting.

The user sees the deep fit assessment and decides whether to proceed.

After approval, the system drafts both application documents together.

That differs from the personal-os skills.

Personal-os separates fit, resume tailoring, and cover letter drafting.

It also requires more user control over resume changes and emotional resonance.

## Reliability design

Three safeguards are especially useful.

### Portal verification

`/add-portal` requires live search and detail tests before registration.

This tests the adapter contract against the real source.

### Idempotent ranking

Previously ranked jobs are skipped unless the user requests reranking.

This reduces duplicated work and accidental state changes.

### Artifact verification

LaTeX compilation is followed by PDF inspection and ATS extraction checks.

The workflow does not assume valid source code means a usable document.

## Feedback and self-correction

The repository contains two partial feedback loops.

### Outcome loop

`/outcome` records application progress and results.

Later `/setup` runs can use those outcomes for calibration notes.

The original scoring weights remain unchanged unless a human edits them.

### Reviewer loop

The reviewer critiques a draft before final verification.

This improves one application during the current run.

It does not learn a durable user preference automatically.

### Missing loop

There is no structured form for user ratings of search or document quality.

There is no regression dataset connecting predictions with later judgments.

Therefore, the system is iterative but not yet self-learning.

## The upskilling problem

The upskill workflow aggregates gaps across assessed jobs.

Its current weighting gives more influence to lower-fit roles.

That can prioritize skills required mainly by unsuitable jobs.

For personal-os, learning demand should use two separate views.

```text
Market demand view        Target-role gap view
What employers request   What suitable roles require from you
```

The first view measures posting frequency without personal fit weighting.

The second view uses only roles above an agreed suitability threshold.

Keeping both views prevents the market from redefining the user's target identity.

## What to borrow for personal-os

### Borrow now

1. Durable search configuration with portal-specific parameters.
2. A tested adapter contract for search and job detail retrieval.
3. Separate cheap triage from expensive company research and drafting.

### Borrow after the first workflow works

1. Fresh reviewer context for document critique.
2. Archived run summaries with inputs, outputs, and versions.
3. Deterministic PDF and ATS checks after content approval.

### Do not copy directly

1. Do not combine resume and cover letter work into one irreversible stage.
2. Do not treat weighted fit scores as validated truth.
3. Do not let low-fit jobs dominate the learning plan.

## How to find unknown unknowns

Use three lenses after every real application run.

### Lens 1: Workflow completeness

Ask where information enters, changes ownership, and becomes final.

- Does every stage have required inputs?
- Does every handoff have a defined output?
- Does every branch have a stopping condition?

### Lens 2: Decision quality

Ask how every recommendation can be challenged and tested.

- Is the rubric visible and versioned?
- Can every claim trace to evidence?
- Can user disagreement become a labeled example?

### Lens 3: Operational reliability

Ask what happens when reality differs from the happy path.

- Are dead postings and API changes explicit states?
- Can failed steps resume without repeating everything?
- Can a new version replay earlier examples without regression?

An unknown becomes visible when one question has no concrete answer.

That missing answer should become a test, state field, or approval checkpoint.

## A practical completeness test

Run one job through the system and capture these three records.

| Record | What it reveals |
|---|---|
| Decision trace | Why the system searched, filtered, scored, or drafted |
| User correction | Where your judgment differs from the system |
| Failure trace | What broke, degraded, or required manual recovery |

Repeat this with deliberately difficult examples.

Include misleading titles, missing details, weak evidence, and changed preferences.

The collected corrections become the first evaluation dataset.

## Source map

Start with these files when verifying this guide.

| Question | Primary source |
|---|---|
| How does ranking work? | `.claude/commands/rank.md` |
| How does application drafting work? | `.claude/commands/apply.md` |
| How are outcomes recorded? | `.claude/commands/outcome.md` |
| Where is the fit rubric? | `.claude/skills/job-application-assistant/04-job-evaluation.md` |
| Where are searches configured? | `.claude/skills/job-scraper/search-queries.md` |
| How are portals added? | `.claude/commands/add-portal.md` |
| How are skill gaps aggregated? | `.claude/skills/upskill/SKILL.md` |
| What did one completed run produce? | `session_output/` and `cv/` |

## Final interpretation

This project is strongest as a reference for orchestration and adapter verification.

It is weaker as a reference for evidence-based learning from user feedback.

For personal-os, borrow its pipeline mechanics without inheriting its decision assumptions.
