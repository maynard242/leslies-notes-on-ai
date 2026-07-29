"use client";

import { useMemo, useState } from "react";
import { NoteCard } from "@/components/note-card";
import { NOTE_SECTIONS } from "@/lib/sections";
import type { NoteMeta } from "@/lib/notes";
import { getSectionDisplayState, sectionEmptyMessage } from "@/lib/library";
import { matchesNoteQuery } from "@/lib/search";

export function NoteLibrary({ notes }: { notes: NoteMeta[] }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim();
  const filtered = useMemo(() => notes.filter((note) => matchesNoteQuery(note, query)), [notes, query]);
  const hasNoMatches = Boolean(normalizedQuery && !filtered.length);

  return (
    <div>
      <label className="search-field">
        <span className="sr-only">Search notes</span>
        <span aria-hidden="true">⌕</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles, kinds, or topics" />
      </label>
      <div className="library-count" aria-live="polite">{filtered.length} {filtered.length === 1 ? "note" : "notes"}</div>
      {hasNoMatches ? (
        <div className="section-index" aria-label="Library section counts">
          {NOTE_SECTIONS.map((section) => (
            <span key={section}>{section} ({notes.filter((note) => note.section === section).length})</span>
          ))}
        </div>
      ) : (
        <nav className="section-index" aria-label="Library sections">
          {NOTE_SECTIONS.map((section) => (
            <a href={`#section-${section}`} key={section}>{section} ({notes.filter((note) => note.section === section).length})</a>
          ))}
        </nav>
      )}
      {hasNoMatches ? (
        <div className="search-results-empty" role="status">
          <p>No notes match “{normalizedQuery}”.</p>
          <button type="button" onClick={() => setQuery("")}>Clear search</button>
        </div>
      ) : (
        <div className="note-sections">
          {NOTE_SECTIONS.map((section) => {
            const sectionNotes = filtered.filter((note) => note.section === section);
            const state = getSectionDisplayState(notes, filtered, section, query);
            return (
              <section className="note-section" key={section} aria-labelledby={`section-${section}`}>
                <div className="note-section-heading">
                  <h3 id={`section-${section}`}>{section}</h3>
                </div>
                {state === "has-notes" ? (
                  <div className="note-grid">{sectionNotes.map((note) => <NoteCard key={note.slug} note={note} />)}</div>
                ) : (
                  <p className="section-empty">{sectionEmptyMessage(state, query)}</p>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
