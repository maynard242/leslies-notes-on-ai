import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const directory = path.join(process.cwd(), "notes");
const files = fs.readdirSync(directory).filter((file) => file.endsWith(".md")).sort();
if (!files.length) throw new Error("No Markdown notes found in notes/");

const slugs = new Set();
const required = ["title", "description", "published", "updated", "checked", "version", "status", "tags"];
for (const file of files) {
  const slug = file.replace(/\.md$/, "");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`${file}: filename must be a stable kebab-case slug`);
  if (slugs.has(slug)) throw new Error(`${file}: duplicate slug`);
  slugs.add(slug);
  const raw = fs.readFileSync(path.join(directory, file), "utf8");
  const { data, content } = matter(raw);
  for (const field of required) if (data[field] === undefined || data[field] === "") throw new Error(`${file}: missing ${field}`);
  for (const field of ["published", "updated", "checked"]) {
    if (typeof data[field] !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(data[field]) || Number.isNaN(Date.parse(`${data[field]}T00:00:00Z`))) throw new Error(`${file}: invalid ${field}`);
  }
  if (!Array.isArray(data.tags) || !data.tags.length) throw new Error(`${file}: tags must be non-empty`);
  if (!["Draft", "Reviewed", "Maintained"].includes(data.status)) throw new Error(`${file}: invalid status`);
  if (!content.match(/^# /m)) throw new Error(`${file}: content must contain an H1`);
  if (content.includes("TODO") || content.includes("TBD")) throw new Error(`${file}: unresolved placeholder`);
}
console.log(`content_validation=PASS notes=${files.length} slugs=${[...slugs].join(",")}`);
