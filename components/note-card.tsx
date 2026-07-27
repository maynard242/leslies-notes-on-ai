import Link from "next/link";
import type { NoteMeta } from "@/lib/notes";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export function NoteCard({ note }: { note: NoteMeta }) {
  return (
    <article className="note-card">
      <div className="note-card-topline">
        <span className="status-dot" aria-hidden="true" />
        <span>{note.status}</span>
        <span>Version {note.version}</span>
      </div>
      <h3><Link href={`/notes/${note.slug}`}>{note.title}</Link></h3>
      <p>{note.description}</p>
      <ul className="tag-list" aria-label="Topics">
        {note.tags.map((tag) => <li key={tag}>{tag}</li>)}
      </ul>
      <div className="note-card-footer">
        <span>{note.minutes} min read</span>
        <span>Checked {formatDate(note.checked)}</span>
        <Link href={`/notes/${note.slug}`} aria-label={`Read ${note.title}`}>Read note <span aria-hidden="true">→</span></Link>
      </div>
    </article>
  );
}
