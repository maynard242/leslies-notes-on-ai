# Leslie’s Notes on AI Initial Site Implementation Plan

> **For Hermes:** Implement and verify this plan task-by-task.

**Goal:** Build and deploy a Markdown-first Vercel website with AI Governance for Engineers as the first published note.

**Architecture:** Next.js discovers canonical Markdown under `notes/` at build time. Server components render sanitized Markdown; static routes provide note pages, raw source, RSS, sitemap, and robots metadata. No database or CMS is required.

**Tech Stack:** Next.js, React, TypeScript, Unified/Remark/Rehype, Vitest, ESLint, Vercel.

---

## Task 1 — Workspace and content contract

- Create `notes/`, `docs/plans/`, `APPROACH.md`, and `README.md`.
- Copy the reviewed governance note and add validated front matter.
- Success: `node scripts/validate-content.mjs` reports one valid note.

## Task 2 — Content pipeline

- Create `lib/notes.ts` and `lib/site.ts`.
- Parse front matter, reject malformed metadata, calculate reading time, render Markdown safely, and build a heading index.
- Success: Vitest proves note discovery, HTML rendering, and heading extraction.

## Task 3 — Website

- Create the shared layout, home page, note page, library filter, header, footer, and responsive styling.
- Create raw Markdown, RSS, sitemap, robots, and not-found routes.
- Success: TypeScript, ESLint, and Next production build pass.

## Task 4 — Content and visual smoke test

- Start the production server locally.
- Verify home, note, raw source, feed, and sitemap endpoints.
- Inspect the rendered desktop and mobile pages.
- Success: all endpoints return expected content without browser errors.

## Task 5 — Deployment and handoff

- Confirm Vercel authentication, deploy to production, and smoke the production hostname.
- Initialize Git and record a clean baseline commit.
- Success: public URL is reachable and the first note is published.
