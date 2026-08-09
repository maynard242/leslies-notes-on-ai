# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

A Markdown-first personal reference library (Next.js App Router + TypeScript), not a typical application. The overwhelming majority of changes are **content** — new or revised notes under `notes/` — not code. Code exists to discover, validate, render, and publish that Markdown; treat the content contract as the thing to protect above all else.

The editorial model (purpose, reference loop, note anatomy) lives in [`APPROACH.md`](./APPROACH.md). The implementation history and full build sequence live in [`docs/HOW_IT_WAS_BUILT.md`](./docs/HOW_IT_WAS_BUILT.md). Read those before making structural changes rather than re-deriving decisions already recorded there.

## Content model at a glance

Full detail is in `APPROACH.md`; this is the on-ramp so you don't need to open it just to add or edit a note.

- **Six sections**, closed and positional: `Data`, `Training`, `Post-Training`, `Agents`, `Governance`, `Misc`. The canonical `Governance` section is displayed to readers as **Strategy & Governance**. A note's `section` front-matter field must match its parent directory exactly.
- **`kind`** is an open kebab-case vocabulary describing how the note is used (`reference`, `guide`, `explainer`, `checklist`, `case-study`, `reading-note`), not its subject.
- **`topics`** are open retrieval terms; follow the existing vocabulary in [`docs/TOPICS.md`](./docs/TOPICS.md) instead of inventing near-duplicates.
- **Required front matter:** `title`, `description`, `kind`, `section`, `published`, `updated`, `status`, non-empty `topics`. **Optional:** `checked` (only when source-backed claims were actually re-verified), `version` (only on notes that already carry one), `order`.
- **Status lifecycle:** `Draft` (excluded from the public site/RSS/sitemap, but still committed to a public GitHub repo — never confidential) → `Reviewed` → `Maintained` (published, expected to keep being reviewed) → `Archived` (kept public, visibly superseded/old).
- Start a new note from [`docs/NOTE_TEMPLATE.md`](./docs/NOTE_TEMPLATE.md). For a stale published note, follow the triage workflow in [`docs/REVIEW_PROCESS.md`](./docs/REVIEW_PROCESS.md) (still-accurate / needs-revision / superseded) rather than editing ad hoc.
- Current published notes (8): `multilingual-tokenizers`, `continued-pretraining-mid-training`, `sea-helm-multilingual-cultural-evaluation` (all `Training`); `post-training-brief` (`Post-Training`); `harnesses` (`Agents`); `ai-governance-board-note`, `ai-governance-for-engineers` (both `Governance`); `from-prompts-to-persistent-workflows` (`Misc`). Don't hardcode this list elsewhere — `notes/` on disk and `APPROACH.md`'s own list are the sources of truth; this line is a snapshot, not a contract.

## Commands

```bash
npm install
npm run dev              # local dev server at http://localhost:3000

npm run check             # canonical full gate: test -> typecheck -> lint -> build
npm run test              # vitest run (all tests)
npx vitest run tests/notes.test.ts        # single test file
npx vitest run -t "keeps draft notes out" # single test by name
npm run typecheck          # tsc --noEmit
npm run lint               # eslint .
npm run build              # validate:content, then next build (content errors fail the build)
npm run validate:content   # standalone content-contract check (scripts/validate-content.mjs)
npm run review:stale       # staleness report; --threshold=N and --json supported
```

Run `npm run check` before flipping any note's `status` to `Reviewed` or `Maintained`, and before pushing code changes to `main` (Vercel builds `main` directly to production; PRs get previews).

## Deployment

- **Production:** https://leslies-notes-on-ai.vercel.app — GitHub repo [`maynard242/leslies-notes-on-ai`](https://github.com/maynard242/leslies-notes-on-ai), Vercel project `leslies-notes-on-ai` (`.vercel/project.json` has the linked `projectId`/`orgId`).
- **Deploy model:** push to `main` → production build; open a PR → preview deployment. No manual deploy step, no staging environment beyond PR previews.
- **No database, no runtime secrets.** The only environment-sensitive piece is `getSiteUrl()` in `lib/site.ts`: it reads `NEXT_PUBLIC_SITE_URL` first, falls back to Vercel's `VERCEL_PROJECT_PRODUCTION_URL`/`VERCEL_URL`, and **throws on purpose** if neither is set while running under Vercel (`VERCEL=1`). That guard exists to stop RSS/sitemap from silently emitting a wrong canonical URL — do not add a fallback that swallows it.
- After a substantive layout or routing change, smoke-check the live routes rather than trusting a green build alone: `/`, a note page, `/feed.xml`, `/sitemap.xml`, `/robots.txt`. See `docs/HOW_IT_WAS_BUILT.md` §7 for the exact commands.

## Content pipeline architecture

```
notes/<Section>/<slug>.md
   -> scripts/validate-content.mjs   (build-time gate: npm run build fails on violation)
   -> lib/notes.ts                    (gray-matter parse, same validation, reading-time,
                                        remark/rehype render + sanitize, TOC, draft filtering)
   -> app/page.tsx (home library), app/notes/[slug]/page.tsx, app/notes/[slug]/raw/route.ts,
      app/feed.xml/route.ts, app/sitemap.ts
```

Key structural facts, each easy to miss from a single file:

- **The validator and the runtime parser duplicate each other's rules.** `scripts/validate-content.mjs` and `parseMeta` in `lib/notes.ts` independently enforce the same front-matter contract (required fields, kebab-case `kind`, section enum, date format, status enum, non-empty `topics`, etc.). Changing the contract means updating both, or the two will silently drift.
- **`section` is closed and positional.** Valid values live in `lib/sections.ts` (`NOTE_SECTIONS`) and must exactly match the note's parent directory name (`assertSectionPath` in `lib/notes.ts`, mirrored in the validator). `kind` and `topics`, by contrast, are open editorial vocabularies — `kind` just needs to be kebab-case, and `topics` conventions live in [`docs/TOPICS.md`](./docs/TOPICS.md), not in code.
- **The filename is the permanent public slug**, independent of which section directory it's currently in — duplicate slugs across sections are rejected (`getAllNoteSources`).
- **`Draft` is a status, not a permission.** Draft notes are excluded from `listNotes`, `getNoteSlugs`, and `getNoteBySlug` — and therefore from the home page, note routes, RSS, and sitemap — but they are still committed to a public GitHub repository and readable there. Never put confidential material in a draft note.
- **Two independent slug generators must agree.** `extractToc` (in `lib/notes.ts`) walks a separate `remark-parse` pass with its own `GithubSlugger` instance to build the table of contents, while the actual rendered heading IDs come from `rehype-slug` in `renderMarkdown`. Both must produce identical IDs for TOC links to resolve — the test suite checks this explicitly for repeated headings.
- **`checked` and `version` are optional by design**, not omissions — don't backfill them onto every note. `checked` means the source-backed claims were actually re-verified on that date; `version` is only meaningful on notes that already carry one (see [`docs/REVIEW_PROCESS.md`](./docs/REVIEW_PROCESS.md) for the bump convention).
- **No database or CMS.** Git is the history layer, Vercel is the deploy layer. `lib/site.ts`'s `getSiteUrl()` deliberately throws when `VERCEL=1` and no site-URL env var is resolvable — that's a guard against silently wrong canonical URLs in RSS/sitemap, not a bug to paper over with a fallback.
- `lib/library.ts` and `lib/search.ts` are pure, framework-free helpers (section empty-state logic, metadata search normalization) and are unit-tested directly without going through the content pipeline.
- **Math rendering has a custom sanitize schema.** `renderMarkdown` runs `remark-math` -> `remark-rehype` -> `rehype-katex` -> `rehype-sanitize`, in that order. KaTeX's output (MathML, positioned `<span>`s with inline `style`, glyph `<svg>`/`<path>`) needs tags and attributes the default GitHub-style sanitize schema doesn't allow, so `lib/notes.ts` builds `katexSchema` from `rehype-sanitize`'s `defaultSchema` and extends it rather than disabling sanitization. If you touch the render chain, keep `rehypeKatex` before `rehypeSanitize` (unsanitized math would defeat the point) and keep using the extended schema (a bare `rehypeSanitize()` strips math back to literal text — this was a real, previously-shipped bug in the published `harnesses` note; see [`docs/HOW_IT_WAS_BUILT.md`](./docs/HOW_IT_WAS_BUILT.md) §9). `app/layout.tsx` imports `katex/dist/katex.min.css` globally.

## Adding or editing a note

1. Copy [`docs/NOTE_TEMPLATE.md`](./docs/NOTE_TEMPLATE.md) into `notes/<Section>/<stable-slug>.md`.
2. Leave `status: Draft` while working.
3. Follow topic vocabulary in [`docs/TOPICS.md`](./docs/TOPICS.md) rather than inventing new terms per note.
4. For factual/legal/regulatory/empirical/quantitative claims, cite sources close to the claim and include a `## Sources` section.
5. Run `npm run check`.
6. Set `status` to `Reviewed` or `Maintained`, commit, push to `main`.

For revising an already-published note flagged by `npm run review:stale`, follow the triage and change-history conventions in [`docs/REVIEW_PROCESS.md`](./docs/REVIEW_PROCESS.md) rather than editing ad hoc — stale notes are triaged as still-accurate / needs-revision / superseded, each with a specific front-matter and `## Change history` update.

The shared note template renders the attribution line ("Written and updated by AI and Leslie Teo.") automatically — never duplicate or alter it in a note's Markdown body.

## Testing patterns

Content-pipeline tests in `tests/notes.test.ts` don't mock the filesystem — they write real temporary fixture notes into `notes/Misc/` (or another real section) with `randomUUID()`-suffixed slugs, assert against the live pipeline, and remove the fixture in a `finally` block. Follow this pattern for new pipeline tests rather than introducing a mocked/virtual filesystem. One test invokes `scripts/validate-content.mjs` as a subprocess via `spawnSync` against a temp directory — that's the pattern to extend if adding a new validator rule.

`vitest.config.ts` aliases Next's `server-only` marker to a no-op shim (`tests/server-only.ts`) so `lib/notes.ts` can be imported under Vitest's Node environment, and aliases `@` to the repo root to match `tsconfig.json`'s path mapping.
