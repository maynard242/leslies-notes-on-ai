import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NoteToc } from "@/components/note-toc";
import { formatKind, formatNoteDates } from "@/lib/format";
import { getNoteBySlug, getNoteSlugs } from "@/lib/notes";
import { attribution } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return getNoteSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const note = await getNoteBySlug(slug);
  if (!note) return {};
  return {
    title: note.title,
    description: note.description,
    alternates: { canonical: `/notes/${note.slug}` },
    openGraph: { title: note.title, description: note.description, type: "article", publishedTime: note.published, modifiedTime: note.updated },
  };
}

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = await getNoteBySlug(slug);
  if (!note) notFound();

  return (
    <div className="note-shell shell">
      <div className="note-utility">
        <Link href="/">← All notes</Link>
        <div><span>{note.section}</span><span>{formatKind(note.kind)}</span><span>{note.status}</span>{note.version && <span>Version {note.version}</span>}<span>{note.minutes} min read</span></div>
      </div>
      <div className="note-intro">
        <p className="eyebrow">{formatNoteDates(note, "long", true)}</p>
        <p>{note.description}</p>
        <p className="note-attribution attribution">{attribution}</p>
        <div className="note-actions">
          <a href={`/notes/${note.slug}/raw`}>View raw Markdown</a>
        </div>
      </div>
      <NoteToc items={note.toc} />
      <article className="prose" dangerouslySetInnerHTML={{ __html: note.html }} />
    </div>
  );
}
