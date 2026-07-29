import "server-only";

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import { toString } from "mdast-util-to-string";
import readingTime from "reading-time";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import type { Heading, Root } from "mdast";
import { NOTE_SECTIONS, type NoteSection } from "@/lib/sections";

export { NOTE_SECTIONS } from "@/lib/sections";

const notesDirectory = path.join(process.cwd(), "notes");

// rehype-katex's output (MathML plus positioned spans and glyph SVGs) needs tags and
// attributes the default GitHub-style sanitize schema doesn't know about.
const katexSchema = structuredClone(defaultSchema);
katexSchema.tagNames = [
  ...(katexSchema.tagNames ?? []),
  "math", "semantics", "mrow", "mi", "mo", "mn", "ms", "mtext", "mspace",
  "mpadded", "mphantom", "mfrac", "mroot", "msqrt", "msub", "msup", "msubsup",
  "mmultiscripts", "mover", "munder", "munderover", "mtable", "mtr", "mtd",
  "menclose", "mstyle", "maction", "annotation", "annotation-xml",
  "svg", "path", "line", "g",
];
katexSchema.attributes = {
  ...katexSchema.attributes,
  "*": [...(katexSchema.attributes?.["*"] ?? []), "className"],
  span: ["className", "style", "ariaHidden"],
  div: [...(katexSchema.attributes?.div ?? []), "className", "style"],
  math: ["xmlns", "display"],
  annotation: ["encoding"],
  svg: ["xmlns", "width", "height", "viewBox", "preserveAspectRatio", "style", "className"],
  path: ["d", "fill", "style", "className"],
};

export type NoteStatus = "Draft" | "Reviewed" | "Maintained" | "Archived";

type NoteSource = {
  slug: string;
  file: string;
};

export type NoteMeta = {
  slug: string;
  title: string;
  description: string;
  kind: string;
  section: NoteSection;
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
  const required = ["title", "description", "kind", "section", "status"] as const;
  for (const field of required) {
    if (typeof data[field] !== "string" || !data[field].trim()) {
      throw new Error(`${slug}: missing or invalid ${field}`);
    }
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.kind as string)) {
    throw new Error(`${slug}: kind must be a kebab-case value`);
  }
  if (!NOTE_SECTIONS.includes(data.section as NoteSection)) {
    throw new Error(`${slug}: section must be Data, Training, Post-Training, Agents, Governance, or Misc`);
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
    section: data.section as NoteSection,
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

function findMarkdownFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return findMarkdownFiles(file);
    return entry.isFile() && entry.name.endsWith(".md") ? [file] : [];
  });
}

function getAllNoteSources(): NoteSource[] {
  const sources = findMarkdownFiles(notesDirectory)
    .map((file) => ({ slug: path.basename(file, ".md"), file }))
    .sort((a, b) => a.slug.localeCompare(b.slug));
  const slugs = new Set<string>();
  for (const source of sources) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(source.slug)) {
      throw new Error(`${path.relative(notesDirectory, source.file)}: filename must be a stable kebab-case slug`);
    }
    if (slugs.has(source.slug)) throw new Error(`${source.slug}: duplicate public slug`);
    slugs.add(source.slug);
  }
  return sources;
}

function assertSectionPath(source: NoteSource, section: NoteSection) {
  const parentDirectory = path.relative(notesDirectory, path.dirname(source.file));
  if (parentDirectory !== section) {
    throw new Error(`${source.slug}: section ${section} must match parent directory ${parentDirectory || "notes"}`);
  }
}

function getNoteSourceBySlug(slug: string): NoteSource | undefined {
  return getAllNoteSources().find((source) => source.slug === slug);
}

export function getNoteSlugs() {
  return getAllNoteSources().flatMap((source) => {
    const raw = fs.readFileSync(source.file, "utf8");
    const parsed = matter(raw);
    const meta = parseMeta(source.slug, parsed.data, parsed.content);
    assertSectionPath(source, meta.section);
    return meta.status === "Draft" ? [] : [source.slug];
  });
}

export function listNotes(): NoteMeta[] {
  return getAllNoteSources()
    .map((source) => {
      const raw = fs.readFileSync(source.file, "utf8");
      const parsed = matter(raw);
      const meta = parseMeta(source.slug, parsed.data, parsed.content);
      assertSectionPath(source, meta.section);
      return { meta, isDraft: parsed.data.status === "Draft" };
    })
    .filter(({ isDraft }) => !isDraft)
    .map(({ meta }) => meta)
    .sort((a, b) => NOTE_SECTIONS.indexOf(a.section) - NOTE_SECTIONS.indexOf(b.section) || a.order - b.order || b.updated.localeCompare(a.updated) || a.title.localeCompare(b.title));
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
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeSanitize, katexSchema)
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
  const source = getNoteSourceBySlug(slug);
  if (!source) return null;
  const raw = fs.readFileSync(source.file, "utf8");
  const parsed = matter(raw);
  if (parsed.data.status === "Draft") return null;
  const meta = parseMeta(slug, parsed.data, parsed.content);
  assertSectionPath(source, meta.section);
  return {
    ...meta,
    content: parsed.content,
    html: await renderMarkdown(parsed.content),
    raw,
    toc: extractToc(parsed.content),
  };
}
