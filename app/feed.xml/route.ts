import { listNotes } from "@/lib/notes";
import { getSiteUrl, site } from "@/lib/site";

export const dynamic = "force-static";

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character] ?? character);
}

export function GET() {
  const base = getSiteUrl();
  const notes = listNotes();
  const items = notes.map((note) => `
    <item>
      <title>${escapeXml(note.title)}</title>
      <link>${new URL(`/notes/${note.slug}`, base)}</link>
      <guid>${new URL(`/notes/${note.slug}`, base)}</guid>
      <description>${escapeXml(note.description)}</description>
      <pubDate>${new Date(`${note.published}T00:00:00Z`).toUTCString()}</pubDate>
    </item>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0"><channel>
    <title>${escapeXml(site.name)}</title>
    <link>${base}</link>
    <description>${escapeXml(site.description)}</description>
    <language>en</language>${items}
  </channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
