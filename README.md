# Leslie’s Notes on AI

A Markdown-first personal reference library about how AI systems work, fail, and are governed.

## Content

Canonical notes live in [`notes/`](./notes). The website discovers Markdown files at build time, validates their front matter, and publishes stable note URLs.

The reference and editorial approach is recorded in [`APPROACH.md`](./APPROACH.md). The implementation decisions, build sequence, hardening work, deployment, and current publishing workflow are recorded in [`docs/HOW_IT_WAS_BUILT.md`](./docs/HOW_IT_WAS_BUILT.md).

## Development

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Quality gates

```bash
npm run check
```

This runs content validation, tests, TypeScript, ESLint, and a production build.

## Add a note

1. Start from [`docs/NOTE_TEMPLATE.md`](./docs/NOTE_TEMPLATE.md).
2. Save the note as `notes/<stable-slug>.md`. The filename becomes its permanent public URL.
3. Choose a short, reusable `kind`, such as `reference`, `guide`, `explainer`, `checklist`, `case-study`, or `reading-note`.
4. Add one or more `topics` used by library search.
5. Keep `status: Draft` until the note is ready. Drafts are validated but omitted from public pages, routes, RSS, and sitemap. Because this repository is public, a committed draft remains visible on GitHub.
6. Run `npm run check`.
7. Set the final status to `Reviewed` or `Maintained`, then commit and push to `main`. Vercel deploys the successful build automatically.

Required metadata:

- `title`
- `description`
- `kind`
- `published`
- `updated`
- `status`
- non-empty `topics`

Optional metadata:

- `checked` — when factual or source claims were last verified
- `version` — useful for substantial maintained references
- `order` — manual library ordering; defaults to the end

Statuses:

- `Draft` — excluded from the website but still visible if committed to the public GitHub repository; never use it for confidential material
- `Reviewed` — checked and ready to publish
- `Maintained` — published with an explicit expectation of continuing review
- `Archived` — retained publicly as an older reference, with its lifecycle state visible

## Deployment

Production: <https://leslies-notes-on-ai.vercel.app>

The Vercel project is connected to [`maynard242/leslies-notes-on-ai`](https://github.com/maynard242/leslies-notes-on-ai). Pushes to `main` create production deployments; pull requests receive preview deployments.

The site requires no database or runtime secrets. Vercel supplies its production hostname to metadata, RSS, and sitemap generation during deployment.
