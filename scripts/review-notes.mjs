import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const directory = path.join(process.cwd(), "notes");
const args = process.argv.slice(2);
const asJson = args.includes("--json");
const thresholdArg = args.find((arg) => arg.startsWith("--threshold="));
const thresholdDays = thresholdArg ? Number(thresholdArg.split("=")[1]) : 90;
if (!Number.isFinite(thresholdDays) || thresholdDays <= 0) {
  throw new Error("--threshold must be a positive number of days");
}

function findMarkdownFiles(currentDirectory) {
  if (!fs.existsSync(currentDirectory)) return [];
  return fs.readdirSync(currentDirectory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(currentDirectory, entry.name);
    if (entry.isDirectory()) return findMarkdownFiles(file);
    return entry.isFile() && entry.name.endsWith(".md") ? [file] : [];
  });
}

const files = findMarkdownFiles(directory).sort();
const today = new Date();

function daysSince(dateString) {
  const then = new Date(`${dateString}T00:00:00Z`);
  return Math.floor((today.getTime() - then.getTime()) / 86_400_000);
}

const notes = files.map((file) => {
  const slug = path.basename(file, ".md");
  const { data } = matter(fs.readFileSync(file, "utf8"));
  const referenceField = data.checked ? "checked" : "updated";
  const referenceDate = data[referenceField];
  return {
    slug,
    section: data.section,
    title: data.title,
    kind: data.kind,
    status: data.status,
    referenceField,
    referenceDate,
    daysSinceReview: daysSince(referenceDate),
  };
});

const reviewable = notes.filter((note) => note.status === "Reviewed" || note.status === "Maintained");
const stale = reviewable
  .filter((note) => note.daysSinceReview > thresholdDays)
  .sort((a, b) => b.daysSinceReview - a.daysSinceReview);
const fresh = reviewable
  .filter((note) => note.daysSinceReview <= thresholdDays)
  .sort((a, b) => b.daysSinceReview - a.daysSinceReview);
const drafts = notes.filter((note) => note.status === "Draft");
const archived = notes.filter((note) => note.status === "Archived");

if (asJson) {
  console.log(JSON.stringify({ thresholdDays, generatedAt: today.toISOString(), stale, fresh, drafts, archived }, null, 2));
} else {
  console.log(`Note review — threshold ${thresholdDays} days, generated ${today.toISOString().slice(0, 10)}\n`);

  if (stale.length) {
    console.log(`STALE, needs review (${stale.length}):`);
    for (const note of stale) {
      console.log(`  [${note.section}] ${note.slug} — ${note.title} — ${note.referenceField} ${note.referenceDate} (${note.daysSinceReview}d ago) [${note.status}]`);
    }
  } else {
    console.log("STALE, needs review: none");
  }

  console.log(`\nOK (${fresh.length}):`);
  for (const note of fresh) {
    console.log(`  [${note.section}] ${note.slug} — ${note.referenceField} ${note.referenceDate} (${note.daysSinceReview}d ago) [${note.status}]`);
  }

  if (archived.length) {
    console.log(`\nARCHIVED, exempt from staleness (${archived.length}): ${archived.map((note) => note.slug).join(", ")}`);
  }
  if (drafts.length) {
    console.log(`\nDRAFT, unpublished (${drafts.length}): ${drafts.map((note) => note.slug).join(", ")}`);
  }
}
