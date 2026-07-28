import type { NoteMeta } from "@/lib/notes";

type SectionDisplayState = "has-notes" | "empty" | "no-query-matches";

export function getSectionDisplayState(
  allNotes: NoteMeta[],
  filteredNotes: NoteMeta[],
  section: NoteMeta["section"],
  query: string,
): SectionDisplayState {
  if (filteredNotes.some((note) => note.section === section)) return "has-notes";
  if (!allNotes.some((note) => note.section === section)) return "empty";
  return query.trim() ? "no-query-matches" : "has-notes";
}

export function sectionEmptyMessage(state: Exclude<SectionDisplayState, "has-notes">, query: string) {
  if (state === "empty") return "No published notes yet.";
  return `No notes in this section match “${query.trim()}”.`;
}
