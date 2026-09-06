import type { NoteMeta } from "@/lib/notes";

type SearchableNote = Pick<NoteMeta, "title" | "description" | "kind" | "topics">;

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchesNoteQuery(note: SearchableNote, query: string) {
  const needle = normalizeSearchText(query);
  if (!needle) return true;

  const haystack = normalizeSearchText([
    note.title,
    note.description,
    note.kind,
    ...note.topics,
  ].join(" "));

  return haystack.includes(needle);
}
