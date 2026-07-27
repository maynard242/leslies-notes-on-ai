import type { MetadataRoute } from "next";
import { listNotes } from "@/lib/notes";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  return [
    { url: base.toString(), lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    ...listNotes().map((note) => ({ url: new URL(`/notes/${note.slug}`, base).toString(), lastModified: new Date(`${note.updated}T00:00:00Z`), changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
