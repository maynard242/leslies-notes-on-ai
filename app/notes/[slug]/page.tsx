import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NoteToc } from "@/components/note-toc";
import { formatDate, formatKind } from "@/lib/format";
import { getNoteBySlug, getNoteSlugs } from "@/lib/notes";

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
        <div><span>{formatKind(note.kind)}</span><span>{note.status}</span>{note.version && <span>Version {note.version}</span>}<span>{note.minutes} min read</span></div>
      </div>
      <div className="note-intro">
        <p className="eyebrow">Published {formatDate(note.published, "long")} · {note.checked ? `checked ${formatDate(note.checked, "long")}` : `updated ${formatDate(note.updated, "long")}`}</p>
        <p>{note.description}</p>
        <div className="note-actions">
          <a href={`/notes/${note.slug}/raw`}>View raw Markdown</a>
        </div>
      </div>
      <NoteToc items={note.toc} />
      <article className="prose" dangerouslySetInnerHTML={{ __html: note.html }} />
    </div>
  );
}
