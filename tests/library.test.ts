import { describe, expect, it } from "vitest";
import { formatNoteDates } from "@/lib/format";
import { getSectionDisplayState, sectionEmptyMessage } from "@/lib/library";
import type { NoteMeta } from "@/lib/notes";
import { getSectionLabel } from "@/lib/sections";

const notes = [
  {
    slug: "governance-note",
    title: "Governance note",
    description: "A governance reference.",
    kind: "reference",
    section: "Governance",
    published: "2026-07-28",
    updated: "2026-07-28",
    checked: "2026-07-26",
    status: "Reviewed",
    topics: ["governance"],
    words: 100,
    minutes: 1,
    order: 1,
  },
] satisfies NoteMeta[];

describe("library reader cues", () => {
  it("presents Governance as Strategy & Governance without changing the canonical section", () => {
    expect(getSectionLabel("Governance")).toBe("Strategy & Governance");
    expect(getSectionLabel("Training")).toBe("Training");
  });

  it("presents Economics as Economics & Social without changing the canonical section", () => {
    expect(getSectionLabel("Economics")).toBe("Economics & Social");
  });

  it("keeps updated and source-verification dates distinct", () => {
    expect(formatNoteDates(notes[0])).toBe("Updated Jul 28, 2026 · Sources checked Jul 26, 2026");
    expect(formatNoteDates(notes[0], "long", true)).toBe("Published July 28, 2026 · Updated July 28, 2026 · Sources checked July 26, 2026");
  });

  it("distinguishes an empty section from a populated section with no query matches", () => {
    expect(getSectionDisplayState(notes, [], "Data", "evaluation")).toBe("empty");
    expect(getSectionDisplayState(notes, [], "Governance", "evaluation")).toBe("no-query-matches");
    expect(sectionEmptyMessage("no-query-matches", "evaluation")).toBe("No notes in this section match “evaluation”.");
  });
});
