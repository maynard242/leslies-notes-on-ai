# Reference Library Generalization Implementation Plan

**Status:** Implemented locally; production verification pending.

> **For Hermes:** Implement and verify this plan task-by-task.

**Goal:** Publish the Harnesses note and reshape Leslie’s Notes on AI into a durable personal reference library that can accept many kinds of notes without changing application code.

**Architecture:** Keep Markdown and static generation. Generalize the note contract around `kind` and `topics`, make verification dates and versions optional, and preserve build-time validation, draft exclusion, RSS, sitemap, raw source, and Git/Vercel delivery.

**Tech Stack:** Next.js App Router, TypeScript, Unified/Remark/Rehype, Vitest, GitHub, Vercel.

---

## Task 1 — Generalize the note contract

**Files:** `lib/notes.ts`, `scripts/validate-content.mjs`, `tests/notes.test.ts`

- Replace site-specific `tags` with `topics`.
- Add a general `kind` field for reference, guide, explainer, checklist, case study, or future forms without a schema migration.
- Keep `title`, `description`, `published`, `updated`, `status`, and non-empty `topics` required.
- Make `checked` and `version` optional so short or durable notes do not need artificial values.
- Add `Archived` as a public but clearly labeled lifecycle state.
- Retain strict dates, safe URLs, stable slugs, and unpublished drafts.
- Add regression coverage for two real notes and the optional fields.

## Task 2 — Migrate and publish the notes

**Files:** `notes/ai-governance-for-engineers.md`, `notes/harnesses.md`

- Mark both as `kind: reference`.
- Rename `tags` to `topics`.
- Remove the unused `featured` field.
- Preserve dates, versions, status, order, body, citations, and slugs.

## Task 3 — Reframe the site as Leslie’s reference library

**Files:** `lib/site.ts`, `app/page.tsx`, `components/note-card.tsx`, `components/note-library.tsx`, `components/site-footer.tsx`, `app/notes/[slug]/page.tsx`

- Replace learning-site language with personal-reference language.
- Show and search `kind` and `topics`.
- Render optional checked/version metadata without empty labels.
- Keep the existing accessible, responsive visual system.

## Task 4 — Update repository guidance

**Files:** `README.md`, `APPROACH.md`, `docs/HOW_IT_WAS_BUILT.md`

- Record the generalized front-matter contract.
- Clarify that the site is Leslie’s personal reference library.
- Document the current publish and maintenance workflow.
- Record deliberate deferrals: no CMS, database, or full-text index yet.

## Task 5 — Verify and ship

- Run content validation, tests, typecheck, lint, build, audit, and Markdown/link checks.
- Inspect the source diff and get an independent release-blocker review.
- Commit and push to `main`.
- Verify the Git-triggered Vercel deployment and smoke the home page, both notes, raw source, RSS, sitemap, and robots.

## Acceptance gates

- [x] Both published notes validate and render.
- [x] A published note without `checked` or `version` is accepted and renders without empty labels.
- [x] Draft exclusion still covers routes, lists, RSS, and sitemap.
- [x] Search finds notes by title, description, `kind`, and `topics`.
- [x] `npm run check`, `npm audit`, link checking, documentation checks, and `git diff --check` pass.
- [ ] Production serves the Harnesses page, raw Markdown, RSS entry, and sitemap entry.
