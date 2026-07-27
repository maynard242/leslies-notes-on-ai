import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";

const directory = path.join(process.cwd(), "notes");
const files = fs.readdirSync(directory).filter((file) => file.endsWith(".md")).sort();
if (!files.length) throw new Error("No Markdown notes found in notes/");

const slugs = new Set();
const required = ["title", "description", "kind", "published", "updated", "status", "topics"];
for (const file of files) {
  const slug = file.replace(/\.md$/, "");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`${file}: filename must be a stable kebab-case slug`);
  if (slugs.has(slug)) throw new Error(`${file}: duplicate slug`);
  slugs.add(slug);
  const raw = fs.readFileSync(path.join(directory, file), "utf8");
  const { data, content } = matter(raw);
  for (const field of required) if (data[field] === undefined || data[field] === "") throw new Error(`${file}: missing ${field}`);
  for (const field of ["title", "description"]) {
    if (typeof data[field] !== "string" || !data[field].trim()) throw new Error(`${file}: ${field} must be a non-empty string`);
  }
  for (const field of ["published", "updated", ...(data.checked === undefined ? [] : ["checked"])]) {
    const value = data[field];
    const parsedDate = typeof value === "string" ? new Date(`${value}T00:00:00Z`) : null;
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || !parsedDate || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== value) throw new Error(`${file}: invalid ${field}`);
  }
  if (typeof data.kind !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.kind)) throw new Error(`${file}: kind must be kebab-case`);
  if (!Array.isArray(data.topics) || !data.topics.length || data.topics.some((topic) => typeof topic !== "string" || !topic.trim())) throw new Error(`${file}: topics must be a non-empty string array`);
  if (!["Draft", "Reviewed", "Maintained", "Archived"].includes(data.status)) throw new Error(`${file}: invalid status`);
  if (data.version !== undefined && (typeof data.version !== "string" || !data.version.trim())) throw new Error(`${file}: invalid version`);
  if (data.order !== undefined && (typeof data.order !== "number" || !Number.isFinite(data.order))) throw new Error(`${file}: invalid order`);
  if (!content.match(/^# /m)) throw new Error(`${file}: content must contain an H1`);
  if (content.includes("TODO") || content.includes("TBD")) throw new Error(`${file}: unresolved placeholder`);
  const tree = unified().use(remarkParse).parse(content);
  visit(tree, ["link", "image"], (node) => {
    const url = String(node.url ?? "").trim();
    const scheme = url.match(/^([a-z][a-z0-9+.-]*):/i)?.[1]?.toLowerCase();
    if (scheme && !["http", "https", "mailto"].includes(scheme)) throw new Error(`${file}: disallowed URL scheme ${scheme}`);
    if (node.type === "image" && scheme === "http") throw new Error(`${file}: remote images must use HTTPS`);
  });
}
console.log(`content_validation=PASS notes=${files.length} slugs=${[...slugs].join(",")}`);
