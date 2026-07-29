# How Leslie’s Notes on AI Was Built

**Completed:** 27 July 2026

**Production:** <https://leslies-notes-on-ai.vercel.app>

**Repository:** <https://github.com/maynard242/leslies-notes-on-ai>

This document records the decisions, implementation sequence, verification, and publishing workflow used to create the site. The editorial model lives separately in [`APPROACH.md`](../APPROACH.md).

## 1. What we chose

The site was designed as Leslie’s maintained personal reference library rather than a news blog or document dump.

The core choices were:

- **Canonical Markdown:** every note begins as a normal `.md` file under [`notes/`](../notes/).
- **Git-backed history:** content and code change together, with reviewable diffs and recoverable versions.
- **Static-first Next.js:** notes are discovered and rendered at build time rather than fetched from a database.
- **No CMS or database:** the first release needs neither operational infrastructure nor proprietary content storage.
- **Visible provenance:** note metadata records publication, update, and maintenance status, plus verification and version when supplied.
- **Primary-source discipline:** time-sensitive claims are dated and supported close to the claim.
- **Automated quality gates:** malformed or unsafe content fails before production deployment.
- **Continuous deployment:** GitHub `main` is connected to Vercel; pull requests get previews and pushes to `main` go to production.

## 2. Repository structure

```text
.
├── notes/                         Canonical Markdown notes, organized by section
├── app/                           Next.js App Router pages and routes
│   ├── notes/[slug]/              Static note page
│   ├── notes/[slug]/raw/          Raw Markdown response
│   ├── feed.xml/                  RSS feed
│   ├── page.tsx                   Home page
│   ├── sitemap.ts                 Sitemap
│   └── robots.ts                  Robots metadata
├── components/                    Header, footer, note cards, filtering, TOC
├── lib/
│   ├── format.ts                  Shared date and note-kind labels
│   ├── library.ts                 Reader-facing library state helpers
│   ├── notes.ts                   Discovery, validation, rendering, TOC logic
│   ├── search.ts                  Metadata-search normalization
│   └── site.ts                    Site identity and canonical URL handling
├── scripts/validate-content.mjs  Build-time content contract
├── scripts/review-notes.mjs       Staleness report for published notes
├── tests/notes.test.ts            Content-pipeline regression tests
├── APPROACH.md                    Editorial and reference approach
└── docs/                          Plans, implementation record, and review process
```

Generated output such as `.next/`, local Vercel metadata under `.vercel/`, dependencies, environment files, logs, and TypeScript build metadata are ignored by Git.

## 3. Content flow

```text
notes/<section>/*.md
   │
   ├── scripts/validate-content.mjs
   │      rejects malformed metadata, invalid/mismatched sections, invalid dates, unstable slugs,
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

Each note sits in one of six section directories—`Data`, `Training`, `Post-Training`, `Agents`, `Governance`, or `Misc`—and uses its filename as a stable public slug. Its front matter repeats the matching section:

```yaml
---
title: "A precise title"
description: "One-sentence scope"
kind: "reference"
section: "Governance"
published: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
checked: "YYYY-MM-DD" # optional
version: "1.0"        # optional
status: "Draft | Reviewed | Maintained | Archived"
topics:
  - topic
order: 10              # optional
---
```

The four statuses have distinct meanings:

- **Draft:** remains in the repository but is excluded from the site, direct note routes, RSS, and sitemap. It is not confidential if committed to the public GitHub repository.
- **Reviewed:** checked and suitable for publication.
- **Maintained:** published with an explicit expectation of continuing review.
- **Archived:** remains public for historical reference with its lifecycle state visible.

`kind` is an open kebab-case field describing how the note is used, such as `reference`, `guide`, `explainer`, `checklist`, `case-study`, or `reading-note`. `section` is a closed retrieval field and must match the parent directory. `topics` describe subject matter and power metadata search. `checked` and `version` are optional so shorter or durable notes do not need invented maintenance metadata.

The first note, [`AI Governance for Engineers`](../notes/Governance/ai-governance-for-engineers.md), was revised as a long-form engineer-facing reference. Its regulatory, standards, research, and tooling claims were checked against cited primary sources, given explicit verification dates, and separated from durable engineering guidance.

## 5. Implementation sequence

### Step 1 — Preserve the source material

The project and `notes/` directory were created first. The reviewed governance document was copied rather than moved so the validated source remained preserved while the publication copy gained front matter.

### Step 2 — Save the editorial model

[`APPROACH.md`](../APPROACH.md) recorded the purpose, reference loop, note anatomy, front-matter contract, information architecture, and update policy before the UI was built.

### Step 3 — Build the content pipeline

[`lib/notes.ts`](../lib/notes.ts) was implemented to:

- discover Markdown recursively by stable filename;
- validate a note's section against its parent directory;
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
- a section that is invalid or does not match its parent directory;
- an impossible or malformed date;
- an invalid status or empty topics;
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
- consistent draft exclusion across public site surfaces;
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

### Step 11 — Generalize the library and publish the second note

The second note, [`Harnesses`](../notes/Agents/harnesses.md), exposed the remaining assumptions inherited from a one-note launch. The content model and interface were revised before publication:

- `kind` now describes the form of a note without constraining future forms to a fixed application enum;
- `topics` replaced the more publication-oriented `tags` name;
- `checked` and `version` became optional rather than forcing artificial values onto every note;
- `Archived` became an explicit public lifecycle state;
- the unused `featured` field was removed;
- note cards, note pages, search, and RSS consume the generalized metadata;
- the home page was rewritten as a personal reference library rather than a learning programme;
- [`docs/NOTE_TEMPLATE.md`](./NOTE_TEMPLATE.md) became the operational starting point for future notes.

The static architecture did not change. This was a schema and positioning correction, not a reason to add a database or CMS.

### Step 12 — Add a note review process

Publishing scales past one note only if the library stays accurate. [`scripts/review-notes.mjs`](../scripts/review-notes.mjs) reads every note's `checked` (or `updated`) date and flags `Reviewed`/`Maintained` notes past a configurable age threshold, exempting `Archived` and skipping `Draft`. It ships as `npm run review:stale`, separate from `npm run check`, because staleness is advisory, not a build gate.

[`docs/REVIEW_PROCESS.md`](./REVIEW_PROCESS.md) records the triage workflow: re-verify sources, decide still-accurate versus needs-revision versus superseded, apply the version and change-history conventions, then run the normal `npm run check` → commit → push cycle. The read-only monthly Hermes Cron job is named in that document with its owner, schedule, delivery channel, expected output, and failure path; it never edits a note itself.

### Step 13 — Section the library and clarify authorship

The library was organized into `Data`, `Training`, `Post-Training`, `Agents`, `Governance`, and `Misc`. Notes are discovered recursively, but retain public URLs based on their filenames; duplicate filenames across sections are rejected. The home page groups notes by section, and the shared site shell and every note page use the compact attribution *Written and updated by AI and Leslie Teo.* The site describes itself as a practical technical reference library for using and adopting AI safely.

Leslie remains responsible for editorial judgment, source review, and publication. AI assists research, drafting, and updates; it does not replace those responsibilities.

## 6. Reader cues and source practice

The library later gained explicit publication, update, and source-verification dates; a count-based section index; and query-aware empty states. This keeps the six-section map visible without confusing a populated section that merely has no search match.

A companion source and maintenance pass added [`docs/TOPICS.md`](./TOPICS.md), a minimum source-record convention, a consistent `## Change history` convention for substantial notes, and a named read-only monthly Hermes Cron review. The Board Governance guide was rechecked and upgraded with direct citations and a formal source record.

## 7. Current publishing workflow

### Add or revise a note

```bash
# Create or edit the canonical source
$EDITOR notes/Governance/my-note.md

# Keep it off the website while working
# status: "Draft"

# Run the full local gate
npm run check

# When reviewed, change status to Reviewed or Maintained
# Then commit and push
git add notes/Governance/my-note.md
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

## 8. Why this approach scales

Adding a note does not require a new page component, database row, CMS action, or deployment script. A valid Markdown file automatically participates in:

- the home-page library;
- static note generation;
- reading-time and optional version/verification metadata;
- table-of-contents generation;
- raw-source access;
- RSS;
- sitemap discovery;
- Git history;
- Vercel preview and production deployment.

The trade-off is deliberate: this system optimizes for Leslie as the accountable editor, assisted by AI, and for a searchable, reviewable reference corpus. If editing volume or contributors grow substantially, a CMS can be added later without abandoning the Markdown source contract.

## 9. Math rendering

The Training-section notes on continued pretraining, tokenization, and evaluation introduced inline and display LaTeX (`$...$` and `$$...$$`) for the first time. The rendering pipeline had no math support, so the first review found it was already a live defect: the published [`Harnesses`](../notes/Agents/harnesses.md) note's reliability model had been rendering as literal, unrendered LaTeX source in production.

The fix added `remark-math` and `rehype-katex` to [`lib/notes.ts`](../lib/notes.ts)'s render chain, between `remark-rehype` and `rehype-sanitize`. KaTeX's HTML output uses MathML tags, positioned `<span>`s with inline `style`, and glyph `<svg>`/`<path>` elements that the existing GitHub-style sanitize schema doesn't allow, so the schema was extended with a dedicated `katexSchema` (built from `rehype-sanitize`'s `defaultSchema`) rather than disabling sanitization for math content. `app/layout.tsx` imports `katex/dist/katex.min.css` globally so the fonts and glyph positioning ship on every page.

Verification compared byte-for-byte KaTeX output before and after the extended sanitize schema (identical, aside from continuing to strip an injected `<script>` and a `javascript:` link), then confirmed in a local dev build that the previously-broken `harnesses` note now renders `.katex`/`.katex-display` markup with no literal `$$` left in the page. Regression tests in [`tests/notes.test.ts`](../tests/notes.test.ts) cover both the rendering and the continued sanitization of unsafe content.

## 10. Operating principles worth preserving

1. Markdown under section directories in `notes/` remains canonical.
2. Draft means unpublished by the website, not confidential in the public repository.
3. Time-sensitive claims carry a `checked` date.
4. Stable slugs should not change casually.
5. The production build must enforce the content contract.
6. Rendering safety belongs in both validation and HTML sanitization.
7. Git records the editorial history; Vercel is the delivery layer.
8. A successful build is not enough—smoke-test the live routes.
9. Add infrastructure only when the content workflow demands it.
10. A published note is a standing claim—review it on a schedule, not only when someone happens to reread it.
