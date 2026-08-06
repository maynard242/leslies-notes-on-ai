import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { GET as getFeed } from "@/app/feed.xml/route";
import { extractToc, getNoteBySlug, listNotes, NOTE_SECTIONS, renderMarkdown } from "@/lib/notes";
import { matchesNoteQuery } from "@/lib/search";

describe("note content pipeline", () => {
  it("discovers and validates multiple reference notes", () => {
    const notes = listNotes();
    expect(notes.length).toBeGreaterThanOrEqual(2);
    expect(notes).toContainEqual(expect.objectContaining({
      slug: "ai-governance-for-engineers",
      title: "AI Governance for Engineers",
      kind: "reference",
      section: "Governance",
      status: "Reviewed",
    }));
    expect(notes).toContainEqual(expect.objectContaining({
      slug: "harnesses",
      title: "Harnesses",
      kind: "reference",
      section: "Agents",
      status: "Reviewed",
    }));
    expect(notes).toContainEqual(expect.objectContaining({
      slug: "from-prompts-to-persistent-workflows",
      title: "From Prompts to Persistent Workflows",
      kind: "guide",
      section: "Misc",
      status: "Reviewed",
    }));
    expect(notes.find((note) => note.slug === "ai-governance-for-engineers")?.words).toBeGreaterThan(10_000);
  });

  it("uses the established section taxonomy and keeps public slugs stable after files move", () => {
    expect(NOTE_SECTIONS).toEqual(["Data", "Training", "Post-Training", "Agents", "Governance", "Misc"]);
    expect(listNotes().map((note) => note.slug)).toEqual([
      "multilingual-tokenizers",
      "continued-pretraining-mid-training",
      "sea-helm-multilingual-cultural-evaluation",
      "training-sea-lion-sea-pile",
      "post-training-brief",
      "harnesses",
      "ai-governance-board-note",
      "ai-governance-for-engineers",
      "when-the-model-has-skin-in-the-game",
      "from-prompts-to-persistent-workflows",
    ]);
  });

  it("publishes the tutorial distillation as a vendor-neutral workflow guide", async () => {
    const note = await getNoteBySlug("from-prompts-to-persistent-workflows");

    expect(note?.raw).toContain("The durable skill is not clever prompting.");
    expect(note?.raw).toContain("Product-specific descriptions, pricing, and vendor claims were intentionally not carried into this vendor-neutral note.");
    expect(note?.html).toContain("The capability map");
  });

  it("keeps ten board prompts under each of the five governance questions", () => {
    const file = path.join(process.cwd(), "notes", "Governance", "ai-governance-board-note.md");
    const questionSections = fs.readFileSync(file, "utf8").split(/^## [1-5]\. /m).slice(1);

    expect(questionSections).toHaveLength(5);
    for (const section of questionSections) {
      expect(section.match(/^\d+\. /gm)).toHaveLength(10);
    }
  });

  it("renders the governance illustrations from tracked static assets", async () => {
    const illustrations = [
      ["ai-governance-for-engineers", "ai-governance-control-loop-framework.webp"],
      ["ai-governance-board-note", "board-ai-governance-framework.webp"],
    ] as const;

    for (const [slug, filename] of illustrations) {
      expect(fs.existsSync(path.join(process.cwd(), "public", "illustrations", filename))).toBe(true);
      const note = await getNoteBySlug(slug);
      expect(note?.html).toContain(`src="/illustrations/${filename}"`);
    }
  });

  it("orders RSS by publication date rather than manual library order", async () => {
    const slug = "temporary-newest-feed-note-test";
    const file = path.join(process.cwd(), "notes", "Misc", `${slug}.md`);
    fs.writeFileSync(file, `---
title: "Newest feed note"
description: "Regression fixture"
kind: "reference"
section: "Misc"
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

  it("renders inline and block math as KaTeX and still sanitizes unsafe content", async () => {
    const html = await renderMarkdown(`Inline $x^2 + y^2 = z^2$ math.

$$
\\sqrt{a^2 + b^2} = c
$$

<script>alert(1)</script>

[unsafe](javascript:alert(2))`);
    expect(html).toContain('<span class="katex">');
    expect(html).toContain('<span class="katex-display">');
    expect(html).toContain("<math");
    expect(html).toContain('<annotation encoding="application/x-tex">');
    expect(html).not.toContain("$$");
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("javascript:");
  });

  it("renders the harness reliability model's math instead of leaving it as literal LaTeX", async () => {
    const note = await getNoteBySlug("harnesses");
    expect(note?.html).toContain('<span class="katex-display">');
    expect(note?.html).not.toContain("<p>$$");
  });

  it("returns raw Markdown and generated HTML for a note", async () => {
    const note = await getNoteBySlug("ai-governance-for-engineers");
    expect(note?.raw).toContain('title: "AI Governance for Engineers"');
    expect(note?.html).toContain("AI Governance for Engineers");
    expect(note?.toc.length).toBeGreaterThan(20);
  });

  it("keeps draft notes out of public discovery and direct reads", async () => {
    const slug = `temporary-draft-test-${randomUUID()}`;
    const file = path.join(process.cwd(), "notes", "Misc", `${slug}.md`);
    fs.writeFileSync(file, `---
title: "Temporary draft"
description: "Regression fixture"
kind: "reference"
section: "Misc"
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
    const slug = `temporary-general-note-test-${randomUUID()}`;
    const file = path.join(process.cwd(), "notes", "Misc", `${slug}.md`);
    fs.writeFileSync(file, `---
title: "General note"
description: "Regression fixture"
kind: "checklist"
section: "Misc"
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
section: "Misc"
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
    const slug = `temporary-invalid-date-test-${randomUUID()}`;
    const file = path.join(process.cwd(), "notes", "Misc", `${slug}.md`);
    fs.writeFileSync(file, `---
title: "Invalid date"
description: "Regression fixture"
kind: "reference"
section: "Misc"
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

  it("rejects duplicate public slugs across sections", () => {
    const slug = `temporary-duplicate-slug-test-${randomUUID()}`;
    const files = ["Data", "Misc"].map((section) => path.join(process.cwd(), "notes", section, `${slug}.md`));
    for (const [index, file] of files.entries()) {
      fs.writeFileSync(file, `---
title: "Duplicate ${index}"
description: "Regression fixture"
kind: "reference"
section: "${index === 0 ? "Data" : "Misc"}"
published: "2026-07-27"
updated: "2026-07-27"
status: "Draft"
topics: [test]
---

# Duplicate ${index}
`);
    }
    try {
      expect(() => listNotes()).toThrow(`${slug}: duplicate public slug`);
    } finally {
      for (const file of files) fs.rmSync(file, { force: true });
    }
  });

  it("requires a note's section to match its parent directory", () => {
    const slug = `temporary-mismatched-section-test-${randomUUID()}`;
    const file = path.join(process.cwd(), "notes", "Misc", `${slug}.md`);
    fs.writeFileSync(file, `---
title: "Mismatched section"
description: "Regression fixture"
kind: "reference"
section: "Governance"
published: "2026-07-27"
updated: "2026-07-27"
status: "Reviewed"
topics: [test]
---

# Mismatched section
`);
    try {
      expect(() => listNotes()).toThrow("section Governance must match parent directory Misc");
    } finally {
      fs.rmSync(file, { force: true });
    }
  });

  it("rejects notes with a section outside the reference taxonomy", () => {
    const slug = `temporary-invalid-section-test-${randomUUID()}`;
    const file = path.join(process.cwd(), "notes", "Misc", `${slug}.md`);
    fs.writeFileSync(file, `---
title: "Invalid section"
description: "Regression fixture"
kind: "reference"
section: "Unsorted"
published: "2026-07-27"
updated: "2026-07-27"
status: "Reviewed"
topics: [test]
---

# Invalid section
`);
    try {
      expect(() => listNotes()).toThrow("section must be Data, Training, Post-Training, Agents, Governance, or Misc");
    } finally {
      fs.rmSync(file, { force: true });
    }
  });
});
