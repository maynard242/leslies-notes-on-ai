# Review Process

A reference library is only useful if its claims are still true. This document defines how notes get checked and updated after they are first published.

## Cadence

A scheduled check runs monthly and messages Leslie on Telegram when any note is stale. It only reports; it never edits a note. Reviews otherwise happen on demand — run the check yourself, or act immediately when you know something in a note has changed (a new regulation, a retracted paper, a superseding benchmark).

## Running the check

```bash
npm run review:stale
```

Options:

```bash
npm run review:stale -- --threshold=60   # flag notes not checked in 60 days instead of 90
npm run review:stale -- --json           # machine-readable output
```

## What counts as stale

A `Reviewed` or `Maintained` note is stale when more than the threshold (default 90 days) has passed since its `checked` date, or its `updated` date if `checked` is not set.

- **Archived** notes are exempt. An old timestamp on a note kept deliberately as a historical record is not a defect.
- **Draft** notes are not evaluated. They are not published yet.

## Triage

For each stale note, pick one:

1. **Still accurate.** No content change needed. Bump `checked` to today. Add a one-line change-history entry noting the re-check.
2. **Needs revision.** Re-verify the source-backed and time-sensitive claims the note flagged as perishable. Edit the body, bump `updated` and `checked`, bump `version` (see below), and add a change-history entry describing what changed and why.
3. **Superseded.** Set `status: Archived`. If a successor note exists, link it near the top of the document. Keep the original content intact as the historical record — do not delete it.

## Version convention

- **Patch-style bump** (e.g. `1.0` → `1.1`): corrections, citation refresh, rewording that does not change a conclusion.
- **Major bump** (e.g. `1.0` → `2.0`): a substantive revision — new evidence changes a conclusion, a section is rewritten, or scope changes materially.

Only bump `version` on notes that already carry one. Do not add `version` to a note that was deliberately published without it.

## Change history

Every substantive edit gets a line in the note's `## Change history` section:

```markdown
- **YYYY-MM-DD — v1.1:** What changed and why.
```

A re-check with no content change still gets a line, so the history shows the note was actually looked at, not just aged past a threshold.

## Mechanics

1. `npm run review:stale`
2. For each flagged note, re-check its cited primary sources for the claims marked time-sensitive or perishable.
3. Edit the note if warranted.
4. Update `updated`, `checked`, and `version` (as warranted) in the front matter.
5. Add the change-history entry.
6. `npm run check`
7. Commit and push:
   ```bash
   git add notes/<section>/<slug>.md
   git commit -m "docs: review <slug>"
   git push origin main
   ```

## What this deliberately does not do

No automatic editing, no AI-generated rewrites applied without Leslie’s review, no CMS workflow. The script only tells you what to look at. AI may assist research, drafting, and updates, but Leslie still reads the sources and decides what the note should say—that is the point of a maintained reference library.
