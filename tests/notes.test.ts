import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { GET as getFeed } from "@/app/feed.xml/route";
import { extractToc, getNoteBySlug, listNotes, renderMarkdown } from "@/lib/notes";
import { matchesNoteQuery } from "@/lib/search";

describe("note content pipeline", () => {
  it("discovers and validates multiple reference notes", () => {
    const notes = listNotes();
    expect(notes.length).toBeGreaterThanOrEqual(2);
    expect(notes).toContainEqual(expect.objectContaining({
      slug: "ai-governance-for-engineers",
      title: "AI Governance for Engineers",
      kind: "reference",
      status: "Reviewed",
    }));
    expect(notes).toContainEqual(expect.objectContaining({
      slug: "harnesses",
      title: "Harnesses",
      kind: "reference",
      status: "Reviewed",
    }));
    expect(notes.find((note) => note.slug === "ai-governance-for-engineers")?.words).toBeGreaterThan(10_000);
  });

  it("orders RSS by publication date rather than manual library order", async () => {
    const slug = "temporary-newest-feed-note-test";
    const file = path.join(process.cwd(), "notes", `${slug}.md`);
    fs.writeFileSync(file, `---
title: "Newest feed note"
description: "Regression fixture"
kind: "reference"
published: "2027-01-01"
updated: "2027-01-01"
status: "Reviewed"
topics: [test]
order: 999
---

# Newest feed note
`);

    try {
      const xml = await getFeed().text();
      expect(xml.indexOf(`/notes/${slug}`)).toBeGreaterThan(-1);
      expect(xml.indexOf(`/notes/${slug}`)).toBeLessThan(xml.indexOf("/notes/ai-governance-for-engineers"));
    } finally {
      fs.rmSync(file, { force: true });
    }
  });

  it("extracts stable second- and third-level headings", () => {
    const toc = extractToc(`# First idea

## First idea

### Detail

## First idea
`);
    expect(toc).toEqual([
      { id: "first-idea-1", title: "First idea", depth: 2 },
      { id: "detail", title: "Detail", depth: 3 },
      { id: "first-idea-2", title: "First idea", depth: 2 },
    ]);
  });

  it("renders GFM and does not execute raw HTML", async () => {
    const html = await renderMarkdown(`## Check

| A | B |
|---|---|
| 1 | 2 |

<script>alert(1)</script>

[unsafe](javascript:alert(2))`);
    expect(html).toContain('<h2 id="check">');
    expect(html).toContain("<table>");
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("javascript:");
  });

  it("returns raw Markdown and generated HTML for a note", async () => {
    const note = await getNoteBySlug("ai-governance-for-engineers");
    expect(note?.raw).toContain('title: "AI Governance for Engineers"');
    expect(note?.html).toContain("AI Governance for Engineers");
    expect(note?.toc.length).toBeGreaterThan(20);
  });

  it("keeps draft notes out of public discovery and direct reads", async () => {
    const slug = "temporary-draft-test";
    const file = path.join(process.cwd(), "notes", `${slug}.md`);
    fs.writeFileSync(file, `---
title: "Temporary draft"
description: "Regression fixture"
kind: "reference"
published: "2026-07-27"
updated: "2026-07-27"
status: "Draft"
topics: [test]
---

# Temporary draft
`);
    try {
      expect(listNotes().some((note) => note.slug === slug)).toBe(false);
      await expect(getNoteBySlug(slug)).resolves.toBeNull();
    } finally {
      fs.rmSync(file, { force: true });
    }
  });

  it("supports a general note without optional checked or version fields", async () => {
    const slug = "temporary-general-note-test";
    const file = path.join(process.cwd(), "notes", `${slug}.md`);
    fs.writeFileSync(file, `---
title: "General note"
description: "Regression fixture"
kind: "checklist"
published: "2026-07-27"
updated: "2026-07-27"
status: "Reviewed"
topics: [test]
---

# General note
`);
    try {
      const note = listNotes().find((item) => item.slug === slug);
      expect(note).toMatchObject({ kind: "checklist", topics: ["test"] });
      expect(note?.checked).toBeUndefined();
      expect(note?.version).toBeUndefined();
      await expect(getNoteBySlug(slug)).resolves.toMatchObject({ slug, kind: "checklist" });
    } finally {
      fs.rmSync(file, { force: true });
    }
  });

  it("matches human-readable searches for kebab-case note kinds", () => {
    const note = listNotes()[0];
    expect(matchesNoteQuery({ ...note, kind: "case-study" }, "case study")).toBe(true);
  });

  it("validates draft field types before build", () => {
    const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "notes-validator-"));
    const notesDirectory = path.join(temporaryDirectory, "notes");
    fs.mkdirSync(notesDirectory);
    fs.writeFileSync(path.join(notesDirectory, "bad-draft.md"), `---
title: []
description: "Regression fixture"
kind: "reference"
published: "2026-07-27"
updated: "2026-07-27"
status: "Draft"
topics: [test]
---

# Bad draft
`);

    try {
      const result = spawnSync(process.execPath, [path.join(process.cwd(), "scripts", "validate-content.mjs")], {
        cwd: temporaryDirectory,
        encoding: "utf8",
      });
      expect(result.status).not.toBe(0);
      expect(`${result.stdout}${result.stderr}`).toContain("title must be a non-empty string");
    } finally {
      fs.rmSync(temporaryDirectory, { recursive: true, force: true });
    }
  });

  it("rejects impossible calendar dates", () => {
    const slug = "temporary-invalid-date-test";
    const file = path.join(process.cwd(), "notes", `${slug}.md`);
    fs.writeFileSync(file, `---
title: "Invalid date"
description: "Regression fixture"
kind: "reference"
published: "2026-02-30"
updated: "2026-07-27"
status: "Reviewed"
topics: [test]
---

# Invalid date
`);
    try {
      expect(() => listNotes()).toThrow("published must be a valid YYYY-MM-DD date");
    } finally {
      fs.rmSync(file, { force: true });
    }
  });
});
