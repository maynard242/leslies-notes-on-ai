# Leslie’s Notes on AI — Reference and Publishing Approach

## Purpose

**Leslie’s Notes on AI** is a practical technical reference library by AI and Leslie Teo for using and adopting AI safely. It covers how AI systems work, fail, and are governed. It is public because stable links and open sources are useful, but it is designed first for retrieval, maintenance, and reuse—not publishing cadence or audience growth.

Leslie remains accountable for editorial judgment, source review, and publication. AI assists research, drafting, and updates; it is not an independent author or source of authority.

The site should answer three questions quickly:

1. What is the idea or decision?
2. What evidence and working detail support it?
3. When was that evidence last checked?

## Reference loop

Each substantial note should move through seven steps:

1. Frame a real question.
2. Read primary sources before commentary.
3. Explain the idea in plain language.
4. Connect it to an engineering artifact or decision.
5. Evaluate it against a concrete case.
6. Record limits, uncertainty, and source dates.
7. Publish, revisit, and revise as the evidence changes.

Shorter notes can use a lighter structure. The metadata contract is shared; the body should fit the note’s purpose.

## Editorial principles

- Markdown in `notes/` is the canonical source.
- Optimize for finding an answer again, not for a chronological stream.
- Distinguish fact, inference, judgment, and open uncertainty.
- Prefer primary sources for load-bearing claims.
- Use permanent slugs; if a slug must change, preserve a redirect before removing the old route.
- Make time-sensitive claims visibly perishable with `checked` and `updated` dates.
- Keep citations, examples, definitions, and operating detail close to the claim they support.
- Treat evaluation results as bounded evidence, not universal proof.
- Keep the content model small. Add fields only when the library will use them.

## Note kinds

`kind` describes how a note should be used, not its subject. It is deliberately an open kebab-case value rather than a fixed application enum.

Useful starting values include:

- `reference` — a substantial source-backed treatment
- `guide` — a practical sequence or operating method
- `explainer` — a focused concept in plain language
- `checklist` — a reusable decision or review aid
- `case-study` — a bounded example and its lessons
- `reading-note` — findings and judgment from a source

`topics` describe subject matter and drive library search. A governance reference and a safety checklist can therefore share a topic without being the same kind of note. Follow the lightweight alias and capitalization guidance in [`docs/TOPICS.md`](docs/TOPICS.md); it preserves retrieval without turning topics into a rigid enum.

## Sources and source material

The public repository is a library of reviewed synthesis, not a raw-document archive. Keep working copies, annotations, and unvetted source material in a private research workspace. A published note should preserve the durable public links and enough context to re-check its load-bearing claims.

For factual, legal, regulatory, empirical, or quantitative claims:

- cite the source close to the claim when it does real argumentative work;
- include a compact `## Sources` or `## Reading list` section for substantial notes;
- say whether a load-bearing source is primary law, a standard, a paper/preprint, a vendor claim, or commentary;
- record its relevant version or publication date and what it supports;
- distinguish a useful framework from proof that a particular system is safe.

This is a prose convention, not a reference database.

## Note anatomy

A substantial reference may contain:

1. The short version
2. Why it matters
3. The underlying idea
4. The engineering artifact or decision
5. A worked example
6. Where the idea breaks
7. Questions or checks for application
8. Sources and verification date
9. Change history

This is a guide, not a template every note must imitate. A checklist should stay a checklist. A reading note should not be padded into an essay.

## Information architecture

The first retrieval layer is intentionally simple:

- stable note URLs
- six library sections: `Data`, `Training`, `Post-Training`, `Agents`, `Governance`, and `Misc`
- titles and one-sentence descriptions
- `section`, `kind`, and `topics`
- client-side metadata search
- visible status and reading time, plus version and verification date when supplied
- raw Markdown, RSS, and sitemap output

The current notes are:

- **Post-Training in 2026** — `Post-Training` / `reference`
- **Harnesses** — `Agents` / `reference`
- **AI Governance: Five Questions for the Board** — `Governance` / `guide`
- **AI Governance for Engineers** — `Governance` / `reference`

Add dedicated topic pages, related-note links, backlinks, or a full-text index only when the note collection is large enough to show which navigation problem is real.

## Technical architecture

- Next.js App Router and TypeScript
- Build-time Markdown discovery from `notes/`
- `gray-matter` front matter
- Unified/Remark/Rehype Markdown rendering and sanitization
- Static note pages, raw-source routes, RSS, sitemap, robots, and metadata search
- GitHub version history and Vercel deployment
- No database or CMS

## Front-matter contract

```yaml
---
title: "A precise title"
description: "One sentence defining scope and use"
kind: "reference"
section: "Governance"
published: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
checked: "YYYY-MM-DD" # optional: last factual/source verification
version: "1.0"        # optional: useful for substantial references
status: "Draft | Reviewed | Maintained | Archived"
topics:
  - topic
order: 10              # optional: defaults to the end
---
```

Required fields are `title`, `description`, `kind`, `section`, `published`, `updated`, `status`, and a non-empty `topics` list. `kind` must be a kebab-case value. `section` must be one of `Data`, `Training`, `Post-Training`, `Agents`, `Governance`, or `Misc`, and must match the note’s parent directory. Dates must be real ISO calendar dates.

Lifecycle behavior:

- **Draft:** stays in `notes/` for local work but is excluded from the public library, direct routes, RSS, and sitemap. A committed draft is still readable in the public GitHub repository and must not contain confidential material.
- **Reviewed:** checked and suitable for publication.
- **Maintained:** published with an explicit expectation of continuing review.
- **Archived:** remains public for reference while making its age or superseded state visible.

Use `checked` only when the date means something: the source-backed or time-sensitive claims were actually revisited. Use `version` when readers benefit from an explicit content version. Do not invent either value to satisfy the schema; both are optional.

## Update workflow

```bash
# Add or edit a canonical note
$EDITOR notes/Governance/my-note.md

# Validate metadata, tests, types, lint, and production build
npm run check

# Preview locally
npm run dev

# Publish through the connected GitHub repository
git add notes/Governance/my-note.md
git commit -m "content: publish my note"
git push origin main
```

Vercel creates previews for pull requests and promotes successful `main` builds to production.

## Maintenance priorities

1. Add notes without changing application code.
2. Keep source dates and lifecycle status accurate. `npm run review:stale` flags overdue notes; see [`docs/REVIEW_PROCESS.md`](docs/REVIEW_PROCESS.md) for the triage workflow and the named read-only monthly Hermes Cron review.
3. Add related-note navigation when recurring connections appear.
4. Add full-text search when title, kind, description, and topic search becomes insufficient.
5. Add a dedicated stale-note view in the UI if the CLI report becomes insufficient at scale.
6. Introduce diagrams only where they improve retrieval or understanding.

The test is simple: the site should help Leslie recover a useful answer, its evidence, and its limits faster than searching his files from scratch.
