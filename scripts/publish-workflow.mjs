import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export const PUBLISH_USAGE = `
Usage:
  npm run publish:preflight
  npm run publish:review
  npm run publish:commit -- --confirm-commit --message "type: summary" -- path/to/file [path/to/file ...]
  npm run publish:push -- --confirm-push
`;

function requireOption(args, name) {
  if (!args.includes(name)) throw new Error(`Missing required ${name}.`);
}

function readOption(args, name) {
  const index = args.indexOf(name);
  if (index < 0 || !args[index + 1]?.trim()) throw new Error(`Missing value for ${name}.`);
  return args[index + 1];
}

export function validatePaths(paths) {
  if (!paths.length) throw new Error("List the exact paths to stage after --; refusing to stage the whole worktree.");
  for (const file of paths) {
    if (!file || file === "." || file.startsWith("-") || file.startsWith("/") || file.split("/").includes("..")) {
      throw new Error(`Unsafe or non-specific path: ${file}`);
    }
  }
  return paths;
}

export function parsePublishArgs(args) {
  const [action] = args;
  if (!["preflight", "review", "commit", "push"].includes(action)) throw new Error(PUBLISH_USAGE.trim());
  if (action === "preflight" || action === "review") {
    if (args.length !== 1) throw new Error(`${action} accepts no additional arguments.\n${PUBLISH_USAGE.trim()}`);
    return { action };
  }
  if (action === "push") {
    requireOption(args, "--confirm-push");
    if (args.length !== 2) throw new Error(`push accepts only --confirm-push.\n${PUBLISH_USAGE.trim()}`);
    return { action };
  }
  requireOption(args, "--confirm-commit");
  const message = readOption(args, "--message");
  const separator = args.indexOf("--");
  const paths = validatePaths(separator < 0 ? [] : args.slice(separator + 1));
  return { action, message, paths };
}

function run(command, args, options = {}) {
  process.stdout.write(`$ ${command} ${args.join(" ")}\n`);
  const result = spawnSync(command, args, { cwd: process.cwd(), stdio: "inherit", ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} exited ${result.status ?? "without a status"}.`);
}

function output(command, args) {
  const result = spawnSync(command, args, { cwd: process.cwd(), encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} exited ${result.status ?? "without a status"}.`);
  return result.stdout.trim();
}

function showUntrackedDiffs() {
  const files = output("git", ["ls-files", "--others", "--exclude-standard"]).split("\n").filter(Boolean);
  for (const file of files) {
    process.stdout.write(`$ git diff --no-index -- /dev/null ${file}\n`);
    const result = spawnSync("git", ["diff", "--no-index", "--", "/dev/null", file], { cwd: process.cwd(), stdio: "inherit" });
    if (result.error) throw result.error;
    if (result.status !== 0 && result.status !== 1) throw new Error(`git exited ${result.status ?? "without a status"} while reviewing ${file}.`);
  }
}

function assertMainBranch() {
  const branch = output("git", ["branch", "--show-current"]);
  if (branch !== "main") throw new Error(`Refusing to publish from ${branch || "a detached HEAD"}; switch to main first.`);
}

function assertNoStagedChanges() {
  const staged = output("git", ["diff", "--cached", "--name-only"]);
  if (staged) throw new Error("Staged changes already exist. Review or unstage them before using the scoped commit command.");
}

function assertCleanWorktree() {
  const status = output("git", ["status", "--porcelain"]);
  if (status) throw new Error("Worktree is not clean. Review, commit, or deliberately stash changes before pushing.");
}

function preflight() {
  run("npm", ["run", "check"]);
  run("git", ["diff", "--check"]);
  run("git", ["status", "--short", "--branch"]);
  process.stdout.write("publish_workflow=PRECHECK_PASSED no commit, push, or deploy was performed\n");
}

function review() {
  run("git", ["status", "--short", "--branch"]);
  run("git", ["diff", "--check"]);
  run("git", ["diff", "--stat"]);
  run("git", ["diff"]);
  showUntrackedDiffs();
  run("git", ["diff", "--cached", "--stat"]);
  run("git", ["diff", "--cached"]);
  run("git", ["show", "--stat", "--oneline", "--no-renames", "HEAD"]);
  run("git", ["show", "--format=", "--no-ext-diff", "HEAD"]);
  process.stdout.write("Review the working-tree and HEAD diffs above. This command does not stage, commit, push, or deploy.\n");
}

function commit({ message, paths }) {
  assertMainBranch();
  assertNoStagedChanges();
  preflight();
  run("git", ["add", "--", ...paths]);
  run("git", ["diff", "--cached", "--check"]);
  run("git", ["diff", "--cached", "--stat"]);
  run("git", ["commit", "-m", message]);
  process.stdout.write("publish_workflow=COMMIT_CREATED review it with npm run publish:review before an explicit push\n");
}

function push() {
  assertMainBranch();
  assertCleanWorktree();
  run("git", ["fetch", "origin", "main"]);
  run("git", ["push", "origin", "main"]);
  const local = output("git", ["rev-parse", "HEAD"]);
  const remote = output("git", ["ls-remote", "origin", "refs/heads/main"]).split(/\s+/)[0];
  if (!remote || local !== remote) throw new Error(`Remote main (${remote || "missing"}) does not match local HEAD (${local}).`);
  process.stdout.write(`publish_workflow=PUSH_VERIFIED commit=${local} deployment=Vercel main integration will run separately\n`);
}

export function main(args) {
  const command = parsePublishArgs(args);
  if (command.action === "preflight") return preflight();
  if (command.action === "review") return review();
  if (command.action === "commit") return commit(command);
  return push();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`publish_workflow=FAILED reason=${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
