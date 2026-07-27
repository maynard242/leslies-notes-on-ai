# Leslie’s Notes on AI — Publishing and Learning Approach

## Purpose

**Leslie’s Notes on AI** is a living field notebook about how AI systems work, fail, and are governed. It turns research into a maintained learning system rather than a chronological news blog.

## Learning loop

Each note should move through seven steps:

1. Start with a real question.
2. Read primary sources before commentary.
3. Explain the idea in plain language.
4. connect it to an engineering artifact or decision.
5. Work through a concrete case.
6. Add questions that test understanding.
7. Publish, date, and revise the note as evidence changes.

## Editorial principles

- Markdown in `notes/` is the canonical source.
- Distinguish fact, inference, judgment, and open uncertainty.
- Prefer primary sources for load-bearing claims.
- Record `checked`, `updated`, `version`, and `status` metadata.
- Make time-sensitive claims visibly perishable.
- Use permanent slugs and preserve redirects if names change.
- Keep full references while also publishing shorter linked lessons.
- Treat evaluation results as bounded evidence, not universal proof.

## Note anatomy

A mature note should contain:

1. The short version
2. Why it matters
3. The underlying idea
4. The engineering artifact
5. A worked example
6. Where the idea breaks
7. Questions to test yourself
8. Sources and verification date
9. Change history

## Initial information architecture

- **Start here** — a guided learning route
- **Foundations** — models, systems, agents, and failure modes
- **Building AI systems** — evaluation, retrieval, authorization, observability
- **AI governance** — controls, evidence, law, standards, and assurance
- **Cases and exercises** — decisions before explanations
- **Glossary and source ledger** — definitions and dated evidence

The first published note is **AI Governance for Engineers**. Later notes should extract concise modules from the full reference while keeping the canonical long-form guide intact.

## Technical architecture

- Next.js App Router and TypeScript
- Build-time Markdown discovery from `notes/`
- `gray-matter` front matter
- Unified/Remark/Rehype Markdown rendering
- Static note pages, RSS, sitemap, raw-source routes, and client-side library filtering
- Vercel deployment with no database or CMS

## Update workflow

```bash
# Add or edit a canonical note
$EDITOR notes/my-note.md

# Validate metadata, links, tests, and production build
npm run check

# Preview locally
npm run dev

# Publish
vercel --prod
```

## Front matter contract

```yaml
---
title: "A precise title"
description: "One-sentence scope"
published: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
checked: "YYYY-MM-DD"
version: "1.0"
status: "Draft | Reviewed | Maintained"
tags:
  - topic
featured: false
order: 10
---
```

## Near-term roadmap

1. Publish the complete governance reference.
2. Add a concise “Start here” page.
3. Extract the seven-stage control loop as a standalone lesson.
4. Add scenario exercises and self-check questions.
5. Add a source-ledger view and stale-note dashboard.
6. Introduce diagrams only where they improve understanding.
