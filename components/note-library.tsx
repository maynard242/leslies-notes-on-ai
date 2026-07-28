"use client";

import { useMemo, useState } from "react";
import { NoteCard } from "@/components/note-card";
import { NOTE_SECTIONS } from "@/lib/sections";
import type { NoteMeta } from "@/lib/notes";
import { matchesNoteQuery } from "@/lib/search";

export function NoteLibrary({ notes }: { notes: NoteMeta[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => notes.filter((note) => matchesNoteQuery(note, query)), [notes, query]);

  return (
    <div>
      <label className="search-field">
        <span className="sr-only">Search notes</span>
        <span aria-hidden="true">⌕</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles, kinds, or topics" />
      </label>
      <div className="library-count" aria-live="polite">{filtered.length} {filtered.length === 1 ? "note" : "notes"}</div>
      <div className="note-sections">
        {NOTE_SECTIONS.map((section) => {
          const sectionNotes = filtered.filter((note) => note.section === section);
          return (
            <section className="note-section" key={section} aria-labelledby={`section-${section}`}>
              <div className="note-section-heading">
                <h3 id={`section-${section}`}>{section}</h3>
                <p>Written and updated by Leslie Teo with AI assistance.</p>
              </div>
              {sectionNotes.length ? (
                <div className="note-grid">{sectionNotes.map((note) => <NoteCard key={note.slug} note={note} />)}</div>
              ) : (
                <p className="section-empty">No published notes yet.</p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
