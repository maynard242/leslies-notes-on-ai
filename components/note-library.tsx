"use client";

import { useMemo, useState } from "react";
import { NoteCard } from "@/components/note-card";
import { filterAndSortNotes, getLibraryKinds, getSectionLabel, type LibrarySort } from "@/lib/library";
import { NOTE_SECTIONS } from "@/lib/sections";
import type { NoteMeta } from "@/lib/notes";

export function NoteLibrary({ notes }: { notes: NoteMeta[] }) {
  const [query, setQuery] = useState("");
  const [section, setSection] = useState<NoteMeta["section"] | "all">("all");
  const [kind, setKind] = useState("all");
  const [sort, setSort] = useState<LibrarySort>("library");
  const kinds = useMemo(() => getLibraryKinds(notes), [notes]);
  const filtered = useMemo(() => filterAndSortNotes(notes, { query, section, kind, sort }), [notes, query, section, kind, sort]);
  const isGrouped = !query.trim() && section === "all" && kind === "all" && sort === "library";
  const active = !isGrouped;
  const clear = () => { setQuery(""); setSection("all"); setKind("all"); setSort("library"); };

  return (
    <div className="library-browser">
      <label className="search-field" htmlFor="note-search">
        <span aria-hidden="true">⌕</span>
        <span className="sr-only">Search the library</span>
        <input id="note-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles, descriptions, kinds, or topics" />
      </label>
      <div className="library-controls">
        <fieldset><legend>Section</legend><div className="filter-row"><button type="button" aria-pressed={section === "all"} onClick={() => setSection("all")}>All</button>{NOTE_SECTIONS.map((item) => <button type="button" aria-pressed={section === item} key={item} onClick={() => setSection(item)}>{getSectionLabel(item)}</button>)}</div></fieldset>
        <fieldset><legend>Kind</legend><div className="filter-row"><button type="button" aria-pressed={kind === "all"} onClick={() => setKind("all")}>All</button>{kinds.map((item) => <button type="button" aria-pressed={kind === item} key={item} onClick={() => setKind(item)}>{item}</button>)}</div></fieldset>
        <label className="sort-control">Sort <select value={sort} onChange={(event) => setSort(event.target.value as LibrarySort)}><option value="library">Library order</option><option value="updated">Most recently updated</option><option value="title">Title</option></select></label>
        {active && <button className="clear-filters" type="button" onClick={clear}>Clear all</button>}
      </div>
      <p className="library-count" aria-live="polite">{filtered.length} {filtered.length === 1 ? "note" : "notes"}{active ? " matching your library view" : " in the library"}</p>
      {isGrouped ? <div className="note-sections">{NOTE_SECTIONS.map((item) => { const grouped = filtered.filter((note) => note.section === item); return grouped.length ? <section className="note-section" key={item} aria-labelledby={`section-${item}`}><h3 id={`section-${item}`}>{getSectionLabel(item)}</h3><div className="note-list">{grouped.map((note) => <NoteCard key={note.slug} note={note} />)}</div></section> : null; })}</div> : <div className="note-list note-list-results">{filtered.map((note) => <NoteCard key={note.slug} note={note} />)}{!filtered.length && <p className="section-empty">No notes match this library view. Try clearing a filter or searching another term.</p>}</div>}
    </div>
  );
}
