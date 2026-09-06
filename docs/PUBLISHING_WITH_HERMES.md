# Publishing with Hermes

This repository keeps its existing Markdown-to-GitHub publishing path: edit a note in `notes/`, validate it locally, make a reviewed Git commit, and push `main`. The connected Vercel project builds a successful `main` push for production. There is no CMS, browser upload endpoint, or direct Vercel upload in this workflow.

The commands below make that path safer for a Hermes session. They do not configure Hermes, inspect credentials, or bypass command approval. They are local helpers around the existing Git workflow.

## Safe sequence

1. Ask Hermes to inspect the intended paths and run the non-mutating gate:

```bash
npm run publish:preflight
npm run publish:review
```

`publish:preflight` runs the canonical `npm run check`, whitespace validation, and Git status. `publish:review` prints Git status plus unstaged, untracked, staged, and current-`HEAD` diffs. Neither stages, commits, pushes, or deploys.

2. Review the diff yourself. When the exact scope is correct, create a scoped commit by naming every path. The helper refuses to stage `.` or paths outside the repository, and refuses to proceed if anything is already staged:

```bash
npm run publish:commit -- --confirm-commit --message "content: publish my note" -- notes/Governance/my-note.md README.md
```

3. Review the resulting commit with `npm run publish:review`. Only then push with a separate explicit confirmation:

```bash
npm run publish:push -- --confirm-push
```

The push helper only accepts the `main` branch, requires a clean worktree, fetches `origin/main`, pushes, and compares local `HEAD` with `origin/main` after the push. It reports the commit it verified. Vercel deployment is asynchronous; this helper does not claim that production is ready. GitHub Actions runs the same `npm run check` gate for pull requests and pushes to `main`; requiring that check before merges remains a GitHub branch-protection setting, not something this helper changes.

## Hermes prompt examples

Use an instruction that states the desired boundary, for example:

- “Run `npm run publish:preflight` and `npm run publish:review`; do not stage, commit, push, or deploy.”
- “Review the diff for `notes/Governance/my-note.md` and `README.md`; if it is correct, run the scoped commit command I supplied. Do not push.”
- “Run `npm run publish:push -- --confirm-push`, then report the verified Git commit. Do not perform any Vercel CLI action.”

Hermes command approval remains in force. If Git authentication is unavailable, the push command fails without printing credentials; authenticate using the normal local Git/GitHub setup, then rerun the explicit push step.

## Existing note workflow

Keep drafts as `status: Draft` while editing. Use `docs/NOTE_TEMPLATE.md`, retain the stable filename/slug, run `npm run check`, and only publish after Leslie has reviewed the content and its source claims. For an already-published note, follow `docs/REVIEW_PROCESS.md` before changing its lifecycle state.
