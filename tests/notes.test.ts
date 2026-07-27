import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { extractToc, getNoteBySlug, listNotes, renderMarkdown } from "@/lib/notes";

describe("note content pipeline", () => {
  it("discovers and validates the first note", () => {
    const notes = listNotes();
    expect(notes.length).toBeGreaterThan(0);
    expect(notes).toContainEqual(expect.objectContaining({
      slug: "ai-governance-for-engineers",
      title: "AI Governance for Engineers",
      status: "Reviewed",
    }));
    expect(notes.find((note) => note.slug === "ai-governance-for-engineers")?.words).toBeGreaterThan(10_000);
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
published: "2026-07-27"
updated: "2026-07-27"
checked: "2026-07-27"
version: "0.1"
status: "Draft"
tags: [test]
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

  it("rejects impossible calendar dates", () => {
    const slug = "temporary-invalid-date-test";
    const file = path.join(process.cwd(), "notes", `${slug}.md`);
    fs.writeFileSync(file, `---
title: "Invalid date"
description: "Regression fixture"
published: "2026-02-30"
updated: "2026-07-27"
checked: "2026-07-27"
version: "0.1"
status: "Reviewed"
tags: [test]
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
