"use client";

import { useMemo, useState } from "react";
import { NoteCard } from "@/components/note-card";
import type { NoteMeta } from "@/lib/notes";
import { matchesNoteQuery } from "@/lib/search";

export function NoteLibrary({ notes }: { notes: NoteMeta[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    return notes.filter((note) => matchesNoteQuery(note, query));
  }, [notes, query]);

  return (
    <div>
      <label className="search-field">
        <span className="sr-only">Search notes</span>
        <span aria-hidden="true">⌕</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles, kinds, or topics" />
      </label>
      <div className="library-count" aria-live="polite">{filtered.length} {filtered.length === 1 ? "note" : "notes"}</div>
      <div className="note-grid">
        {filtered.map((note) => <NoteCard key={note.slug} note={note} />)}
      </div>
      {!filtered.length && <p className="empty-state">No notes match that search.</p>}
    </div>
  );
}
