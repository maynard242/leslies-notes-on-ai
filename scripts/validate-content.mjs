import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";

const directory = path.join(process.cwd(), "notes");
const sections = ["Data", "Training", "Post-Training", "Agents", "Governance", "Misc"];

function findMarkdownFiles(currentDirectory) {
  if (!fs.existsSync(currentDirectory)) return [];
  return fs.readdirSync(currentDirectory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(currentDirectory, entry.name);
    if (entry.isDirectory()) return findMarkdownFiles(file);
    return entry.isFile() && entry.name.endsWith(".md") ? [file] : [];
  });
}

const files = findMarkdownFiles(directory).sort();
if (!files.length) throw new Error("No Markdown notes found in notes/");

const slugs = new Set();
const required = ["title", "description", "kind", "section", "published", "updated", "status", "topics"];
for (const file of files) {
  const relativeFile = path.relative(directory, file);
  const slug = path.basename(file, ".md");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`${relativeFile}: filename must be a stable kebab-case slug`);
  if (slugs.has(slug)) throw new Error(`${relativeFile}: duplicate public slug ${slug}`);
  slugs.add(slug);
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  for (const field of required) if (data[field] === undefined || data[field] === "") throw new Error(`${relativeFile}: missing ${field}`);
  for (const field of ["title", "description"]) {
    if (typeof data[field] !== "string" || !data[field].trim()) throw new Error(`${relativeFile}: ${field} must be a non-empty string`);
  }
  for (const field of ["published", "updated", ...(data.checked === undefined ? [] : ["checked"])]) {
    const value = data[field];
    const parsedDate = typeof value === "string" ? new Date(`${value}T00:00:00Z`) : null;
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || !parsedDate || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== value) throw new Error(`${relativeFile}: invalid ${field}`);
  }
  if (typeof data.kind !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.kind)) throw new Error(`${relativeFile}: kind must be kebab-case`);
  if (!sections.includes(data.section)) throw new Error(`${relativeFile}: section must be Data, Training, Post-Training, Agents, Governance, or Misc`);
  if (path.dirname(relativeFile) !== data.section) throw new Error(`${relativeFile}: section must match its parent directory`);
  if (!Array.isArray(data.topics) || !data.topics.length || data.topics.some((topic) => typeof topic !== "string" || !topic.trim())) throw new Error(`${relativeFile}: topics must be a non-empty string array`);
  if (!["Draft", "Reviewed", "Maintained", "Archived"].includes(data.status)) throw new Error(`${relativeFile}: invalid status`);
  if (data.version !== undefined && (typeof data.version !== "string" || !data.version.trim())) throw new Error(`${relativeFile}: invalid version`);
  if (data.order !== undefined && (typeof data.order !== "number" || !Number.isFinite(data.order))) throw new Error(`${relativeFile}: invalid order`);
  if (!content.match(/^# /m)) throw new Error(`${relativeFile}: content must contain an H1`);
  if (content.includes("TODO") || content.includes("TBD")) throw new Error(`${relativeFile}: unresolved placeholder`);
  const tree = unified().use(remarkParse).parse(content);
  visit(tree, ["link", "image"], (node) => {
    const url = String(node.url ?? "").trim();
    const scheme = url.match(/^([a-z][a-z0-9+.-]*):/i)?.[1]?.toLowerCase();
    if (scheme && !["http", "https", "mailto"].includes(scheme)) throw new Error(`${relativeFile}: disallowed URL scheme ${scheme}`);
    if (node.type === "image" && scheme === "http") throw new Error(`${relativeFile}: remote images must use HTTPS`);
  });
}
console.log(`content_validation=PASS notes=${files.length} slugs=${[...slugs].join(",")}`);
