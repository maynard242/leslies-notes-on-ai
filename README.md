# Leslie’s Notes on AI

A Markdown-first learning and publishing site about how AI systems work, fail, and are governed.

## Content

Canonical notes live in [`notes/`](./notes). The website discovers Markdown files at build time, validates their front matter, and publishes stable note URLs.

The editorial and learning approach is recorded in [`APPROACH.md`](./APPROACH.md).

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

1. Copy an existing front-matter block from `notes/`.
2. Save the note as `notes/<stable-slug>.md`.
3. Set `published`, `updated`, `checked`, `version`, `status`, and `tags`.
   Notes with `status: Draft` are validated but omitted from public pages, RSS, sitemap, and static routes.
4. Run `npm run check`.
5. Deploy with `vercel --prod`.

## Deployment

The project is designed for Vercel and requires no database or runtime secrets. Vercel supplies its production hostname to metadata, RSS, and sitemap generation during deployment.
