import Link from "next/link";
import { formatKind, formatNoteDates } from "@/lib/format";
import { getSectionLabel } from "@/lib/sections";
import type { NoteMeta } from "@/lib/notes";

export function NoteCard({ note }: { note: NoteMeta }) {
  return (
    <article className="note-card">
      <div className="note-card-main">
        <p className="note-card-label">{getSectionLabel(note.section)} · {formatKind(note.kind)}</p>
        <h4><Link href={`/notes/${note.slug}`}>{note.title}</Link></h4>
        <p>{note.description}</p>
        <ul className="tag-list" aria-label="Topics">{note.topics.slice(0, 3).map((topic) => <li key={topic}>{topic}</li>)}</ul>
      </div>
      <div className="note-card-footer"><span>{note.minutes} min read · {formatNoteDates(note)}</span><Link href={`/notes/${note.slug}`}>Read <span aria-hidden="true">→</span></Link></div>
    </article>
  );
}
