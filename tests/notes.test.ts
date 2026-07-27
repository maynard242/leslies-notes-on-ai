import { describe, expect, it } from "vitest";
import { extractToc, getNoteBySlug, listNotes, renderMarkdown } from "@/lib/notes";

describe("note content pipeline", () => {
  it("discovers and validates the first note", () => {
    const notes = listNotes();
    expect(notes).toHaveLength(1);
    expect(notes[0]).toMatchObject({
      slug: "ai-governance-for-engineers",
      title: "AI Governance for Engineers",
      status: "Reviewed",
    });
    expect(notes[0].words).toBeGreaterThan(10_000);
  });

  it("extracts stable second- and third-level headings", () => {
    const toc = extractToc(`# Title

## First idea

### Detail

## First idea
`);
    expect(toc).toEqual([
      { id: "first-idea", title: "First idea", depth: 2 },
      { id: "detail", title: "Detail", depth: 3 },
      { id: "first-idea-1", title: "First idea", depth: 2 },
    ]);
  });

  it("renders GFM and does not execute raw HTML", async () => {
    const html = await renderMarkdown(`## Check

| A | B |
|---|---|
| 1 | 2 |

<script>alert(1)</script>`);
    expect(html).toContain('<h2 id="check">');
    expect(html).toContain("<table>");
    expect(html).not.toContain("<script>");
  });

  it("returns raw Markdown and generated HTML for a note", async () => {
    const note = await getNoteBySlug("ai-governance-for-engineers");
    expect(note?.raw).toContain('title: "AI Governance for Engineers"');
    expect(note?.html).toContain("AI Governance for Engineers");
    expect(note?.toc.length).toBeGreaterThan(20);
  });
});
