import type { NoteMeta } from "@/lib/notes";
import { getSectionLabel, NOTE_SECTIONS } from "@/lib/sections";
import { matchesNoteQuery } from "@/lib/search";

export type LibrarySort = "library" | "updated" | "title";
export type LibraryFilters = {
  query: string;
  section: NoteMeta["section"] | "all";
  kind: string | "all";
  sort: LibrarySort;
};

export function filterAndSortNotes(notes: NoteMeta[], filters: LibraryFilters): NoteMeta[] {
  const filtered = notes.filter((note) => (
    matchesNoteQuery(note, filters.query)
    && (filters.section === "all" || note.section === filters.section)
    && (filters.kind === "all" || note.kind === filters.kind)
  ));

  return [...filtered].sort((left, right) => {
    if (filters.sort === "updated") return right.updated.localeCompare(left.updated) || left.title.localeCompare(right.title);
    if (filters.sort === "title") return left.title.localeCompare(right.title);
    return NOTE_SECTIONS.indexOf(left.section) - NOTE_SECTIONS.indexOf(right.section)
      || left.order - right.order
      || right.updated.localeCompare(left.updated)
      || left.title.localeCompare(right.title);
  });
}

export function getLibraryKinds(notes: NoteMeta[]) {
  return [...new Set(notes.map((note) => note.kind))].sort((left, right) => left.localeCompare(right));
}

export function getSectionDisplayState(allNotes: NoteMeta[], filteredNotes: NoteMeta[], section: NoteMeta["section"], query: string) {
  if (filteredNotes.some((note) => note.section === section)) return "has-notes";
  if (!allNotes.some((note) => note.section === section)) return "empty";
  return query.trim() ? "no-query-matches" : "has-notes";
}

export function sectionEmptyMessage(state: "empty" | "no-query-matches", query: string) {
  if (state === "empty") return "No published notes yet.";
  return `No notes in this section match “${query.trim()}”.`;
}

export { getSectionLabel };
