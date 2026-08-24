---
title: "Herdr: Beginner-to-Advanced Agent Workflows"
description: "A practical guide to using Herdr as a persistent terminal workspace for coding agents, with clear control boundaries from first pane to production orchestration."
kind: "guide"
section: "Misc"
published: "2026-08-24"
updated: "2026-08-24"
checked: "2026-08-24"
version: "1.0"
status: "Reviewed"
topics:
  - AI agents
  - agent harnesses
  - tool use
  - workflow design
order: 2
---

# Herdr, from beginner to advanced: using coding agents well

Herdr is a persistent, agent-aware terminal workspace manager. It keeps real terminal processes running, organizes them
into workspaces, tabs, and panes, and shows which recognized coding agents need attention. It is not a task queue, a
planning system, or an agent framework. Herdr does not establish that a task was correctly completed. The user still
owns scope, review, approvals, and external actions. See the [concepts](https://herdr.dev/docs/concepts/) and
[agents](https://herdr.dev/docs/agents/) documentation.

This guide is written against the [v0.8.2 release](https://github.com/herdrdev/herdr/releases/tag/v0.8.2). Treat the
installed release and its documentation as the authority for commands and integration behavior.

## 1. Install Herdr and use the first 10 minutes well

On macOS or Linux, use the direct installer:

```sh
curl -fsSL https://herdr.dev/install.sh | sh
```

Or install through Homebrew:

```sh
brew install herdr
```

The [installation guide](https://herdr.dev/docs/install/) also covers mise, Nix, manual binaries, and updates.
Confirm the running binary:

```sh
herdr -V
```

From a project directory, start Herdr:

```sh
cd ~/code/my-project
herdr
```

Herdr attaches to, or starts, its default background session. Detaching the client keeps the server and its panes alive.
Use `Ctrl+B`, then `Q`, or close the client terminal, then return with `herdr`. This is different from a full server
restart. A restart restores layout and saved session shape, but it does not preserve arbitrary shell, server, test, or
agent processes. Native session restore may resume eligible supported agent conversations when a current integration
supplied a session reference. Read [session state and restore](https://herdr.dev/docs/session-state/) before relying on
recovery behavior.

Do not use this as a harmless reset:

```sh
herdr server stop
```

It stops the session and exits its pane processes. See [quick start](https://herdr.dev/docs/quick-start/) and
[persistence and remote access](https://herdr.dev/docs/persistence-remote/).

For the first ten minutes, create one workspace, start one agent in its root pane, create a separate test pane, detach,
and reattach. Learn persistence before adding orchestration.

## 2. The model: session, workspace, tab, pane, agent

| Term | Meaning | Practical use |
|---|---|---|
| Session | A persistent server namespace | Fully separate runtime environments |
| Workspace | A project container for tabs, panes, and agents | One repository or investigation |
| Tab | A layout inside a workspace | `work`, `review`, `tests`, or `logs` |
| Pane | A real terminal | A shell, agent, test runner, or server |
| Agent | A recognized agent process in a pane | Codex, Claude Code, and other supported agents |

Start with one workspace per active repository. Use tabs to separate views, then panes to separate processes. A useful
layout is an implementer and reviewer in a `work` tab, with test and server panes in a `verification` tab.

Herdr rolls agent state upward to tabs and workspaces. The states are defined in the
[agents guide](https://herdr.dev/docs/agents/):

| State | Meaning | Response |
|---|---|---|
| `working` | Herdr sees active work | Usually let it continue |
| `blocked` | The agent needs input, approval, or a decision | Read and decide deliberately |
| `done` | Work finished and has not been viewed in the focused UI | Review output and diff |
| `idle` | Ready for input, or a completed state has been seen | Prompt it or leave it available |
| `unknown` | Herdr cannot classify state confidently | Inspect the pane before relying on it |

A state is an attention signal, not a quality judgment. `done` is not approval. `unknown` is not success.
Screen-manifest detection is useful, but new prompts, wrappers, and terminal changes can make classification fallible.
Use `herdr agent explain <target>` and read the pane when state and reality disagree.

## 3. Start Codex or Claude Code and add restore integration

Start the agent in a Herdr pane:

```sh
codex
# or
claude
```

Install the matching official integration:

```sh
herdr integration install codex
herdr integration install claude
herdr integration status
```

For Codex and Claude Code, the integration contributes session identity for restore. Their working, blocked, idle, and
done status still derives from screen-manifest detection. Check the exact behavior and installed version in
[integrations](https://herdr.dev/docs/integrations/) and [agents](https://herdr.dev/docs/agents/).

## 4. Daily workflow: let the sidebar route attention

Start with the work, not the number of agents. Give each agent a bounded brief: files it may touch, acceptance criteria,
commands to run, actions that require asking, and the required final report.

```text
Implement the validation change in src/payments and its tests.
Do not change routes, dependencies, or migrations.
Run the targeted tests.
Report changed files, test command and result, remaining risks, and any request for approval.
```

Use the sidebar to find the next decision. Investigate `blocked` first, then review `done`, let `working` continue, and
inspect `unknown`. Do not poll every pane. Do not let the sidebar replace a diff review.

## 5. Four useful patterns

### Implementer plus reviewer

Give the implementer a bounded edit. Give the reviewer a read-only brief after a diff exists:

```text
Review the current diff. Do not edit.
Check requirements coverage, regressions, missing tests, security and data handling,
and scope creep. Report actionable findings with file and line references.
```

Tests support a review. They do not replace it.

### Parallel feature, tests, and research

Parallelism works when outputs do not compete for the same files. Give the feature agent one implementation area, the
test agent test analysis or targeted test execution, and the research agent a read-only source or code-reading task. If
several agents edit the same files, expect coordination cost and merge conflicts.

### Blocked-agent triage

```sh
herdr agent wait reviewer --until blocked --timeout 120000
herdr agent read reviewer --source recent-unwrapped --lines 80
```

Read the prompt, exact command, diff, and consequence. Then answer, redirect, or stop the work. Never automate
approval. The approval boundary belongs to a named human owner.

### Long-running work beside an agent

Use a pane for raw terminal work such as tests, a dev server, logs, or a watcher. Keep it separate from the agent pane.

```sh
herdr pane run w1:p3 "npm test"
herdr pane wait-output w1:p3 --regex "passed|failed" --timeout 120000
```

Pane commands control terminals. Agent commands control recognized agents and their lifecycle. See
[agent automation](https://herdr.dev/docs/agent-automation/).

## 6. The operating skill and its boundary

Herdr ships two different agent-facing documents:

- The teaching guide at `https://herdr.dev/agent-guide.md` helps an agent explain, set up, or troubleshoot Herdr for a
  human.
- The operating skill tells an agent how to control Herdr from inside a managed pane. Read the
  [agent skill documentation](https://herdr.dev/docs/agent-skill/) and the
  [release-pinned v0.8.2 skill](https://raw.githubusercontent.com/herdrdev/herdr/v0.8.2/skills/herdr/SKILL.md).

Install the skill for compatible agents:

```sh
npx skills add herdrdev/herdr --skill herdr -g
```

Print the release-matched copy carried by the installed binary:

```sh
herdr --skill
```

The required preflight is exact:

```text
HERDR_ENV=1
```

When it is absent, the operating skill should stop and say that it is not in a Herdr-managed pane. This is a guardrail.
It is not authentication, authorization, or a sandbox. It does not grant broad control of a machine, other sessions,
remote hosts, or external systems.

An agent using the skill should work from explicit user intent. It should preserve the user’s current directory, use
`--current` only when operating on its own pane, use an explicit pane ID when targeting a different pane, parse JSON
IDs returned by creation commands, and use `--no-focus` for background layout work. It should read state and output
after waits. It should not infer permission to approve prompts, alter unrelated panes, send messages, publish, deploy,
or make irreversible changes.

## 7. Automation without guessing

Herdr has three surfaces: layout creates workspaces, tabs, and pane topology; pane controls a raw terminal; agent
controls a recognized agent. `agent start` requires an existing available shell pane. It does not create layout.
Creation and split responses return JSON. Parse them instead of predicting IDs.

```sh
created=$(herdr workspace create --cwd "$PWD" --label api --no-focus)
pane_id=$(printf '%s\n' "$created" | jq -r '.result.root_pane.pane_id')
split=$(herdr pane split "$pane_id" --direction right --no-focus)
review_pane=$(printf '%s\n' "$split" | jq -r '.result.pane.pane_id')
herdr agent start reviewer --kind codex --pane "$review_pane"
herdr agent prompt reviewer "Review the current diff and report actionable findings." --wait --timeout 120000
herdr agent read reviewer --source recent-unwrapped --lines 120
```

`$PWD` retains the calling project directory. `--no-focus` avoids stealing focus. `review_pane` is extracted from the
actual split response. `reviewer` is a unique live-agent alias, not a permanent pane name.

`agent prompt --wait` observes lifecycle, not completion of a particular turn. Read the resulting output. For a normal
completion wait, use the default settled-state behavior with an explicit timeout:

```sh
herdr agent wait reviewer --timeout 120000
herdr agent read reviewer --source recent-unwrapped --lines 120
```

Use `--until blocked` only when waiting for an approval or decision. State-specific waits should express a real
requirement, not a habit.

## 8. Advanced use: isolated worktrees, remote modes, and recovery

### Worktree-isolated agents

For changes that can conflict, give writer, reviewer, and tester separate Git worktrees. Each worktree gets its own
workspace and explicit branch. The writer edits only its worktree. The reviewer reads the writer’s diff or branch
without editing. The tester runs the agreed checks against that exact worktree. The human owner decides whether and
how to merge.

Do not share uncommitted edits across agents. Do not let a reviewer silently repair the writer’s work. A reviewer who
needs to propose a fix should report it or receive a new, explicit implementation assignment.

### Remote modes

Start with SSH:

```sh
ssh workbox
```

Then choose one mode from [persistence and remote access](https://herdr.dev/docs/persistence-remote/):

- SSH-first: connect to the host, run `herdr` there, and operate entirely on that host.
- Remote controller: run `herdr --remote workbox` locally. Your local client attaches through SSH to the remote server
  and streams its UI back.
- Observer: use a read-only terminal observer when a bridge needs rendered terminal frames but must not own input or
  resize.

Verify plain SSH before debugging remote Herdr. Treat the remote host as a distinct security and execution environment.
Paths, credentials, repositories, and external effects belong to that host.

### Recovery

Detach preserves live processes. A full server restart does not preserve arbitrary processes. It restores session shape
and may resume eligible native agent sessions, while panes without a stronger restore path return as fresh shells in
their saved directories. Pane history is optional and can contain sensitive output. Experimental live handoff attempts
to preserve running panes across supported server replacement, but it is not a substitute for backups or a tested
recovery plan. See [session state](https://herdr.dev/docs/session-state/).

### CLI wrappers first, raw Socket API when needed

Use the CLI for shell scripts, ordinary orchestration, and debugging. It is the simpler and more stable starting layer.
Use the [Socket API](https://herdr.dev/docs/socket-api/) only when building a protocol client, maintaining a local cache
from event subscriptions, or requiring direct request and response control. Generate and validate against the schema
from the installed binary:

```sh
herdr api schema --json
herdr api snapshot
```

Raw clients should reconnect, refresh their snapshot, handle unknown fields, and tolerate interrupted waits or
subscriptions during a restart or handoff.

### Custom state reporting and plugins

A custom agent can report semantic state from inside a Herdr pane only when the required Herdr environment variables are
present. Use `HERDR_BIN_PATH`, `HERDR_PANE_ID`, a stable `--source`, and explicit state. Release that source when the
agent exits. See [integrations](https://herdr.dev/docs/integrations/).

```sh
if [ "${HERDR_ENV:-}" = "1" ] && [ -n "${HERDR_PANE_ID:-}" ]; then
  "$HERDR_BIN_PATH" pane report-agent "$HERDR_PANE_ID" \
    --source custom:docs-bot \
    --agent docs-bot \
    --state working
fi
```

This guard scopes behavior. It does not authorize broad control. Plugins and integrations execute as the user. They are
not sandboxed. Review their source, scope their credentials, and test them in a disposable environment before trusting
them with a production session.

## 9. Production-controller smoke test

Before treating Herdr as a production controller, test the exact release, shell, terminal, host, wrappers, and agent
CLIs you intend to use.

1. Confirm `herdr -V`, `herdr status`, and `herdr integration status`.
2. Install or refresh each target integration, then start each real agent CLI in a Herdr pane.
3. Confirm recognition, working, blocked, done, idle, and unknown behavior using harmless prompts.
4. Trigger a known approval or question and confirm that it blocks without automatic input.
5. Test `agent read`, `agent explain`, and a timed default settled-state wait.
6. Test detach and reattach with a running test or server.
7. In a disposable session, test stop and restore behavior, including whether the intended agent conversation resumes.
8. Test remote attach, wrappers, nested-tmux avoidance, and a worktree-isolated workflow if you use them.
9. Test the exact automation script with parsed IDs and `--no-focus` before applying it to production work.
10. Re-run the smoke test after a Herdr release, integration update, agent CLI update, terminal change, or plugin
    change.

### Hermes restore-version discrepancy

The current [session-state page](https://herdr.dev/docs/session-state/) lists Hermes Agent integration version `2` as
the native restore minimum. The release-pinned v0.8.2 material and the supplied integration audit identify the shipped
current Hermes integration as version `5`. Do not generalize from either number alone. Check the installed release’s
bundled integration and run `herdr integration status`; then use the version requirement documented for the exact
release you operate. Treat the discrepancy as a documentation conflict until the project resolves it.

## 10. Seven-day progression and capstone

**Day 1:** Start one workspace and one agent. Detach and reattach.

**Day 2:** Separate agent, tests, and shell into panes and tabs.

**Day 3:** Use the sidebar as an attention queue. Inspect `unknown` and review `done`.

**Day 4:** Run an implementer plus read-only reviewer workflow.

**Day 5:** Create layout through automation, parse IDs with `jq`, and use `--no-focus`.

**Day 6:** Run a long test job beside an agent. Practice `agent explain`, output reads, and timeouts.

**Day 7:** Practice blocked-agent triage, detach versus restart, and a safe stop decision in a disposable session.

For the capstone, use two agents and a human owner on a small, testable change. Put the implementer in one worktree and
give the reviewer read-only access to that diff or branch. Run tests in a dedicated pane or worktree. The human owner
approves scope, reads the review, checks the evidence, and performs any commit, merge, deployment, message,
publication, or other external action unless explicitly delegated.

The final test is simple: can you state what changed, why, what evidence supports it, what remains uncertain, and who
approved the next action?

## Canonical sources

- [Herdr v0.8.2 release](https://github.com/herdrdev/herdr/releases/tag/v0.8.2)
- [Install](https://herdr.dev/docs/install/)
- [Quick start](https://herdr.dev/docs/quick-start/)
- [Concepts](https://herdr.dev/docs/concepts/)
- [Agents](https://herdr.dev/docs/agents/)
- [Integrations](https://herdr.dev/docs/integrations/)
- [Agent automation](https://herdr.dev/docs/agent-automation/)
- [CLI reference](https://herdr.dev/docs/cli-reference/)
- [Socket API](https://herdr.dev/docs/socket-api/)
- [Session state and restore](https://herdr.dev/docs/session-state/)
- [Persistence and remote access](https://herdr.dev/docs/persistence-remote/)
- [Troubleshooting](https://herdr.dev/docs/troubleshooting/)
- [Agent skill](https://herdr.dev/docs/agent-skill/)
- [Release-pinned v0.8.2 operating skill](https://raw.githubusercontent.com/herdrdev/herdr/v0.8.2/skills/herdr/SKILL.md)
