# Note Template

Copy the block below into `notes/<section>/<stable-slug>.md`, using one of `Data`, `Training`, `Post-Training`, `Agents`, `Governance`, or `Misc`. The filename becomes the permanent public URL.

```markdown
---
title: "A precise title"
description: "One specific sentence, 50–180 characters, explaining what the reader will learn, decide, or use."
kind: "reference"
section: "Governance"
published: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
checked: "YYYY-MM-DD"
version: "1.0"
status: "Draft"
topics:
  - topic
order: 10
---

# A precise title

State the short answer or purpose first.

## Why it matters

Explain when this note is useful.

## Working detail

Keep the definitions, evidence, examples, controls, or steps needed to use the note again.

## Limits

Record uncertainty, boundaries, counter-evidence, and what would change the conclusion.

## Sources

Prefer primary sources for load-bearing claims. Put citations close to the claims they support.

- [Source title](https://example.com) — primary law, standard, paper/preprint, vendor claim, or commentary; publication/version date; what it supports.

## Change history

- **YYYY-MM-DD — v1.0:** Initial reviewed version.
```

## Before publishing

- Keep the filename stable and kebab-case; its parent section may change without changing the public URL.
- Set `section` to the matching directory: `Data`, `Training`, `Post-Training`, `Agents`, `Governance`, or `Misc`.
- Replace all placeholder dates and remove unresolved `TODO` or `TBD` markers.
- Choose a 50–180 character description: one specific sentence saying what the reader will learn, decide, or use.
- Follow [`docs/TOPICS.md`](./TOPICS.md): prefer an existing exact term when it means the same thing, and add a new one only when it will be reusable.
- For factual, legal, regulatory, empirical, or quantitative claims, add claim-adjacent citations and a compact `## Sources` or `## Reading list` section. Identify the source type, version/date, and what any load-bearing source supports.
- Keep `checked` only if the source-backed claims were actually verified on that date.
- Use `## Change history` for substantial notes. Record the initial publication and each substantive edit or genuine source re-check.
- Keep `version` only if explicit versions help maintain the note.
- Leave `status: Draft` until the note is ready.
- Remember that a draft committed to this public repository is still readable on GitHub; do not include confidential material.
- The shared note page automatically renders *Written and updated by AI and Leslie Teo.* for every public note. Do not duplicate or alter this attribution in the Markdown body.
- Run `npm run check` before changing the status to `Reviewed` or `Maintained`.
