import "server-only";

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import { toString } from "mdast-util-to-string";
import readingTime from "reading-time";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import type { Heading, Root } from "mdast";

const notesDirectory = path.join(process.cwd(), "notes");

export type NoteStatus = "Draft" | "Reviewed" | "Maintained" | "Archived";

export type NoteMeta = {
  slug: string;
  title: string;
  description: string;
  kind: string;
  published: string;
  updated: string;
  checked?: string;
  version?: string;
  status: NoteStatus;
  topics: string[];
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
  const parsed = typeof value === "string" ? new Date(`${value}T00:00:00Z`) : null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || !parsed || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new Error(`${slug}: ${field} must be a valid YYYY-MM-DD date`);
  }
  return value;
}

function parseMeta(slug: string, data: Record<string, unknown>, content: string): NoteMeta {
  const required = ["title", "description", "kind", "status"] as const;
  for (const field of required) {
    if (typeof data[field] !== "string" || !data[field].trim()) {
      throw new Error(`${slug}: missing or invalid ${field}`);
    }
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.kind as string)) {
    throw new Error(`${slug}: kind must be a kebab-case value`);
  }
  if (!Array.isArray(data.topics) || !data.topics.length || data.topics.some((topic) => typeof topic !== "string" || !topic.trim())) {
    throw new Error(`${slug}: topics must be a non-empty string array`);
  }
  if (!["Draft", "Reviewed", "Maintained", "Archived"].includes(data.status as string)) {
    throw new Error(`${slug}: status must be Draft, Reviewed, Maintained, or Archived`);
  }
  if (data.version !== undefined && (typeof data.version !== "string" || !data.version.trim())) {
    throw new Error(`${slug}: version must be a non-empty string when provided`);
  }
  if (data.order !== undefined && (typeof data.order !== "number" || !Number.isFinite(data.order))) {
    throw new Error(`${slug}: order must be a finite number when provided`);
  }

  const stats = readingTime(content);
  return {
    slug,
    title: data.title as string,
    description: data.description as string,
    kind: data.kind as string,
    published: assertDate(data.published, "published", slug),
    updated: assertDate(data.updated, "updated", slug),
    checked: data.checked === undefined ? undefined : assertDate(data.checked, "checked", slug),
    version: data.version as string | undefined,
    status: data.status as NoteStatus,
    topics: data.topics as string[],
    order: typeof data.order === "number" ? data.order : 999,
    minutes: Math.max(1, Math.ceil(stats.minutes)),
    words: stats.words,
  };
}

function getAllNoteSlugs() {
  if (!fs.existsSync(notesDirectory)) return [];
  return fs.readdirSync(notesDirectory)
    .filter((name) => name.endsWith(".md"))
    .map((name) => name.replace(/\.md$/, ""))
    .sort();
}

export function getNoteSlugs() {
  return getAllNoteSlugs().filter((slug) => {
    const raw = fs.readFileSync(path.join(notesDirectory, `${slug}.md`), "utf8");
    return matter(raw).data.status !== "Draft";
  });
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
    const title = toString(node).trim();
    if (!title) return;
    const id = slugger.slug(title);
    if (node.depth >= 2 && node.depth <= 3) items.push({ id, title, depth: node.depth });
  });
  return items;
}

export async function renderMarkdown(content: string) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize)
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
  if (parsed.data.status === "Draft") return null;
  const meta = parseMeta(slug, parsed.data, parsed.content);
  return {
    ...meta,
    content: parsed.content,
    html: await renderMarkdown(parsed.content),
    raw,
    toc: extractToc(parsed.content),
  };
}
