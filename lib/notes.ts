import "server-only";

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import { toString } from "mdast-util-to-string";
import readingTime from "reading-time";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import type { Heading, Root } from "mdast";

const notesDirectory = path.join(process.cwd(), "notes");

export type NoteStatus = "Draft" | "Reviewed" | "Maintained";

export type NoteMeta = {
  slug: string;
  title: string;
  description: string;
  published: string;
  updated: string;
  checked: string;
  version: string;
  status: NoteStatus;
  tags: string[];
  featured: boolean;
  order: number;
  minutes: number;
  words: number;
};

export type TocItem = {
  id: string;
  title: string;
  depth: number;
};

export type Note = NoteMeta & {
  content: string;
  html: string;
  raw: string;
  toc: TocItem[];
};

function assertDate(value: unknown, field: string, slug: string): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) {
    throw new Error(`${slug}: ${field} must be a valid YYYY-MM-DD date`);
  }
  return value;
}

function parseMeta(slug: string, data: Record<string, unknown>, content: string): NoteMeta {
  const required = ["title", "description", "version", "status"] as const;
  for (const field of required) {
    if (typeof data[field] !== "string" || !data[field].trim()) {
      throw new Error(`${slug}: missing or invalid ${field}`);
    }
  }
  if (!Array.isArray(data.tags) || !data.tags.length || data.tags.some((tag) => typeof tag !== "string" || !tag.trim())) {
    throw new Error(`${slug}: tags must be a non-empty string array`);
  }
  if (!["Draft", "Reviewed", "Maintained"].includes(data.status as string)) {
    throw new Error(`${slug}: status must be Draft, Reviewed, or Maintained`);
  }

  const stats = readingTime(content);
  return {
    slug,
    title: data.title as string,
    description: data.description as string,
    published: assertDate(data.published, "published", slug),
    updated: assertDate(data.updated, "updated", slug),
    checked: assertDate(data.checked, "checked", slug),
    version: data.version as string,
    status: data.status as NoteStatus,
    tags: data.tags as string[],
    featured: data.featured === true,
    order: typeof data.order === "number" ? data.order : 999,
    minutes: Math.max(1, Math.ceil(stats.minutes)),
    words: stats.words,
  };
}

export function getNoteSlugs() {
  if (!fs.existsSync(notesDirectory)) return [];
  return fs.readdirSync(notesDirectory)
    .filter((name) => name.endsWith(".md"))
    .map((name) => name.replace(/\.md$/, ""))
    .sort();
}

export function listNotes(): NoteMeta[] {
  return getNoteSlugs()
    .map((slug) => {
      const raw = fs.readFileSync(path.join(notesDirectory, `${slug}.md`), "utf8");
      const parsed = matter(raw);
      return parseMeta(slug, parsed.data, parsed.content);
    })
    .sort((a, b) => a.order - b.order || b.updated.localeCompare(a.updated) || a.title.localeCompare(b.title));
}

export function extractToc(content: string): TocItem[] {
  const tree = unified().use(remarkParse).parse(content) as Root;
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  visit(tree, "heading", (node: Heading) => {
    if (node.depth < 2 || node.depth > 3) return;
    const title = toString(node).trim();
    if (title) items.push({ id: slugger.slug(title), title, depth: node.depth });
  });
  return items;
}

export async function renderMarkdown(content: string) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: "append",
      properties: { className: ["heading-anchor"], ariaLabel: "Link to this section" },
      content: { type: "text", value: "#" },
    })
    .use(rehypeStringify)
    .process(content);
  return String(result);
}

export async function getNoteBySlug(slug: string): Promise<Note | null> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  const file = path.join(notesDirectory, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const parsed = matter(raw);
  const meta = parseMeta(slug, parsed.data, parsed.content);
  return {
    ...meta,
    content: parsed.content,
    html: await renderMarkdown(parsed.content),
    raw,
    toc: extractToc(parsed.content),
  };
}
