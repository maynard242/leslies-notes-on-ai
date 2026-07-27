# Note Template

Copy the block below into `notes/<stable-slug>.md`. The filename becomes the permanent public URL.

```markdown
---
title: "A precise title"
description: "One sentence defining the note’s scope and use"
kind: "reference"
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

## Change history

- **YYYY-MM-DD — v1.0:** Initial reviewed version.
```

## Before publishing

- Keep the filename stable and kebab-case.
- Replace all placeholder dates and remove unresolved `TODO` or `TBD` markers.
- Choose a reusable `kind`; do not encode the topic in both `kind` and `topics`.
- Keep `checked` only if the source-backed claims were actually verified on that date.
- Keep `version` only if explicit versions help maintain the note.
- Leave `status: Draft` until the note is ready.
- Remember that a draft committed to this public repository is still readable on GitHub; do not include confidential material.
- Run `npm run check` before changing the status to `Reviewed` or `Maintained`.
