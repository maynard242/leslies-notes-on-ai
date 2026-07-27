import Link from "next/link";
import { formatDate, formatKind } from "@/lib/format";
import type { NoteMeta } from "@/lib/notes";

export function NoteCard({ note }: { note: NoteMeta }) {
  return (
    <article className="note-card">
      <div className="note-card-topline">
        <span className="status-dot" aria-hidden="true" />
        <span>{formatKind(note.kind)}</span>
        <span>{note.status}</span>
        {note.version && <span>Version {note.version}</span>}
      </div>
      <h3><Link href={`/notes/${note.slug}`}>{note.title}</Link></h3>
      <p>{note.description}</p>
      <ul className="tag-list" aria-label="Topics">
        {note.topics.map((topic) => <li key={topic}>{topic}</li>)}
      </ul>
      <div className="note-card-footer">
        <span>{note.minutes} min read</span>
        <span>{note.checked ? `Checked ${formatDate(note.checked)}` : `Updated ${formatDate(note.updated)}`}</span>
        <Link href={`/notes/${note.slug}`} aria-label={`Read ${note.title}`}>Read note <span aria-hidden="true">→</span></Link>
      </div>
    </article>
  );
}
