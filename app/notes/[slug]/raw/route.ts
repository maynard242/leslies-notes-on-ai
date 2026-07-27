import { getNoteBySlug, getNoteSlugs } from "@/lib/notes";

export const dynamicParams = false;

export function generateStaticParams() {
  return getNoteSlugs().map((slug) => ({ slug }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = await getNoteBySlug(slug);
  if (!note) return new Response("Not found", { status: 404 });
  return new Response(note.raw, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `inline; filename="${slug}.md"`,
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
