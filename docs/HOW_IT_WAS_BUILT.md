# How Leslie’s Notes on AI Was Built

**Completed:** 27 July 2026

**Production:** <https://leslies-notes-on-ai.vercel.app>

**Repository:** <https://github.com/maynard242/leslies-notes-on-ai>

This document records the decisions, implementation sequence, verification, and publishing workflow used to create the site. The editorial model lives separately in [`APPROACH.md`](../APPROACH.md).

## 1. What we chose

The site was designed as a maintained learning system rather than a news blog or document dump.

The core choices were:

- **Canonical Markdown:** every note begins as a normal `.md` file under [`notes/`](../notes/).
- **Git-backed history:** content and code change together, with reviewable diffs and recoverable versions.
- **Static-first Next.js:** notes are discovered and rendered at build time rather than fetched from a database.
- **No CMS or database:** the first release needs neither operational infrastructure nor proprietary content storage.
- **Visible provenance:** note metadata records publication, update, verification, version, and maintenance status.
- **Primary-source discipline:** time-sensitive claims are dated and supported close to the claim.
- **Automated quality gates:** malformed or unsafe content fails before production deployment.
- **Continuous deployment:** GitHub `main` is connected to Vercel; pull requests get previews and pushes to `main` go to production.

## 2. Repository structure

```text
.
├── notes/                         Canonical Markdown notes
├── app/                           Next.js App Router pages and routes
│   ├── notes/[slug]/              Static note page
│   ├── notes/[slug]/raw/          Raw Markdown response
│   ├── feed.xml/                  RSS feed
│   ├── page.tsx                   Home page
│   ├── sitemap.ts                 Sitemap
│   └── robots.ts                  Robots metadata
├── components/                    Header, footer, note cards, filtering, TOC
├── lib/
│   ├── notes.ts                   Discovery, validation, rendering, TOC logic
│   └── site.ts                    Site identity and canonical URL handling
├── scripts/validate-content.mjs  Build-time content contract
├── tests/notes.test.ts            Content-pipeline regression tests
├── APPROACH.md                    Editorial and learning approach
└── docs/                          Plans and implementation record
```

Generated output such as `.next/`, local Vercel metadata under `.vercel/`, dependencies, environment files, logs, and TypeScript build metadata are ignored by Git.

## 3. Content flow

```text
notes/*.md
   │
   ├── scripts/validate-content.mjs
   │      rejects malformed metadata, invalid dates, unstable slugs,
   │      unresolved placeholders, and unsafe URL schemes
   │
   └── lib/notes.ts
          ├── gray-matter parses front matter
          ├── reading-time calculates reading metadata
          ├── Remark parses Markdown and GFM
          ├── Rehype sanitizes and renders HTML
          ├── GitHub-style heading slugs produce stable anchors and TOC links
          └── Draft notes are removed from public discovery
                    │
                    ├── home-page library
                    ├── /notes/[slug]
                    ├── /notes/[slug]/raw
                    ├── /feed.xml
                    └── /sitemap.xml
```

All published note routes are statically generated. `dynamicParams = false` means an unknown or unpublished slug cannot silently become a dynamic page.

## 4. The note contract

Each note uses its filename as a stable public slug and begins with YAML front matter:

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

The three statuses have distinct meanings:

- **Draft:** remains in the repository but is excluded from the site, direct note routes, RSS, and sitemap.
- **Reviewed:** checked and suitable for publication.
- **Maintained:** published with an explicit expectation of continuing review.

The first note, [`AI Governance for Engineers`](../notes/ai-governance-for-engineers.md), was revised as a long-form engineer-facing reference. Its regulatory, standards, research, and tooling claims were checked against cited primary sources, given explicit verification dates, and separated from durable engineering guidance.

## 5. Implementation sequence

### Step 1 — Preserve the source material

The project and `notes/` directory were created first. The reviewed governance document was copied rather than moved so the validated source remained preserved while the publication copy gained front matter.

### Step 2 — Save the editorial model

[`APPROACH.md`](../APPROACH.md) recorded the purpose, learning loop, note anatomy, front-matter contract, information architecture, and update policy before the UI was built.

### Step 3 — Build the content pipeline

[`lib/notes.ts`](../lib/notes.ts) was implemented to:

- discover Markdown by stable filename;
- parse and validate required metadata;
- reject impossible calendar dates;
- calculate word count and reading time;
- exclude drafts from public output;
- render GitHub-flavoured Markdown;
- sanitize rendered HTML and unsafe links;
- generate stable heading anchors and a second-/third-level table of contents;
- return the original Markdown for the raw-source route.

### Step 4 — Build the site surface

The Next.js App Router was used for:

- a responsive home page and searchable note library;
- statically generated note pages;
- per-note metadata and canonical URLs;
- a table of contents for long notes;
- raw Markdown access;
- RSS, sitemap, robots, icon, and not-found routes;
- accessible navigation, focus treatment, skip link, readable typography, and mobile layout.

### Step 5 — Make bad content fail early

[`scripts/validate-content.mjs`](../scripts/validate-content.mjs) became part of `npm run build`, not an optional preflight. A Vercel build therefore fails when a note has:

- a filename that is not a stable kebab-case slug;
- missing required front matter;
- an impossible or malformed date;
- an invalid status or empty tags;
- no level-one heading;
- unresolved `TODO` or `TBD` markers;
- unsafe link or image schemes;
- an insecure remote image URL.

### Step 6 — Add regression tests

Vitest tests cover:

- note discovery and metadata;
- table-of-contents slug stability, including repeated headings;
- GFM tables and HTML sanitization;
- unsafe `javascript:` links;
- raw and rendered note output;
- draft exclusion;
- impossible calendar dates.

A test-only alias replaces Next.js’s `server-only` marker under Vitest without changing production behavior.

### Step 7 — Run a review and hardening loop

After the first working build, an independent source review checked content safety, routing, accessibility, metadata, RSS, sitemap, responsive behavior, Vercel compatibility, and accidental generated files.

The resulting fixes included:

- Markdown sanitization and URL-scheme checks;
- mandatory content validation during production builds;
- tests that continue to work when more notes are added;
- genuine draft privacy;
- stronger text contrast and visible keyboard focus;
- strict calendar-date validation;
- Vercel URL safeguards;
- matching TOC and rendered heading IDs;
- ignored Vercel and TypeScript build metadata.

The full quality gate was rerun after those changes.

### Step 8 — Verify locally

The canonical command is:

```bash
npm run check
```

It runs:

1. Vitest
2. TypeScript checking
3. ESLint
4. content validation
5. the Next.js production build

The initial release passed all checks, produced nine static/SSG routes, passed desktop and real-device-emulated mobile visual review, and reported no npm audit vulnerabilities.

### Step 9 — Deploy and verify production

The initial deployment used the Vercel CLI after browser/device authorization. Production smoke tests checked:

- `/`
- `/notes/ai-governance-for-engineers`
- `/notes/ai-governance-for-engineers/raw`
- `/feed.xml`
- `/sitemap.xml`
- `/robots.txt`

Each route returned HTTP 200 with expected content, and RSS/sitemap URLs used the production hostname.

### Step 10 — Add GitHub and continuous deployment

The local repository was published openly at <https://github.com/maynard242/leslies-notes-on-ai>. The Vercel project was then connected to that GitHub repository with `main` as the production branch.

A real documentation push was used to verify the integration. Vercel detected the commit, built it, marked the deployment ready, and assigned <https://leslies-notes-on-ai.vercel.app> as the production alias.

## 6. Current publishing workflow

### Add or revise a note

```bash
# Create or edit the canonical source
$EDITOR notes/my-note.md

# Keep it private while working
# status: "Draft"

# Run the full local gate
npm run check

# When reviewed, change status to Reviewed or Maintained
# Then commit and push
git add notes/my-note.md
git commit -m "content: publish my note"
git push origin main
```

Vercel builds the pushed commit and promotes a successful `main` build to production. Use a pull request instead when a preview and review step are useful.

### Verify the deployment

Check both the page and generated discovery surfaces:

```bash
curl -I https://leslies-notes-on-ai.vercel.app/notes/my-note
curl -I https://leslies-notes-on-ai.vercel.app/feed.xml
curl -I https://leslies-notes-on-ai.vercel.app/sitemap.xml
```

For a substantive layout change, also inspect the desktop and mobile render rather than relying on HTTP status alone.

## 7. Why this approach scales

Adding a note does not require a new page component, database row, CMS action, or deployment script. A valid Markdown file automatically participates in:

- the home-page library;
- static note generation;
- reading-time and version metadata;
- table-of-contents generation;
- raw-source access;
- RSS;
- sitemap discovery;
- Git history;
- Vercel preview and production deployment.

The trade-off is deliberate: this system optimizes for a single careful author and a reviewable research corpus. If editing volume or contributors grow substantially, a CMS can be added later without abandoning the Markdown source contract.

## 8. Operating principles worth preserving

1. Markdown under `notes/` remains canonical.
2. Draft must mean unpublished.
3. Time-sensitive claims carry a `checked` date.
4. Stable slugs should not change casually.
5. The production build must enforce the content contract.
6. Rendering safety belongs in both validation and HTML sanitization.
7. Git records the editorial history; Vercel is the delivery layer.
8. A successful build is not enough—smoke-test the live routes.
9. Add infrastructure only when the content workflow demands it.
