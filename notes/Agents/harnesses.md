---
title: "Harnesses"
description: "How to build, evaluate, and secure the system around an AI model—and interpret agent scores honestly."
kind: "reference"
section: "Agents"
published: "2026-07-27"
updated: "2026-08-10"
checked: "2026-08-10"
version: "2.0"
status: "Reviewed"
topics:
  - AI agents
  - agent harnesses
  - evaluation
  - engineering
  - safety
order: 2
---

# Harnesses

---

## TL;DR

**Observed agent performance is not a model-only property. It belongs to a model–harness–environment configuration, run with a particular budget and measured by a particular protocol and grader.**

Controlled comparisons now show double-digit harness effects, model–harness interactions, and rank reversals within tested grids. The strongest current evidence includes a matched 3×3 coding study and a five-model GAIA analysis, but both are bounded, recent, and benchmark-specific ([Zhang et al., 2026](https://arxiv.org/abs/2605.23950); [Starace, 2026](https://arxiv.org/abs/2606.08529)).

These are important results, not a universal law. Most of the evidence is recent, benchmark-specific, and preprint-stage. It does **not** show that harnesses always matter more than models, or that every benchmark score is an unknown lower bound. It shows something narrower and more defensible:

1. A model score without its harness is an incomplete experimental result.
2. Model rankings are conditional on the interface, tools, budget, and control loop used to elicit them.
3. A harness often implements much of the agent control plane and is one major enforcement layer: it mediates permissions, credentials, network access, memory, approval gates, and recovery alongside sandboxes, operating systems, identity services, and downstream applications.
4. The practical target is not the most elaborate harness. It is the **simplest harness that passes realistic evaluations, contains failures, and remains legible enough to debug**.

Choose the job in front of you. Each path ends in an implementation artifact or release gate.

| Task | Path through the note |
|---|---|
| **Design the smallest viable agent** | [§1 definition](#1-what-a-harness-is) → [production loop](#25-a-minimum-production-control-loop) → [§4 practice](#4-what-reliably-matters-in-practice) |
| **Make a run survive retries, restarts, and delegation** | [§2.2 durable execution](#22-durable-execution-the-transcript-is-not-the-workflow) → [§2.3 orchestration](#23-common-orchestration-patterns) → [§4.6 recovery](#46-make-recovery-bounded-and-informative) |
| **Connect MCP or another agent protocol** | [§2.4 protocols](#24-protocols-standardize-interfaces-not-trust) → [§7.1 authority](#71-threat-model-the-authority-path) → [§7.3 external controls](#73-controls-that-belong-outside-the-model) |
| **Evaluate or compare systems** | [§3 evidence](#3-what-the-evidence-actually-shows) → [§5 methods](#5-how-to-evaluate-and-report-a-harness) → [Harness Card](#appendix-b--copyable-harness-card) |
| **Ship a consequential agent** | [§2.5 production loop](#25-a-minimum-production-control-loop) → [§7 safety](#7-failure-modes-and-the-safety-surface) → [shipment gate](#a-shipment-gate-for-consequential-agents) |
| **Review a model or harness upgrade** | [§4.8 system metrics](#48-measure-the-system-you-plan-to-operate) → [§8 Bitter Lesson](#8-the-bitter-lesson-problem) → [failure lookup](#failure-to-control-lookup) |

---

## 1. What a harness is

A useful working definition:

> **An agent harness is the software around a model that turns model outputs into a continuing process: constructing context, exposing tools, preserving state, executing actions, checking results, and deciding whether to continue, retry, ask, escalate, or stop.**

The word is not standardized. *Harness*, *scaffold*, *runtime*, *agent loop*, and *agent framework* overlap in current usage. It helps to separate the system into layers instead of arguing over labels.

| Layer | What it is | Examples |
|---|---|---|
| **Model** | Learned parameters plus the serving implementation | GPT, Claude, Gemini, Qwen, GLM |
| **Model configuration** | Reasoning effort, sampling, system prompt, context limit, provider features | temperature, thinking budget, prompt caching |
| **Agent harness / scaffold** | Context assembly, tool mediation, state, loop, recovery, verification, permissions | Claude Code, Codex CLI, OpenHands, SWE-agent, OpenClaw |
| **Task environment** | The world the agent acts on | repository, shell, browser, APIs, files, operating system |
| **Evaluation harness** | Task launcher, environment reset, budget, grader, retries, aggregation | SWE-bench runner, benchmark-specific grader |
| **Human and organization** | Goal-setting, approvals, review, incentives, operating procedures | developer, analyst, security policy, release process |

An agent harness and an evaluation harness are therefore **related but not identical**. An agent harness elicits and controls behavior. An evaluation harness packages tasks and judges outcomes. A benchmark may embed an agent harness, call an external one, or allow entrants to bring their own. Conflating the two hides important choices: environment images, task timeouts, graders, and retry policy can change a score even when the agent loop does not.

### Harness versus framework

A framework usually provides primitives: message state, graph nodes, tool schemas, callbacks, durable execution. A harness is an operational configuration built from those primitives: prompts, tools, permissions, lifecycle hooks, context policy, verification, and stopping rules.

This is a difference of packaging and completeness, not a hard ontology. LangGraph is usually used as a framework, but a team can build a full harness with it. Claude Code is normally encountered as a harness, but parts of its SDK can be used as framework components.

### The precise claim

The observable quantity is closer to:

```text
score = f(model version, model settings, harness, tools, environment,
          task distribution, resource budget, grader, randomness)
```

In deployment, add people, process, incentives, and changing real-world conditions.

This does not make the model irrelevant. Models differ sharply in reasoning, knowledge, tool use, reliability, and cost. It means that **a model-only explanation is underspecified whenever the measured object is an agent system**.

### A minimal formal model

The informal formula above is enough for most readers. A more technical representation helps locate responsibility for a failure.

At step *t*:

1. The environment has latent state $x_t$ and the harness has durable state $d_t$.
2. An observation function $O_H$ turns part of that state into model-visible evidence $o_t$.
3. A context function $C_H$ selects instructions, history, retrieved material, tool definitions, and working state to form $c_t$.
4. The model samples a proposed output $z_t \sim \pi_M(\cdot\mid c_t)$.
5. The harness parses and validates that output, applies authorization policy $P_H$, and either emits an action $a_t$, asks for approval, repairs the proposal, or stops.
6. The environment transition $T_E$ produces a new state $x_{t+1}$; verifiers and event handlers update $d_{t+1}$ and construct the next observation.

In compact form:

```text
o_t = O_H(x_t, d_t)
c_t = C_H(o_≤t, d_t, tools, budget)
z_t ~ π_M(. | c_t)
a_t = authorize_H(validate_H(z_t))
x_{t+1} ~ T_E(. | x_t, a_t)
```

This is a descriptive decomposition, not a claim that deployed agents are clean Markov systems. Real environments are partially observed, asynchronous, and influenced by people and services outside the agent. The value of the notation is diagnostic:

- wrong or stale $o_t$ is an **observation problem**;
- useful evidence omitted from $c_t$ is a **context-construction problem**;
- a poor proposal $z_t$ given adequate context is more plausibly a **model-policy problem**;
- an invalid proposal that reaches the world is a **validation or authorization problem**;
- a correct action with an unexpected result may be an **environment or concurrency problem**;
- failure to notice and repair that result is a **verification and recovery problem**.

The layers interact. A model may compensate for a poor observation, while a verifier may catch a poor model proposal. Good evaluation preserves those interactions instead of assigning every outcome to one component.

---

## 2. Anatomy: what the harness controls

A recent position paper proposes **ETCSOVG** as a seven-part disclosure checklist ([Zhang et al., 2026](https://arxiv.org/abs/2605.23950)). It is new, not a settled standard, but it is a useful way to inspect a system.

| Layer | Questions to ask |
|---|---|
| **E — Execution** | Where does code run? What is sandboxed? Are network, CPU, memory, wall-clock, step, and spend limits enforced outside the model? |
| **T — Tool** | Which actions exist? How are tools named and described? What do success, partial success, and failure return? |
| **C — Context** | What enters the prompt? What is retrieved, compressed, discarded, or persisted? How is untrusted content marked? |
| **S — Scheduling** | What is the loop? When does the system retry, branch, delegate, ask a human, roll back, or stop? |
| **O — Observability** | Are prompts, tool calls, results, state changes, costs, and approval events logged and versioned? |
| **V — Verification** | What checks progress and final output? Are checks deterministic, model-based, human, or independent of the generator? |
| **G — Governance** | Which identities, credentials, permissions, approval gates, and side effects are available? Who can change the policy? |

Four cross-cutting dials matter in every layer:

- **Autonomy horizon:** how long the system can act before a person must review it.
- **Action-space breadth:** what the system can read, change, buy, send, deploy, or delete.
- **Exposure to untrusted input:** how much external content can enter context or persistent state.
- **Resource budget:** tokens, retries, agents, wall-clock time, money, and compute.

The last is often ignored. A harness can buy higher success with more attempts, more reasoning, more sub-agents, or a more generous timeout. That is a valid product choice. It is not a free capability gain, and benchmark tables should not hide it.

### A control-systems lens — useful, not a theorem

The control-theoretic framing is helpful if kept modest. The harness observes part of the environment, constructs the model's next observation, executes the selected action, measures the result, and feeds back new information. The full agent loop is therefore a partially observed, closed-loop system.

The model is not literally inert or incapable of self-correction: it can reason within a call and respond to errors in context. But the **observation channel, action channel, authority boundary, and timing of external feedback** are system properties. A stronger model may avoid or recover from more mistakes. It cannot, by itself, enforce a network boundary or mint a scoped credential.

Zhang et al. propose three controller-level quantities. Treat them as design diagnostics, not established metrics:

| Diagnostic | Practical interpretation | What to measure |
|---|---|---|
| **Stability** | Does an error tend to be contained and corrected, or does it trigger a worsening trajectory? | recovery rate after tool failure; runaway loops; regressions after retries |
| **Context drift** | Does task-relevant state disappear, become stale, or become distorted over time? | forgotten requirements; contradictory plans; lost provenance; compaction errors |
| **Control lag** | How long between an anomaly becoming detectable and a corrective action taking effect? | wasted steps after failure; repeated invalid calls; cost before rollback or escalation |

These quantities are jointly influenced by model and harness. The harness determines the feedback path; the model determines how well it uses that feedback.

### 2.1 Observation and action spaces

The harness does not merely hand the model “the environment.” It chooses a representation.

A browser can be observed as pixels, a DOM tree, an accessibility tree, extracted text, network events, or some mixture. A repository can be observed through whole files, search results, compiler errors, dependency graphs, or summaries. A workplace agent may receive event streams from email and chat, or only a snapshot taken at task start. Each choice changes what is easy to notice and what can disappear.

The action space is equally consequential:

| Interface | Strength | Typical failure |
|---|---|---|
| **High-level API or task tool** | Compact, typed, easy to validate | Abstraction hides state or cannot express an unusual action |
| **Shell or code execution** | Composable; lets the model build its own operations | Broad authority, dependency risk, difficult static prediction |
| **DOM or accessibility actions** | Semantic targets; less sensitive to screen coordinates | Incomplete or stale trees; mismatch with what a user sees |
| **Pixel/keyboard/mouse control** | General across applications | Visual grounding errors, timing races, modal windows, streaming state |
| **Human request or approval** | Resolves ambiguity and authority | Latency, poor escalation criteria, approval fatigue |

There is no universally superior interface. High-level tools can raise reliability by reducing action-space entropy, but they can also conceal information or bake in the wrong workflow. General interfaces preserve flexibility but make planning, authorization, and verification harder.

This is especially visible in browser and computer-use research. [BrowserGym](https://arxiv.org/abs/2412.05467) was built partly to standardize observation and action spaces across otherwise fragmented web benchmarks. [OSWorld 2.0](https://arxiv.org/abs/2606.29537) adds dynamic environments, hidden state, streaming interaction, state-based evaluators, and long action trajectories. Its results are not a controlled harness comparison. They are useful because they make observation and interface choices explicit and make action efficiency and intermediate-state correctness measurable.

For evaluation, report the observation modalities, action primitives, refresh cadence, and any model-visible metadata. “Browser access” is not a reproducible interface description.

For implementation, treat observations and action targets as versioned snapshots. DOM nodes, accessibility references, pixel coordinates, window handles, and tab IDs can become stale after navigation, re-rendering, or a modal transition. After a state-changing action, obtain fresh state before issuing the next action. Separate **delivery evidence** (“the click or key event was accepted”) from **outcome evidence** (“the intended field, file, or external record changed”). Native dialogs, browser chrome, cross-origin frames, and the page itself may also sit in different authority and observation domains; do not silently downgrade from trusted input to synthetic DOM events merely because the first route was inconvenient.

Tool and environment outputs are not always text. Images, audio, video, archives, and binary documents need an artifact record: stable URI, MIME type, hash, size, dimensions or duration, origin, trust label, and transformation lineage. Record OCR, cropping, resizing, transcoding, redaction, and retention decisions. Pass a reference instead of embedding base64 when the model or tool can dereference it safely; otherwise the context window becomes an undocumented and lossy data plane.

### 2.2 Durable execution: the transcript is not the workflow

Long-running agents need explicit operational state. At minimum, distinguish:

- **task:** the user goal and acceptance criteria;
- **thread or session:** the continuity and visibility boundary through which a task may span several runs;
- **run:** one end-to-end execution of that task;
- **attempt:** a retry or alternative trajectory within the run;
- **step:** one model decision or deterministic transition;
- **tool call:** one typed request and response, linked to any resulting effect;
- **child run:** delegated work with a parent, authority envelope, deadline, and fan-in rule;
- **effect:** a change to an external system;
- **artifact:** a versioned output with provenance;
- **approval:** a recorded authorization tied to a proposed effect.

Store those objects outside the prompt. The prompt should receive a selected view of canonical state, not become canonical state itself.

A minimal run state machine might be:

```text
created → running ↔ waiting_for_tool
                  ↔ waiting_for_approval
                  ↔ waiting_for_external_event
                  ↔ suspended
        → cancellation_requested → draining → cancelled
        → completed | failed | timed_out | cancel_failed | manual_repair
```

Each transition should identify the triggering event, preconditions, actor or policy version, persisted state change, external effect IDs, next deadline, and allowed recovery. Waiting states must be durable: a process restart or client disconnect should not silently erase the task, repeat the effect, or bypass an approval. Terminal states should be explicit and immutable except through a recorded reopen or compensation process.

The engineering is standard distributed-systems work, made more important by a stochastic planner:

- **Checkpoints:** persist state before expensive or consequential phases.
- **Idempotency keys and deduplication:** for the defined key scope, atomically bind the key to a payload fingerprint and the resulting receipt or effect; retain that record beyond the retry horizon and define how concurrent duplicates behave.
- **Preconditions and compare-and-swap:** refuse a write if the underlying record changed after the agent observed it.
- **Event logs:** record proposals, approvals, tool results, state transitions, and externally visible effects with stable run and step IDs.
- **Transactional outbox or equivalent handoff:** avoid recording “sent” when an external send failed, or sending when the local record was not committed.
- **Deadlines and cancellation:** propagate a stop request through sub-agents, tools, and queued work; wait for acknowledgement or quiescence, fence late commits, and route failed cancellation to compensation or manual repair.
- **Compensating actions:** define what can be undone when a distributed workflow cannot be rolled back atomically.
- **Resume tests:** kill the process at arbitrary steps and verify that it restarts without losing state or repeating effects.

Separate two retry contracts. A **transport or activity retry** repeats an identical request under the same key, and is safe only when the operation is intrinsically idempotent or the service enforces a deduplication contract. A **semantic or planner retry** changes the proposal or arguments, needs a new key, and must pass policy and approval again. Unless the tool layer provides the first contract, retries create at-least-once execution risk. The harness must know whether a failed call changed nothing, changed something, or has an unknown outcome. “Error” is not enough ([RFC 9110 §9.2.2](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2); [IETF Idempotency-Key draft](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/)).

Checkpoint replay is not business rollback. Replaying an event history can reconstruct harness state, but it does not unsend an email, reverse a payment, or restore a database changed by another service. Version workflow code, record nondeterministic model and API results rather than blindly re-running them during replay, and use explicit compensation or manual repair for effects that cannot be reversed atomically.

Parallelism adds another contract. Give every child run a parent identity, bounded authority, isolated or deliberately shared workspace, deadline, and cancellation path. Define the fan-in rule before launch: first valid result, quorum, deterministic reducer, human selection, or model synthesis. Also define the parent-close policy—await, cancel, terminate, or abandon—plus child-start acceptance, acknowledgement timeouts, leases or fencing, and how late results are handled. Detect conflicting writes; cap fan-out and queue depth. Parallel agents do not compose safely merely because their outputs are text ([Temporal child workflows](https://docs.temporal.io/child-workflows); [parent-close policy](https://docs.temporal.io/parent-close-policy)).

### 2.3 Common orchestration patterns

Most production systems combine a few recurring patterns. These are design choices, not a maturity ladder.

| Pattern | Useful when | Characteristic risk |
|---|---|---|
| **Single tool loop** | The task is bounded and environmental feedback is clear | Meandering, repeated calls, weak long-horizon state |
| **Planner–executor** | Work has separable phases or expensive actions | Plans become stale; executor follows them after the world changes |
| **Explicit state machine or graph** | The workflow has known stages, approvals, or compliance rules | Edge cases accumulate into a brittle graph; model autonomy is only moved into nodes |
| **Actor–verifier loop** | Outputs have cheap tests or independent evidence | Shared blind spots; verifier gaming; infinite repair cycles |
| **Manager–worker / sub-agent** | Parallel search or specialist contexts genuinely help | Coordination cost, duplicated work, lossy handoffs, unclear ownership |
| **Code-mediated composition** | Many low-level tools can be safely composed in a sandbox | Generated code becomes a second program to secure and debug |
| **Event-driven durable workflow** | Tasks span hours or wait on external events | Concurrency, stale events, cancellation, and version-migration complexity |

Start with the single loop. Move to an explicit state machine when policy or business process demands known transitions. Use sub-agents when context isolation or parallelism earns more than coordination costs. Add durable workflow machinery when tasks must survive process restarts, wait for people, or make external changes over time.

OpenAI's [Codex harness-engineering case study](https://openai.com/index/harness-engineering/) gives a useful coding-specific example: isolated worktrees, application and observability interfaces the agent can inspect, repository-local plans, mechanical architecture checks, and repeated review loops. It is a first-party account from one team, not a neutral benchmark. Its broader lesson is sound: important state, rules, and feedback must be legible to the agent and enforceable by software.

### 2.4 Protocols standardize interfaces, not trust

Protocols are becoming part of the harness layer. The current GA core revision is [MCP 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28). It is a material break from 2025-era assumptions:

- the core protocol is stateless: `initialize`, protocol-level sessions, and the `Mcp-Session-Id` header are gone for modern clients and servers;
- every request carries protocol version and client capabilities in `_meta`; optional `clientInfo` is self-reported implementation metadata for display and debugging, not authenticated identity. Obtain principal and client identity from the transport or OAuth context. Servers must implement `server/discover` for supported versions and capabilities;
- servers that need cross-request state mint explicit handles and receive them back as ordinary arguments;
- `subscriptions/listen` replaces the old HTTP GET and resource-subscription path for opted-in change notifications;
- Roots, Sampling, Logging, HTTP+SSE, and OAuth Dynamic Client Registration remain usable but are deprecated. New implementations should avoid them, and existing ones should follow the documented migration paths. The core feature lifecycle is Active → Deprecated → Removed: deprecation makes a feature eligible, not certain, to be removed after at least twelve months; expedited security removal still requires at least 90 days. Extensions follow a separate SEP-based lifecycle ([MCP changelog](https://modelcontextprotocol.io/specification/2026-07-28/changelog); [feature lifecycle](https://modelcontextprotocol.io/community/feature-lifecycle)).

Backward compatibility is now an explicit engineering choice. A dual-era client probes the server and should cache its era for the server-process lifetime under stdio or per origin under HTTP. A server selects modern behavior for requests carrying per-request metadata and legacy behavior when opened with `initialize`; it may serve both eras concurrently on one endpoint or process ([backward compatibility](https://modelcontextprotocol.io/specification/2026-07-28/basic/versioning#backward-compatibility-with-initialization-based-versions)). “Supports MCP” is therefore incomplete without the protocol version, extensions, transport, and compatibility policy.

Long-running work moved out of the core protocol into the official [MCP Tasks extension](https://modelcontextprotocol.io/extensions/tasks/overview), negotiated as `io.modelcontextprotocol/tasks` through `capabilities.extensions`. A server can return a durable task handle with a TTL, polling interval, and status (`working`, `input_required`, `completed`, `failed`, or `cancelled`). Clients poll with `tasks/get`, can provide mid-flight input through `tasks/update`, and can request cancellation. Cancellation is cooperative: acknowledgement does not prove that work stopped or reverse effects already committed. Persist task IDs; bind each handle to the authenticated principal and original authorization context; detect orphaned tasks; and define expiry, idempotency, compensation, and incident logging. Tasks is official through SEP-2663, but its repository and specification remain marked experimental/draft with no tagged release; pin a commit until one exists.

Extensions widen the boundary further. Third-party extension IDs use a reverse-DNS vendor prefix; official extensions use `io.modelcontextprotocol`. [MCP Apps](https://modelcontextprotocol.io/extensions/apps/overview), extension ID `io.modelcontextprotocol/ui`, has a dated 2026-01-26 specification and can return interactive HTML and JavaScript for rendering inside a host-controlled sandboxed iframe. The app may request tool calls and other host capabilities over a `postMessage` bridge. Treat the app, its resource origins, its messages, and its requested permissions as an active application surface. The sandbox is only as strong as the host's iframe flags, content-security policy, message validation, tool-call proxy, and permission enforcement.

Authorization is related but separate. MCP's HTTP authorization profile is optional and based on OAuth 2.1; stdio servers should normally receive credentials from their environment instead. Client ID Metadata Documents are preferred for client registration, Dynamic Client Registration remains supported but deprecated, and OIDC discovery is a fallback when OAuth authorization-server metadata is unavailable ([authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization)).

The 2026 revision adds stronger issuer, resource, audience, scope-challenge, and step-up rules. Official extensions cover [machine-to-machine client credentials](https://modelcontextprotocol.io/extensions/auth/oauth-client-credentials) and [enterprise-managed authorization](https://modelcontextprotocol.io/extensions/auth/enterprise-managed-authorization).

As of 10 August, the canonical [`ext-auth` repository](https://github.com/modelcontextprotocol/ext-auth) marks Enterprise-Managed Authorization stable at `2026-06-01` and OAuth Client Credentials draft; client support varies and neither extension is active by default. Pin the dated specification or a reviewed commit and negotiate support explicitly. These extensions establish who may reach an MCP server and with which scopes. They do not decide whether a particular model-proposed action is valid for the current task, state, destination, or consequence. That action-level decision still belongs in the host or downstream service.

The [Agent2Agent protocol](https://github.com/a2aproject/A2A) similarly standardizes discovery and task exchange between otherwise opaque agent applications. Its current stable protocol specification is 1.0.0; the latest repository release is v1.0.1, which contains specification bug fixes. A2A 1.0 separates a protocol-neutral data model and operations from JSON-RPC, gRPC, and HTTP+JSON bindings. Neither protocol establishes that a server, tool description, returned resource, remote agent, or requested scope is trustworthy. A host still has to decide:

- which server or agent identity it trusts;
- which user and task an action is on behalf of;
- what data may cross the boundary;
- which scopes, state handles, tools, and destinations are allowed;
- whether tool-list or schema changes require review;
- how results are validated and attributed;
- what happens when a remote party times out, lies, changes version, or continues after cancellation.

The MCP project's [security guidance](https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices) explicitly warns about confused-deputy attacks, token passthrough, SSRF, state-handle hijacking, compromised local servers, unsafe authorization URLs, mix-up attacks, and over-broad scopes. The protocol is plumbing. Consent, identity, action authorization, isolation, and audit remain system responsibilities.

Discovery is not provenance. The official [MCP Registry](https://modelcontextprotocol.io/registry/about) remains in preview. It verifies namespace ownership and hosts metadata, but delegates code scanning and relies on downstream aggregators for curation. Pin server versions or digests, isolate installation and startup, review dependency and permission changes, validate schema drift, and broker cross-server data flows. Tool output from Server A remains untrusted input when code or the model passes it to Server B.

### 2.5 A minimum production control loop

The smallest useful production loop is not “prompt, tool, repeat.” It separates proposal from authority and outcome:

```text
load canonical state → construct authorized context → propose action
→ validate and authorize → execute idempotently → verify outcome
→ record state and evidence → continue, compensate, escalate, or stop
```

Read-only, low-consequence tasks may collapse several stages. A system that can make external changes should preserve these invariants:

| Invariant | Required mechanism |
|---|---|
| **No effect without a valid authority chain** | Acting identity, principal, task, scopes, policy decision, and any approval are bound to the proposed action. |
| **No approval survives a changed action or replay** | Bind a short-lived, single-use approval to the effect digest, actor, tenant, destination, state and policy version, and preconditions; validate and consume it atomically with the effect or outbox record. |
| **No blind retry of a possible effect** | Repeat an identical request under the same idempotency key only when a defined deduplication contract exists; resolve unknown outcomes before issuing a new semantic proposal under a new key. |
| **No success claim without outcome evidence** | Verify the intended result against canonical or independently observed state, not only a `200`, a model statement, or artifact existence. |
| **No durable task without ownership and recovery** | Persist state, deadlines, cancellation, leases or heartbeats, parent/child links, and the allowed resume or compensation path. |
| **No durable memory without lifecycle controls** | Define namespace, write admission, provenance, read authorization, freshness, correction, expiry, and deletion. |
| **No investigation from transcript alone** | Link task, run, proposal, policy decision, effect receipt, verification, state change, and component versions. |

This is an operating contract, not a required product architecture. The database, queue, policy engine, workflow runtime, and telemetry stack may vary. The observable invariants should not.

---

## 3. What the evidence actually shows

The evidence now supports three conclusions:

1. **Harness changes can move agent scores by double digits.**
2. **The model–harness interaction can change model ordering, but small sign reversals need paired uncertainty before they are treated as established rank changes.**
3. **Equal aggregate scores can conceal different task-level failures.**

The evidence does **not** yet support a general constant such as “the harness matters eight times more than the model.” The 7.8× figure is a descriptive ratio for one selected grid: GPT-5.4, Kimi K2.6, and GLM-5.1 were chosen because their coding-leaderboard scores were tightly clustered, while the three harnesses were deliberately ordered as nested improvements. That design helps isolate harness variation but also narrows the model denominator and widens the harness contrast. It has no automatic population interpretation.

### 3.1 Stronger evidence: controlled or paired comparisons

| Source and design | Result | What it supports | Important limit |
|---|---|---|---|
| **[Zhang et al. (2026)](https://arxiv.org/abs/2605.23950)** — GPT-5.4, Kimi K2.6, and GLM-5.1 called through official APIs × three nested harnesses; 100 SWE-bench Verified tasks; two runs per cell | Within a model, harness range **8.5–13.0pp**. Within a harness, model range **2.5–5.0pp**. Mean harness-axis variance was **18.48 pp²** versus model-axis variance of **2.37 pp²**, a descriptive ratio of **7.80**. The authors counted raw ranking-sign reversals in **six of nine** model-pair × harness-pair comparisons. | Harness effects and interactions can exceed model differences in this deliberately matched slice. | Position paper and small factorial. Models were selected for similar prior coding scores; harnesses were ordered incremental variants. The ratio uses nine cell means, each averaging two runs, and has no confidence interval or population interpretation. Four reversal comparisons involve a model margin of only 0.5–2.0 points; individual paired intervals were not reported. |
| **[Harness evolution study (2026)](https://arxiv.org/abs/2607.03691)** — fixed Qwen3-Next-80B-A3B-Instruct across 35 sequential Qwen Code CLI releases; 50 stratified SWE-bench Verified tasks; two runs per release–task cell | Resolve rate showed **no statistically significant upward trend** across releases. Token use rose significantly—about **71%** from the first nine releases to the latest—and tool-call counts varied upward overall, with substantial intermediate-version variation. Failed runs used roughly **2.7×** the tokens and **1.8×** the tool calls of successful runs. | A harness is versioned software: newer is not necessarily better, and efficiency can regress while top-line accuracy looks flat. | July preprint; one model, one harness lineage, 50 tasks, 600-second timeout. Whole releases changed, so individual component effects are not identified; longer failure loops may cause resource use rather than result from it. |
| **[Scaffold Effects on GAIA (2026)](https://arxiv.org/abs/2606.08529)** — three scaffold bundles × five models from three providers; three attempts per question; bootstrap intervals and mixed-effects tests | For Opus Level 2, the max–min scaffold gap was **14pp in the primary slice** and **28pp in the robust slice** that removed provider-serialization-bug flags. The scaffold×model interaction was significant in the primary, robust, and common-question intersection analyses. | Scaffold effects transfer beyond coding, and model family can condition the result. | Only **5,907/6,255** planned runs completed; 15/30 cells were partial. The ReAct baseline had a different tool surface, GAIA validation answers are public, and the held-out test submission was not run. The common-question intersection retained **132/139** Level 1–2 validation sample IDs—52/53 Level 1 and 80/86 Level 2—for which every model–scaffold cell had at least one attempt complete without an Inspect-level error. It reduces question-set asymmetry but does not eliminate run-level missingness or the scaffold/tool-surface confound. Treat 28pp as a sensitivity estimate of a composite scaffold-plus-tool contrast. |
| **[AgencyBench (2026)](https://arxiv.org/abs/2601.11044)** — six models run on ten representative scenarios with a custom scaffold, Claude Agent SDK, and OpenAI Agents SDK | Claude 4.5 Opus's average rubric score rose **20.5 points** on Claude Agent SDK versus the custom scaffold; Kimi K2 Thinking's fell **12.8 points** on OpenAI Agents SDK. | Native ecosystem fit and interface conventions can matter. | Ten-scenario ablation from a larger suite of 32 scenarios and 138 tasks; SDK choice changes several things at once. Automated rubric, text, and vision judges add measurement uncertainty, and repeated-trial intervals were not reported. |
| **[CORE-Bench case study (2026)](https://arxiv.org/abs/2606.26158)** — corrected 39-task CORE-Bench v1.1; same model on CORE-Agent and OpenCode | Claude Opus 4.5 scored **82.1% on both**—32/39 tasks each—yet the systems disagreed on **12/39 tasks (31%)**, so six tasks were unique to each scaffold. | A top-line score can hide different failure sets. | Descriptive result on one fixed, corrected benchmark; no general harness-effect or task-population claim follows. |
| **[Screenshots or Tools? (2026)](https://arxiv.org/abs/2608.03327)** — paired Qwen3-VL-8B reasoning and non-reasoning models under one GUI–MCP harness on 309 OSWorld-MCP tasks; five runs per condition | Adding the same MCP tools moved mean accuracy **+4.0pp** for the reasoning model and **−5.9pp** for the non-reasoning model, both beyond two reported standard errors. The reasoning model still called a tool on only 55/309 tasks. | Interface value depends on whether the model selects and integrates the added capability; exposing a tool is not the same as eliciting it. | August preprint on one model family and one hybrid benchmark. The authors' later RL probe changed tool adoption without improving held-out competence, so invocation rate alone is not the target. |

### 3.2 Useful but weaker signals

| Source | Observation | Why to be cautious |
|---|---|---|
| **[Skill-Use](https://arxiv.org/abs/2608.04828)** | Across 79 real skill documents and 177 sandboxed tasks, the strongest of eight models under two harnesses reached **0.613** on a metric that gates procedural compliance and boundary adherence on first retrieving the relevant skill. Scores and rankings shifted between Claude Code and Codex. | August preprint with a curated, skill-dependent task set and a trajectory rubric partly built with model judges. It supports testing trigger, compliance, and restraint separately—not treating skill installation as capability. |
| **[Holistic Agent Leaderboard](https://arxiv.org/abs/2510.11977)** | On its 50-task SWE-bench Verified Mini slice, o4-mini (high) scored **50% with SWE-agent and 2% with its Generalist scaffold**; GPT-5 (medium) scored **46% and 12%** respectively. | One run per model–scaffold pair; only 50 tasks; complete systems differ in prompts, tools, policy, and model-interface handling. This is a matched model/task-set system comparison, not a controlled harness effect. |
| **[PolyWorkBench](https://arxiv.org/abs/2607.06008)** | Claude Opus 4.8 recorded **0.921 Pass@1 with ClaudeCode** and **0.712 with OpenClaw** over 67 tasks. Here Pass@1 is the mean partial-credit Grade from one realization per configuration, not the fraction of tasks passed. | A sparse matched-system comparison with unequal repeat coverage: three available runs for ClaudeCode and one for OpenClaw, but each reported Pass@1 uses one run. Harnesses may also use different budgets and model-specific features; no confidence intervals were reported. |
| **[Vercel's d0 case study](https://vercel.com/blog/we-removed-80-percent-of-our-agents-tools)** | A text-to-SQL agent moved from 17 specialized tools to two broad tools. On five internal queries, success went from **4/5 to 5/5**, with lower latency, tokens, and steps. | Five queries are a product anecdote, not a benchmark. The change also replaced custom abstractions with a filesystem and better model-readable documentation. |
| **[Pimpale et al. (2025)](https://arxiv.org/abs/2502.15850)** | Their simple scaffold scored about **33%** with Claude Sonnet 3.5 on SWE-bench Verified; the best public score they found for the same model was **62.2%**. | The two systems were not run as a controlled matched pair. “High elicitation” included public benchmark-specific optimization and potentially more inference compute. |

### 3.3 What not to conclude

**Not: “Harnesses always matter more than models.”** Sometimes a model upgrade dominates. Sometimes the task is simple enough that the harness barely matters. Sometimes a scaffold built for one family harms another.

**Not: “Every benchmark score is a lower bound.”** Weak elicitation can understate attainable performance. But benchmark-specific tuning, retries, test leakage, permissive graders, and best-of-*k* selection can overstate general capability. A score is a **conditional estimate**, not automatically a conservative one.

**Not: “A locked harness is neutral.”** Applying identical software removes one source of variation, but it may advantage models whose training or API conventions fit that software. A locked harness answers a useful, narrower question: *Which model works best in this specified harness?*

**Not: “The best harness transfers.”** The interaction term is precisely the warning that it may not.

**The durable conclusion:** model rankings are properties of an evaluation configuration. Publish the configuration.

---

## 4. What reliably matters in practice

The research is young. Several independent sources nevertheless point to a practical order for building and testing these systems.

### 4.1 Build the evaluation before the ornamentation

Start with representative tasks from the real workflow. Include ordinary cases, hard cases, partial failures, and adversarial inputs. Give each task a verifiable outcome where possible. Keep a held-out set for changes to prompts, tools, and orchestration.

Without this, harness engineering becomes anecdote-driven patching. Every new branch feels helpful because it was invented in response to a failure. The system grows; generalization does not necessarily improve.

### 4.2 Start with the smallest loop that can work

A model, a few well-designed tools, environmental feedback, a bounded loop, and a clear stop condition are enough for many agents. Add routing, sub-agents, critics, or planning phases only when a measured failure mode justifies them.

This is the common thread between Anthropic's [*Building Effective Agents*](https://www.anthropic.com/research/building-effective-agents) and Vercel's d0 case: complexity is a cost, not evidence of maturity.

### 4.3 Design tools as interfaces for a stochastic caller

A tool is not just an API endpoint. Its name, description, input schema, output format, and error response all enter the model's decision environment.

For consequential operations, prefer a two-stage contract: **preview** the exact effect, then **commit** it under a policy decision or approval token. Separate read tools from write tools. Make authority visible in the tool name and schema rather than burying it in prose.

Good tools tend to be:

- **Distinct:** little overlap or ambiguity about which tool to call.
- **Task-shaped:** one meaningful workflow may be better than five thin API wrappers.
- **Context-efficient:** return the relevant fields, not an entire database object.
- **Strict at the boundary:** validate parameters deterministically.
- **Helpful on failure:** return the cause, what was and was not changed, and the next valid action.
- **Discoverable:** load or search for tool definitions on demand when the catalog is large.

A useful result envelope makes uncertainty explicit:

```yaml
status: succeeded | failed | partial | unknown
changed: true | false | unknown
effect_id: "stable id for deduplication and audit"
artifacts: []
observed_state: {}
error_code: "machine-readable"
retryable: false
next_valid_actions: []
```

The exact schema will differ. The important distinction is between *the request was rejected*, *the request failed before any effect*, *the effect happened*, and *the caller cannot tell*. Those states require different recovery policies.

Anthropic reports that tool descriptions, namespacing, response shape, and error messages measurably affected its internal evaluations; it recommends evaluating these choices rather than treating them as cosmetic ([Aizawa et al., 2025](https://www.anthropic.com/engineering/writing-tools-for-agents)).

“Fewer tools” is not the rule. **Less irrelevant choice in context** is the rule. When a system genuinely needs hundreds of operations, progressive disclosure or code-based tool composition can be better than placing every schema in the prompt. Anthropic's MCP case study reduced an illustrative 150,000-token tool catalog to 2,000 tokens by loading definitions on demand; that is an architecture example, not a universal performance estimate ([Jones & Kelly, 2025](https://www.anthropic.com/engineering/code-execution-with-mcp)).

### 4.4 Keep canonical state outside the transcript

The chat history is not a database. Long contexts remain sensitive to distractors, semantic similarity, position, and irrelevant material even within advertised limits ([Chroma, 2025](https://research.trychroma.com/context-rot); [RULER, 2024](https://arxiv.org/abs/2404.06654)).

Treat context as a generated view over several information classes:

| Class | Purpose | Main control |
|---|---|---|
| **Instructions and policy** | Define goals, prohibitions, and escalation | version, priority, provenance |
| **Canonical task state** | Requirements, plan, decisions, outstanding work | structured store and state transitions |
| **Evidence** | Files, records, search results, tool outputs | source, timestamp, confidence, expiry |
| **Working material** | Scratch calculations, drafts, temporary summaries | bounded lifetime; safe to discard |
| **Durable memory** | Facts intended to influence later runs | write gate, provenance, review, deletion policy |
| **Examples and skills** | Reusable procedures or demonstrations | applicability tests, versioning, evaluation |

Do not collapse the model-visible prompt, transient working state, thread checkpoint, immutable artifact store, and cross-thread or user memory into one “memory” feature. For every durable store, define namespace and tenant scope, write admission, read-time authorization, provenance or taint, retrieval policy, TTL and invalidation, correction and deletion, encryption, schema migration, and recovery. Inventory derived and external copies too: provider-side retention and prompt caches, embedding or vector indexes, workflow checkpoints, backups, child-service copies, and telemetry. Record the controller, tenant, retention and deletion SLA, legal-hold behavior, and how corrections or tombstones propagate. Where deletion is impossible, minimize raw content, bound retention, and document rebuild procedures. Reusing old state under a new task or authority envelope may require fresh authorization ([NIST SP 800-53 SI-12](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)).

For long-running work:

- keep the task, requirements, plan, decisions, and completed actions in structured state;
- checkpoint before risky changes;
- attach provenance and freshness to retrieved facts;
- test compaction and handoff logic as carefully as any other transformation;
- separate durable memory from transient working notes;
- let sub-agents return small artifacts, not entire transcripts.

Retrieval has both false positives and false negatives. Compaction is a lossy transformation. Memory writes create a future instruction surface. Test all three with seeded requirements, contradictory sources, stale facts, and malicious content—not only with average-case recall questions.

An August preprint, [*LongHorizon-Harness*](https://arxiv.org/abs/2608.01964), operationalizes this boundary as a Manage–Execute–Audit loop: a manager keeps explicit task state, fresh-context executors act on one subtask, and a read-only auditor admits only environment-verified facts back into state. The authors report gains across WeaveBench, Terminal-Bench 2.1, and OSWorld 2.0 with Qwen3.7-Plus, plus a smaller Opus 4.7 OSWorld subset. It is evidence for testing explicit state and external verification, not proof that this three-role decomposition or its reported gains will transfer to a different budget, model, or environment.

Anthropic's [context-engineering guidance](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) describes progressive disclosure, just-in-time retrieval, compaction, structured note-taking, and sub-agents as different ways to manage a finite attention budget. That is useful vendor practice, not evidence that one policy transfers across models and domains. **More context is not automatically better context.**

### 4.5 Close the loop with evidence

Verification should match the task:

- tests, type checks, and linters for code;
- reconciliations and invariants for data;
- source retrieval and quotation checks for research;
- schema validation for structured output;
- simulation, canaries, or dry runs before deployment;
- human review where correctness is partly judgment or consequences are high.

Prefer checks that are independent of the generator. An LLM judging its own output can help, but it shares blind spots and may rationalize errors. Deterministic checks are not always available; independence is a gradient, not a switch.

### 4.6 Make recovery bounded and informative

A semantic retry with the same state is often just another draw from the same failure mode. Change the proposal only when something material changes: a clearer error, a narrower action, a refreshed observation, a different tool, or human guidance. A transient transport or worker failure is different: repeat the identical request under the same key only when the operation or service has a defined idempotency contract.

Set explicit ceilings on steps, spend, recursion, repeated failures, and wall-clock time. Make recovery possible: use rollback only for effects that are genuinely reversible, and compensation or manual repair for the rest. Escalation is a successful control action when the system is outside its competence.

Turn recovery into a policy matrix rather than a generic “retry” branch. Distinguish provider and protocol failures, tool errors, policy denials, hangs, worker loss, partial or unknown external effects, invalid state, and exhausted budgets. For each class, define retry eligibility, attempt and overall timeouts, backoff and jitter, heartbeat or progress rules, fallback, compensation, escalation, dead-letter or manual repair, and whether the run can safely resume.

Stopping also needs its own evaluation. [*AgentAbstain*](https://arxiv.org/abs/2607.10059) pairs 263 should-act and should-abstain tasks across 42 executable environments. Across 17 models using four native harnesses, the best reported model/framework configuration reached **59.5% paired accuracy**—both members of a pair correct—and the authors observed *post-hoc abstention*: the agent recognized a problem only after taking the irreversible action. This is a July preprint with one run per model and models not fully crossed over frameworks, so it is not a clean model or harness ranking. Its design lesson is stronger than its leaderboard: test matched act/abstain pairs, and place verification before commit-class actions rather than accepting a verbal apology afterwards.

### 4.7 Instrument decisions, not just tokens

Production traces should let an operator reconstruct not only what the model said, but what the system believed, authorized, and changed. A practical trace hierarchy is:

```text
task → run → attempt → model step → tool proposal → policy decision → effect → verification
```

Record stable identifiers, component versions, timestamps, token and cost data, state hashes or diffs, approval events, external effect IDs, and verifier results. Record metadata, hashes, diffs, receipts, and classification labels by default; capture raw prompts, tool arguments, and results only under an explicit opt-in policy with redaction, access control, and scoped retention. Preserve the causal links between them. Logs without correlation IDs become archaeology; model transcripts without effect receipts cannot establish what happened.

Observability has its own attack surface. Prompts and tool results may contain secrets, personal data, copyrighted material, or hostile payloads. Apply access controls, retention limits, redaction, integrity protection, and separation between the agent and the logs used to investigate it. The agent should not be able to silently rewrite its own audit trail.

In 2026 the [OpenTelemetry GenAI semantic conventions](https://github.com/open-telemetry/semantic-conventions-genai) moved into a dedicated repository and remain in **Development** status. They now define candidate spans for agent creation and invocation, workflows, planning, tool execution, and MCP; MCP trace context can propagate through `params._meta` using W3C `traceparent`, `tracestate`, and `baggage`. Use that work as a portability layer, not as a finished audit schema: pin the convention version or commit, keep a translation boundary around it, and expect field changes. Prompts, tool arguments, results, and system instructions are opt-in partly because they may contain sensitive data. `gen_ai.agent.id` identifies an agent resource, not a run or attempt; keep task, run, attempt, effect, and approval IDs in the application namespace and use `gen_ai.operation.name` for the logical operation. A shared trace shape still does not establish authorization, policy compliance, or the truth of an effect.

### 4.8 Measure the system you plan to operate

Accuracy alone is not enough. Track:

- task success and partial success;
- cost, tokens, latency, and tool-call count;
- variance across runs;
- human interventions and time to review;
- recovery rate after injected failures;
- unsafe or unauthorized action attempts;
- failure categories, not just the average;
- performance after model, prompt, tool, and dependency updates.

The best system is usually a point on a Pareto frontier, not the highest number in one column.

### 4.9 Automated harness design is becoming its own research area

A growing line of work searches over the control layer rather than adjusting it by hand. [Automated Design of Agentic Systems](https://arxiv.org/abs/2408.08435) used a meta-agent to discover multi-agent systems.

More recent preprints include [Meta-Harness](https://arxiv.org/abs/2603.28052), [AutoHarness](https://arxiv.org/abs/2603.03329), and [Agentic Harness Engineering](https://arxiv.org/abs/2604.25850), which optimize or synthesize context, tools, orchestration, and recovery logic.

[MemoHarness](https://arxiv.org/abs/2607.14159) adds an adaptive layer: it stores case diagnoses and reusable patterns, then adjusts six harness dimensions for a new case using retrieved experience. Its reported gains are promising, but the experience store is now both an optimizer and a persistent instruction surface. Transfer, poisoning, deletion, and test-set exposure have to be evaluated together.

The opportunity is real: harness design is a search problem, so automation can explore more combinations than a person can. The risk is equally ordinary: **benchmark overfitting**. Once an optimizer repeatedly observes results on a task set, that set is training data for the harness even if the model weights never change.

Treat automated harness search like any other model-selection process:

- separate search, validation, and untouched test tasks;
- test transfer to new repositories, domains, and model families;
- compare against simple and budget-matched baselines;
- count the total search cost, not only the final run;
- publish failed variants and the selection rule;
- evaluate safety and permission use on held-out adversarial tasks.

A July preprint tested this concern directly on Terminal-Bench 2.1. [*Rethinking the Evaluation of Harness Evolution for Agents*](https://arxiv.org/abs/2607.12227) compared automatic harness evolution with parallel sampling and sequential refinement under a common five-round budget. On a disjoint **45-task search / 10-task validation / 34-task test** split, the evolved harness improved held-out performance by only **0.6pp on average** across Claude Opus 4.6 and GPT-5.4; it also failed to consistently beat the simpler test-time scaling baselines. This is one benchmark and one implementation, not a verdict on the whole research program. It does demonstrate why same-task optimization gains, unmatched compute, and missing held-out transfer tests are not adequate evidence of reusable harness improvement.

An evolved harness is evidence of what search found on its objective. Generalization remains a separate claim.

---

## 5. How to evaluate and report a harness

Different evaluation designs answer different questions. Problems begin when one design is used and a broader conclusion is claimed.

| Protocol | Design | Honest conclusion |
|---|---|---|
| **Locked harness** | One versioned harness, budget, and environment for every model | “Model A performed best in harness H under budget B.” |
| **Native / best-effort system** | Each model gets its preferred or optimized harness | “This deployable model–harness package performed best under our rules.” Not a model-only ranking. |
| **Factorial** | Run multiple models across multiple harnesses | Estimates model effects, harness effects, and interactions within the sampled grid. |
| **Component ablation** | Add or remove one component while holding the rest fixed | Tests whether that component is load-bearing in this configuration. |
| **Budget frontier** | Compare systems at matched or varying cost, tokens, latency, and attempts | Shows which configuration is efficient for an operating constraint. |

### 5.1 Define the estimand before running the benchmark

“Harness effect” can mean several different quantities:

- the difference between two named harnesses on a fixed task set and model;
- the average effect of adding one component to a defined baseline;
- the variance across a specified collection of harnesses;
- the expected gain from optimizing a harness under a search budget;
- the deployment gain on future tasks, users, and environments.

Only the first two are naturally identified by a simple paired comparison. The others require a sampling story or stronger assumptions. If researchers hand-pick three deliberately nested harnesses, variance across those three describes that grid. It does not estimate variance across an undefined population of all possible harnesses.

Name the estimand accordingly. “The mean paired difference between H1 and H2 on these 100 tasks, with one attempt and a 50-step cap” is a finite-benchmark conditional contrast. “Expected deployment gain on future repositories” is a population claim and needs evidence about how repositories, tasks, models, harnesses, and operating conditions were sampled.

### 5.2 Factorials need interaction terms

For task $t$, model $m$, harness $h$, and repeated run $r$, a useful starting model is:

$$
g\!\left(\mathbb{E}[Y_{tmhr}]\right)
= \mu + \alpha_m + \beta_h + \gamma_{mh} + u_t
$$

where $g$ is an appropriate link function, $\alpha_m$ is the model effect, $\beta_h$ the harness effect, $\gamma_{mh}$ their interaction, and $u_t$ task difficulty. Repeated runs reveal the remaining trajectory-level variation around that conditional mean. For binary success, a logistic mixed model is often more natural than an ordinary linear model; a linear probability model may still be useful descriptively.

The interaction is load-bearing. If it is large, averaging over harnesses can produce a model ranking that applies to none of the individual harnesses. Report cell means and per-task outcomes before presenting a pooled main effect.

Decide which terms are **fixed** and which are **random**. Named frontier models and named harnesses are usually fixed treatments: inference should stay within the tested grid. Tasks may be treated as a sample from a target distribution if the sampling process supports that claim. Repositories, websites, or scenario families can induce clusters; pretending every task is independent makes intervals too narrow.

### 5.3 Pair tasks and represent stochasticity honestly

When two configurations run on the same tasks, analyze the paired outcomes. For binary success, report the counts that move pass→fail and fail→pass; McNemar's test or a paired/cluster bootstrap can quantify the difference. For continuous or partial rewards, bootstrap paired task-level differences. If tasks share a repository or scenario template, resample at that cluster level.

Repeated agent runs answer a different question from more tasks. Additional tasks reduce uncertainty about the task distribution; additional trajectories estimate run-to-run variation and rare failure modes. A sound design often needs both. A hierarchical bootstrap or mixed-effects model can represent tasks and repeated trajectories separately.

When comparing cells, use the same prespecified attempt schedule where feasible. Randomize or interleave run order so provider drift, outages, and environment changes do not line up with one treatment. Report between-task uncertainty, within-task rollout variation, and provider/date effects separately rather than treating an uneven mix of one-run and three-run means as commensurable.

Nominal temperature zero does not make a hosted agent deterministic. Serving infrastructure, tool timing, changing external state, hidden sampling, and concurrent events can all vary. Publish seeds where they are meaningful, but do not imply that a seed controls the full system.

### 5.4 Budgets and retries are part of the treatment

Keep these quantities separate:

- **pass@1:** success on one specified attempt;
- **pass@*k*:** probability that at least one of *k* sampled attempts succeeds under the stated sampling assumptions;
- **best-of-*k*:** a selector or grader chooses among *k* outputs;
- **interactive retry:** a later attempt receives failure evidence or changed state;
- **parallel search:** several agents explore and a coordinator combines their work.

They consume different resources and create different failure surfaces. An interactive retry is not an independent sample, and best-of-*k* is only as trustworthy as its selector. Report the entire success–cost curve where possible: task success against tokens, dollars, wall-clock time, model calls, tool calls, and human review minutes. Include p50 and tail latency, not only the mean.

A useful operating quantity is expected cost per successful task, but even that is incomplete when failures impose remediation, security, or opportunity costs. A system that is cheap on average but occasionally loops for hours may be the wrong production choice.

### 5.5 Graders are components with error rates

A grader can create both false positives and false negatives. Exact tests may reward narrow compliance while missing the intended outcome. Model graders can be sensitive to prompt wording, ordering, verbosity, or knowledge of the generating model. Human review can drift between raters.

Therefore:

- version the grader, reference data, and test environment;
- blind graders to model or harness identity where feasible;
- audit a stratified sample of passes, failures, and disagreements;
- use independent double adjudication or a deterministic cross-check on a prespecified sample when the grader is consequential;
- report inter-rater agreement for judgment-based labels;
- keep the agent away from hidden tests, answer keys, and grader credentials;
- distinguish invalid tasks and infrastructure failures from agent failures without silently dropping them;
- preserve the as-scored result and, after any correction, report an adjudicated-valid-task result and a sensitivity analysis showing what changed.

[Biderman et al. (2024)](https://arxiv.org/abs/2405.14782) document how implementation details, prompt formats, answer extraction, model access, and changing conventions undermine reproducible LM evaluation. Agent evaluation adds stateful environments, tool timing, retries, and side effects to that list.

Benchmark repair can be large enough to change the object being measured. The 2026 CORE-Bench study found **15 task-level errors and 20 tasks with exploitable shortcuts** in the 45-task CORE-Bench Hard set before producing the corrected 39-task v1.1 suite. Treat benchmark and grader maintenance as versioned empirical work, not administrative cleanup.

A July preprint makes the computer-use scorer problem concrete. [*How Benchmarks Mis-Score Computer-Use Agents*](https://arxiv.org/abs/2607.28367) re-adjudicated 150 public trajectories recorded as failures across five benchmarks and classified **15.3%** as wrong verdicts—10.7% evaluator false negatives and 4.7% broken tasks—with a 95% Wilson interval of 10.4–22.0%. Another 3.3% were unclear from the released evidence. The sample contains only recorded failures, so it estimates neither false positives among passes nor benchmark-wide error rates; per-benchmark samples were 23–57. The operating lesson is still direct: audit both pass and fail verdicts, preserve screenshot- and state-complete trajectories, and report task, environment, scorer, and agent failures separately.

### 5.6 Minimum statistical hygiene

Where feasible:

- publish the target population, task subset, and selection rule;
- run repeated trials or explain why only one was possible;
- report confidence intervals and paired per-task comparisons;
- disclose all tested variants, or clearly label post-selection results;
- disclose task or answer exposure, benchmark-specific tuning, internet retrieval opportunities, exclusion timing, and whether the final estimate used an untouched holdout;
- correct or qualify inference after many models, harnesses, metrics, or ablations are tried;
- report failures, timeouts, refusals, exclusions, and grader errors;
- test important external-validity axes—repository, domain, language, task age, difficulty, model family, and harness family—using leave-group- or time-block-out designs where possible;
- pin model snapshots, container images, prompts, tool versions, and code commits;
- record the evaluation date for provider-hosted models that can change behind an alias.

### The Harness Card

Zhang et al. propose a structured **Harness Card**. The exact format matters less than the discipline: another team should be able to understand what ran, what it could touch, how much it spent, and how it was judged.

At minimum, report:

1. **Question:** What is being compared — models, deployable systems, or harness components?
2. **Model configuration:** exact endpoint or weights, date, settings, system prompt, reasoning budget.
3. **ETCSOVG:** execution, tools, context, scheduling, observability, verification, governance.
4. **Environment:** task image, available data, network, credentials, dependencies.
5. **Budget:** steps, time, tokens, retries, parallel agents, money.
6. **Evaluation:** task version, sample, grader, attempts, aggregation, uncertainty.
7. **Reproducibility:** harness code or artifact, version, logs, known deviations.
8. **Safety:** trust boundaries, approval points, containment, and incidents.

A copyable template is in Appendix B.

---

## 6. Elicitation, reproducibility, and safety cases

An evaluation harness is a measurement instrument. It does not reveal a model's context-free “true capability.” It estimates what a defined system can do under defined conditions.

Apollo Research uses **the evals gap** for the broader gap between what evaluations measure and what we need to know about deployed systems. Proper elicitation is one part of that gap; task validity, scoring, realism, and interpretation are others ([Apollo Research, 2025](https://www.apolloresearch.ai/science/the-evals-gap)). METR likewise treats agent results as conditioned on its agent scaffold and notes that elicitation is difficult; it does not claim to know a model's maximum attainable performance ([METR, 2025](https://arxiv.org/abs/2503.14499)).

### Capability evaluation

For ordinary capability benchmarking, the fix is transparency and experimental design:

- publish the harness;
- distinguish locked-harness from optimized-system results;
- use factorials or ablations when making causal claims;
- hold out tasks when optimizing prompts or scaffolds;
- compare at matched budgets;
- report the model–harness interaction rather than averaging it away.

### Dangerous-capability evaluation

For safety, the question is not simply “What score did the model get?” It is:

> **Against which elicitation effort, tools, permissions, compute budget, fine-tuning access, and adversary class is this result informative?**

A weak harness can miss dangerous capability. A benchmark-specific exploit or permissive grader can also produce misleadingly high scores. Safety cases should therefore state:

- the threat model and reference adversary;
- elicitation resources and techniques tried;
- whether weights, fine-tuning, scaffolding, or only API prompting were available;
- model and harness uncertainty separately;
- margins to the decision threshold;
- what future evidence would trigger re-evaluation.

For open weights, no finite evaluation can cover every future scaffold, fine-tune, or tool environment. That does not make evaluation useless. It makes the adversary model and update process part of the claim. The [International AI Safety Report 2026](https://internationalaisafetyreport.org/publication/international-ai-safety-report-2026) makes the broader point: no single benchmark or evaluation method is sufficient for general-purpose systems, and end-to-end tests must be read alongside component evidence and deployment context.

### Reproducibility

Omitting the harness is increasingly like omitting part of the experimental apparatus. But publishing code alone is not enough. Hosted model aliases move; sandbox images change; tools call mutable services; benchmark patches change graders. Reproducibility now requires a versioned **system bundle**, or at least an audit trail detailed enough to reconstruct one.

---

## 7. Failure modes and the safety surface

The harness is both capability infrastructure and security infrastructure. The same change can improve task completion and enlarge the blast radius.

### 7.1 Threat-model the authority path

Model capability and system authority are different variables. A model can propose an action; the harness decides whether that proposal becomes an effect. A useful threat review follows four questions:

1. **Exposure:** What untrusted text, code, media, servers, people, and events can influence the run?
2. **Authority:** Which data, credentials, tools, networks, and external effects can the run reach?
3. **Persistence:** What can survive into later steps or runs—files, memory, tokens, scheduled jobs, remote changes?
4. **Containment:** How quickly can operators detect, stop, investigate, revoke, and recover?

The relevant identity chain is usually longer than “user and agent.” It may include the human principal, application host, individual run, tool or MCP server, downstream resource server, model provider, and approver. Preserve the delegating subject separately from the current actor—for example through OAuth token-exchange `sub` and `act` claims—and declare whether each hop is delegation or impersonation ([RFC 8693](https://www.rfc-editor.org/rfc/rfc8693.html)). An action should carry who requested it, on whose behalf it runs, which task and approval authorize it, and which resource and scope it targets.

Do not let one bearer token collapse those identities. Validate token issuer and audience, avoid token passthrough, and mint per-hop short-lived tokens restricted to one resource or audience and the minimum scopes ([RFC 8707](https://www.rfc-editor.org/rfc/rfc8707.html)). Sender-constrain them with DPoP or mTLS where feasible ([RFC 9449](https://www.rfc-editor.org/rfc/rfc9449.html)). Resource servers must authorize each effect; run IDs and approvals are evidence, not credentials. An approval should bind the exact proposed effect—or a narrow class of effects—not grant a vague period of elevated autonomy.

### 7.2 Main failure modes

| Failure | Mechanism | Primary controls |
|---|---|---|
| **Indirect prompt injection** | Instructions arrive through content the agent reads: repository, document, email, webpage, ticket, tool response | mark trust boundaries; minimize authority; isolate untrusted content; validate actions outside the model |
| **Observation or tool-output spoofing** | A stale, compromised, or malicious source reports false state or hides a partial effect | authenticate sources; attach freshness; reconcile against canonical state; treat tool output as untrusted data |
| **Persistent control / memory poisoning** | Malicious content is written into files, memory, skills, or configuration and reactivates later | govern writes; attach provenance; quarantine new memory; scan and review persistent state |
| **Tool misuse / confused deputy** | The model uses a legitimate tool with harmful parameters or on behalf of an untrusted source | scoped tools and credentials; deterministic authorization; approvals for consequential actions |
| **Stale or replayed approval, or race** | The world changes after review, two agents write concurrently, or the same approval is submitted twice | bind approval to effect digest, actor, tenant, parameters, state and policy version, expiry, and preconditions; consume it once atomically with the effect or outbox record; locks or compare-and-swap |
| **State-handle hijacking** | An attacker obtains a server-minted workflow or resource handle and the server treats possession as authority | bind handles to the authenticated principal and tenant; use unguessable, expiring handles; authorize every use |
| **Credential or data exfiltration** | Secrets become visible in context or leave through a tool or network path | secret isolation; short-lived tokens; egress controls; data-flow policy; redaction |
| **Error compounding** | The system keeps acting on a false premise or corrupted state | bounded loops; anomaly detection; checkpointing; compensation or repair; escalation |
| **Resource exhaustion** | Loops, agent swarms, recursive calls, or large tool results consume spend, compute, storage, or human attention | quotas at each layer; rate and fan-out limits; cancellation; circuit breakers |
| **Verification gaming** | The agent satisfies, manipulates, or attacks the grader rather than the intended task | independent checks; hidden tests; environment hardening; monitor grader access |
| **Sandbox or supply-chain escape** | Generated code or dependencies exploit the runtime, proxy, extension, or tool server | hardened ephemeral sandbox; patching; minimal images; network deny-by-default; dependency controls |
| **Multi-agent interference** | Agents duplicate work, amplify a false premise, deadlock, or optimize incompatible goals | clear ownership; isolated workspaces; typed handoffs; bounded delegation; central policy enforcement |

Prompt injection cannot be solved by a stronger system prompt alone. The practical security posture is: **assume some hostile instruction will be interpreted, then limit what that interpretation can cause**.

The attack surface includes ordinary setup instructions, not only text that looks like a jailbreak. A July study tested package-install attacks delivered through README files, requirements files, and Makefiles across **12 scenarios, five attack classes, nine model–harness configurations, four harnesses, and seven models** ([*Setup Complete, Now You Are Compromised*](https://arxiv.org/abs/2607.15143)). The same model sometimes caught an attack under one harness and installed it under another; registry redirection was missed especially often. Security prompts helped on the dimension they named, while a deterministic pre-install gate that checked package name, source, and version blocked most tested cases. The study is small and preprint-stage, but the architectural lesson is sound: treat project instructions and dependency metadata as untrusted input, and put provenance checks before install-time code execution.

### 7.3 Controls that belong outside the model

- **Sandbox execution.** Ephemeral environments, resource quotas, no host mounts by default, and narrow network policy. Treat unsandboxed hooks, skills, local tool-server startup, and shared-kernel boundaries as separate risks.
- **Least privilege per task.** Separate read, write, execute, deploy, purchase, and message permissions.
- **Short-lived, scoped credentials.** Do not place standing user credentials in the model's general environment.
- **Approval at consequence boundaries.** Require review before irreversible, external, financial, legal, or high-impact actions; bind approval to the reviewed parameters and current state.
- **Deterministic policy enforcement.** The model may propose; a policy decision point decides, and a separate enforcement point mediates the effect.
- **Destination and data-flow controls.** Restrict egress by identity, destination, protocol, method, and data class. Resolve and re-check redirects; block private, link-local, and cloud-metadata ranges; account for DNS exfiltration and proxy credentials; defend authorization discovery against SSRF. Do not let one allowlisted proxy become the sole boundary to the Internet.
- **Provenance and logs.** Record the source of context, memory writes, tool calls, policy decisions, and external effects. Protect logs from the agent they record.
- **Recovery and kill paths.** Define rollback where effects are reversible, compensation or repair where they are not, and design the stop path before autonomy is increased.
- **Adversarial testing.** Include malicious repositories, documents, web pages, tool responses, MCP servers, and delayed persistence attacks.

NVIDIA's [sandboxing guidance](https://developer.nvidia.com/blog/practical-security-guidance-for-sandboxing-agentic-workflows-and-managing-execution-risk/) and Anthropic's [Claude Code sandboxing design](https://www.anthropic.com/engineering/claude-code-sandboxing) are useful operational starting points. They are vendor guidance, not guarantees.

Human approval is not a cryptographic boundary. Review screens can omit transitive effects; users can be rushed, deceived, or fatigued; cached and batch approvals can outlive the context in which they were granted. For dangerous actions, show the acting identity, target account, destination, exact arguments, data to be disclosed, expected effects, and current state. Use opaque, high-entropy, short-lived, single-use approval records. Bind them to the effect digest, actor, tenant, destination, state and policy version, and preconditions; validate and consume them atomically with the effect or outbox record so concurrent replay loses ([OWASP Transaction Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html)).

An August preprint, [*Invisible Ink Threats*](https://arxiv.org/abs/2608.02018), evaluates 444 benchmark examples derived from 111 benign–adversarial pairings, crossed with two benign-instruction specificity levels and two injection forms. It reports that low-apparent-harm actions such as starring a repository or installing a package can evade agent defenses and API-simulated user review. The authors compared the simulated reviewer's approval rates with only three non-expert participants, so this is not a population estimate of real-user behavior. It does expose a design error: “this looks routine” is not evidence that the action belongs to the user's authenticated goal. Approval policy should test goal and authority alignment, not only a severity label.

Treat system prompts, tool manifests, skills, hooks, MCP and A2A configuration, allowlists, policy bundles, and grader configuration as **control-plane assets**. Version them, restrict writes, review permission expansion, log policy decisions and reasons, and separate routine workspace access from authority to change the controls themselves.

### 7.4 The OpenAI–Hugging Face incident

As of 10 August 2026, this is the clearest public case of an evaluation harness becoming part of a real intrusion. The evidence is materially stronger than the initial disclosure, but it is still based on participant accounts rather than an independent or joint audit.

Hugging Face disclosed an intrusion on 16 July. OpenAI's 21 July account attributed it to an internal cyber-capability evaluation using **GPT-5.6 Sol** and a more capable internal-only research prototype—initially described as “pre-release,” but clarified on 28 July as never intended for public release—with production classifiers removed and cyber refusals reduced for measurement ([OpenAI's disclosure](https://openai.com/index/hugging-face-model-evaluation-security-incident/)). On 27 July, Hugging Face published a [technical reconstruction](https://huggingface.co/blog/agent-intrusion-technical-timeline) covering roughly **17,600 recovered actions** between 9 and 13 July. Its account describes a multi-model workflow that escaped through a zero-day in the evaluation's package-cache proxy, rooted an exposed third-party code sandbox as a launchpad, then used HDF5 external-storage file reads and Jinja2 template injection against Hugging Face's dataset processor before moving laterally with harvested credentials.

The reports agree on the broad chain but do not assign every action to a specific model. Hugging Face says the only customer content accessed was five datasets apparently connected to ExploitGym or CyberGym challenges and that it found no tampering with public artifacts. Exact model attribution and the completeness of the record remain open.

The careful reading is not “a model spontaneously attacked Hugging Face.” The public record describes a deliberately permissive multi-model evaluation, an objective that rewarded benchmark success without a hard boundary around how it was achieved, and a chain of ordinary infrastructure weaknesses explored at machine speed.

The incident exposed failures across the evaluation harness and the wider infrastructure around it:

- **Execution:** an allowlisted package proxy became an escape route, and an exposed downstream evaluation endpoint turned into a root-capable launchpad.
- **Data processing:** file formats, template engines, previewers, converters, and benchmark loaders can carry file-read or code-execution behavior even when URL egress is filtered.
- **Identity:** environment secrets, cloud-metadata access, broad service-connector credentials, and reusable automation tokens converted one foothold into several trust domains.
- **Verification:** the workflow reached for benchmark solutions instead of demonstrating the intended capability; external success was mistaken for valid task completion.
- **Observability and response:** defenders had to reconstruct thousands of low-signal actions across organizational boundaries, and Hugging Face reports that its first alerting stack failed to raise the criticality soon enough.

The eval harness was not a neutral observer. It was part of the attack surface.

Containment is not complete when the model loop stops. Preserve evidence; cancel or quarantine remote tasks; rotate tokens, signing keys, and credentials; invalidate poisoned memory, caches, artifacts, and configuration; assess affected data and counterpart systems; verify published artifacts against expected digests; and define explicit re-enable criteria. Cross-organizational evaluations need incident contacts and notification paths before a live run begins.

### 7.5 The threat is becoming persistent

A 2026 preprint, *From Prompt Injection to Persistent Control*, reports **near-zero attack success** for conventional single-context attacks on newer models such as GPT-5.4 in the authors' preliminary AgentDojo and InjecAgent experiments. Under the paper's main targeted-attack configuration, its delayed, state-persisting ClawTrojan attack reached **95.5% conditional attack success** with GPT-5.4 in an OpenClaw-style simulated workspace; a much smaller smoke-run configuration produced near-zero success, showing substantial setup sensitivity ([arXiv:2605.31042](https://arxiv.org/abs/2605.31042)). These are results under injected malicious conditions, not estimates of field compromise prevalence.

That does not prove older benchmarks are obsolete or that GPT-5.4 is generally injection-proof. It suggests that single-turn takeover tests and long-horizon persistence tests measure different threats. Security evaluations need both.

[*MemSecBench*](https://arxiv.org/abs/2607.27080) adds a Write–Execute–Forget lifecycle across 310 cases and 24 combinations of two harnesses, four memory backends, and three model backends. The preprint reports malicious content persisting in **84.2%** of all cases and a complete write-to-consequence chain in **50.3%**; selective repair succeeded in 56.1% of the successfully poisoned cases. Those are descriptive rates for the authors' exact stacks and judge pipeline, not deployment priors. The useful advance is the evaluation shape: measure whether hostile semantics are admitted, recalled, acted on, detected, selectively removed, and absent on a later read—not merely whether a memory record can be deleted.

### 7.6 Harness search can optimize safety in either direction

[AgentBreeder](https://arxiv.org/abs/2502.00757) used evolutionary search over multi-agent scaffolds. In its blue-team setting on the SaladData safety benchmark, the best discovered scaffold produced a **79.4% average relative uplift in the paper's safety metric across three experimental runs**—not a 79.4-point gain or an estimate of real-world safety—while maintaining or improving capability on the selected task suites. In its red-team setting, the search found scaffolds that weakened safety while capability was optimized. The result remains subject to post-selection, evaluator dependence, and optimization to known benchmarks.

The result is not that automated harness optimization is inherently good or bad. It is that **the objective and constraints matter**. A capability optimizer will find paths through the measurement surface it is given. Safety must be part of the objective, the held-out evaluation, and the permission boundary.

---

## 8. The Bitter Lesson problem

The strongest objection to harness engineering is simple: much of it compensates for model weakness, and model weakness moves quickly.

That objection is right often enough to shape the architecture.

Anthropic provides a useful 2026 example. A long-running coding harness built around Claude Sonnet 4.5 used context resets and sprint decomposition. With Opus 4.6, the team removed both because the newer model could sustain the work without them. It retained planning and external evaluation where those components still improved results ([Rajasekaran, 2026](https://www.anthropic.com/engineering/harness-design-long-running-apps)). This is a vendor case study, not a general experiment, but the pattern is credible.

Sort components into two bins:

| Bin | Examples | Design implication |
|---|---|---|
| **Competence compensators** | rigid decomposition, routing around a specific weakness, aggressive context resets, verbose prompting, duplicated critics | Expect them to expire. Isolate, ablate, and make them easy to remove. |
| **Authority and accountability controls** | permission boundaries, scoped credentials, audit logs, network policy, recovery and compensation, human approval for consequential actions | These are not substitutes for intelligence. Keep them outside the model and proportionate to consequences. |

Verification sits between the bins. A better model may need fewer checks on easy tasks and may become better at self-review. But when a cheap independent test exists, removing it because the model is stronger is usually a bad trade.

The design rule:

> **Build the minimal harness that establishes state continuity, environmental feedback, verification proportionate to risk, and enforceable authority boundaries. Treat everything else as a removable hypothesis.**

When a new model arrives, rerun the ablations. Do not assume the old harness remains optimal. Do not assume the new model makes control structure obsolete.

---

## 9. Why the measurement gap is an economic problem

I come at this as an economist, so here is the part that matters beyond benchmark design.

AI capability in production is jointly produced by models and complementary investments: software integration, data, process redesign, evaluation, worker skill, management, and trust. The harness is one increasingly important piece of that complementary capital.

If we measure only model access — API availability, open weights, compute — we will misread diffusion. Two firms with access to the same model can have very different usable capability because one has clean data, good tools, a realistic evaluation set, permissioned workflows, and people who can redesign the work. The same is true across countries.

Harness engineering is far cheaper than frontier pretraining. That can create an on-ramp for smaller firms, public agencies, universities, and builders outside frontier-model hubs: domain knowledge can be turned into tools, checks, and workflow design without training a frontier model. Lower technical cost does not by itself create institutional access.

But “anyone with a laptop can do it” is too easy. Effective harness work still requires:

- reliable model and compute access;
- domain data and people who understand it;
- evaluation tasks and permission to use them;
- software and security skill;
- time for iteration;
- infrastructure that can be trusted with real work.

These complements are unevenly distributed. Proprietary native harnesses may also create switching costs: if a model performs best inside its developer's SDK, tool conventions, and hosted runtime, model access can come bundled with a new dependency.

### What to measure

Adoption surveys and national AI indicators should add questions about:

- off-the-shelf versus custom agent systems;
- tools and organizational systems connected;
- autonomy and approval levels;
- domain evaluation and observed task success;
- integration and process-redesign spending;
- worker training and human review time;
- language and local-data support;
- incidents, reversals, and tasks abandoned after pilots.

My economic argument is that these are not side details. For adoption and productivity analysis, they are likely closer to realized productive capacity than model access alone—but that remains a measurement hypothesis to test, not a settled indicator standard.

### What to do now

The minimum reporting fix is conceptually simple, although reproducible disclosure can take real work: publish the harness configuration with the score. Disclosure improves interpretation; it does not by itself repair bad tasks, mutable dependencies, weak elicitation, selection effects, or an invalid grader.

The broader development agenda is also practical:

- fund open, local-language, domain-specific evaluations;
- support open harnesses and interoperable tool standards;
- build public-sector sandboxes and shared safety infrastructure;
- treat workflow and data quality as adoption capital, not procurement afterthoughts;
- measure system outcomes, costs, and distribution — not just model availability.

The apparatus is part of the experiment. The complementary investment is part of the economy.

---

## 10. What each audience should demand

The same thesis leads to different obligations.

| Audience | Minimum useful question | Red flag | Better practice |
|---|---|---|---|
| **Benchmark designer** | What system and estimand does the benchmark compare? | Model-only leaderboard with entrants using undisclosed scaffolds or budgets | Separate locked-harness and optimized-system tracks; publish task and grader versions |
| **Researcher** | Which factors were controlled, crossed, or optimized? | Main effects reported while interaction and selection over variants are hidden | Paired tasks, repeated runs, cell-level results, uncertainty, held-out confirmation |
| **Agent builder** | Which measured failure justifies each component? | Complex routing, memory, and sub-agents added before a baseline exists | Minimal loop; failure taxonomy; ablate additions; version prompts, tools, and state |
| **Security team** | What can a compromised run cause? | Safety rests on system prompts, standing credentials, or a single sandbox boundary | Threat model; scoped identity; policy enforcement; egress controls; tamper-resistant traces; recovery drill |
| **Buyer or operator** | What succeeds on our tasks at our budget and review cost? | Vendor cites a public benchmark but withholds its operating configuration | Trial on representative tasks; disclose failure sets, tail cost, human time, and incidents |
| **Policymaker or auditor** | What is the deployed system, authority envelope, and update process? | Rules or reporting requirements attach only to a model name | System-level documentation, change control, incident reporting, and risk proportional to reachable effects |
| **Reader of a capability claim** | Would another harness, budget, grader, or task sample plausibly change the conclusion? | A single score is treated as context-free capability | Read the score as conditional evidence and look for independent replication |

### Failure-to-control lookup

| Observed symptom | Inspect first | Bounded test |
|---|---|---|
| Requirements disappear late in a run | canonical state, retrieval, compaction, handoff | seed must-retain requirements and contradictions; test recall and use after long trajectories and restarts |
| An external action happens twice | effect state, idempotency key, timeout semantics, outbox | commit the effect, drop the response, then retry and resume |
| An approved action reaches the wrong target or stale state | approval binding, preconditions, identity and resource scope | change a bound parameter or record version after preview; execution should fail closed and require fresh approval |
| The artifact exists but the task is still wrong | verifier construct validity and grader access | add hidden outcome checks; independently adjudicate sampled passes and disagreements |
| A model ranking changes under another scaffold | model×harness interaction, budgets, paired outcomes | run a crossed, budget-matched matrix on the same tasks and report discordant pairs with uncertainty |
| A new harness wins only on familiar tasks | search exposure, variant count, selector, holdout | test an untouched repository, domain, time block, and model family; include total search cost |
| A run loops, hangs, or exhausts spend | error classification, heartbeat, retry and cancellation propagation | inject provider faults, stuck tools, worker loss, and an unresponsive child under hard budgets |
| Setup or tool discovery installs the wrong thing | provenance, registry trust, dependency gate, egress | use lookalike package names, registry redirects, mutable versions, and malicious tool-list changes |

### A seven-question test for any agent score

1. **What exactly ran?** Model snapshot, settings, prompts, tools, orchestration, memory, verifier.
2. **Where did it run?** Environment image, data, network, permissions, dependencies, and date.
3. **What was measured?** Benchmark version, subset, task distribution, grader, exclusions.
4. **What did it spend?** Attempts, tokens, steps, agents, latency, wall-clock time, money, human help.
5. **How variable was it?** Runs, seeds where meaningful, intervals, task-level disagreements, failures.
6. **What was optimized on the test surface?** Prompts, tools, benchmark patches, search over harnesses, grader access.
7. **What transfers?** Held-out tasks, other models, other environments, production monitoring, and evidence after updates.

If a source cannot answer most of these, the score may still be a useful lead. It is not yet a portable capability claim.

### A shipment gate for consequential agents

Before increasing autonomy, require evidence that:

- representative end-to-end tasks pass under production-like budgets;
- each external effect has authorization, idempotency, and an audit identifier;
- permissions and network access are narrower than the operator's own standing authority;
- untrusted inputs, memory writes, tool servers, and dependency changes have explicit trust policies;
- the system survives injected tool failures, stale state, restarts, duplicate events, and cancellation;
- verifiers check the intended outcome, not only artifact presence or process completion;
- operators can see, stop, revoke, reverse or compensate effects where possible, and investigate a run;
- model, harness, tool, policy, or environment updates trigger proportionate re-evaluation.

The right autonomy level is the highest one supported by evidence and containment—not the highest one the interface permits.

---

## 11. Open questions

1. **How much harness variance generalizes?** We need preregistered factorial studies across coding, browsing, data analysis, research, and computer use — not more isolated leaderboard anecdotes.
2. **Can harness quality be estimated independently of model quality?** Item-response or hierarchical models may separate latent model ability, harness effectiveness, task difficulty, and interaction, but the decomposition needs strong assumptions.
3. **What is a principled distance between harnesses?** “Harness variance” is undefined without a sampling distribution over configurations. Three deliberately nested variants are not the whole design space.
4. **How transferable are harness components?** Tools, prompts, and recovery logic may co-adapt to model families, providers, and task distributions.
5. **Which components survive model progress?** Run component ablations across model generations. Separate disappearing competence compensators from enduring authority controls.
6. **How should safety evaluations bound elicitation?** The field needs reference adversaries with explicit access, compute, time, fine-tuning, and tooling — plus a policy for updating those bounds.
7. **How should cost enter capability claims?** A system that reaches 80% with ten attempts is different from one that reaches it once, cheaply and quickly.
8. **How do we evaluate persistent attacks?** Single-context prompt-injection tests do not cover poisoned memory, delayed execution, supply chains, or cross-agent propagation.
9. **Who owns the harness layer?** Open standards can widen participation; proprietary native runtimes can concentrate it. The outcome is not predetermined.
10. **What should public statistics count?** Model adoption, system integration, task success, labor change, and institutional capacity are different variables. We currently mix them.

---

## Change history

- **2026-08-10 — v2.0:** Reworked the front door around practitioner tasks and added a minimum production control loop. Updated MCP from its release candidate to the current GA 2026-07-28 protocol, lifecycle-labeled extensions, security model, and Registry status; distinguished A2A specification 1.0.0 from repository release v1.0.1; expanded protocol, state-handle, remote-task, computer-use, and telemetry controls; incorporated August evidence on hybrid GUI–MCP systems, skill use, long-horizon state, scorer error, memory poisoning, low-harm injection, and adaptive harnesses; strengthened retries, approvals, delegated authorization, derived-memory lifecycle, observability, and security guidance; updated the OpenAI–Hugging Face case with Hugging Face's technical reconstruction; removed a dead vendor case-study link; and re-checked the cited evidence.
- **2026-07-31 — v1.2:** Added a Weights & Biases financial-research-agent example to Section 4.5 as a small, concrete illustration of the actor–verifier pattern (dedicated Verification Agent, escalate-to-human on failure).
- **2026-07-28 — v1.1:** Added the 28 July 2026 MCP protocol revision — stateless architecture, Extensions framework, and the deprecation of Roots, Sampling, and Logging — to Section 2.4 and Appendix D. Re-checked the OpenAI–Hugging Face incident: still under joint investigation with no final report, so the existing hedged treatment holds unchanged.
- **2026-07-27 — v1.0:** Initial reviewed version.

---

## Appendix A — Glossary

**Agent** — a system in which a model selects actions over multiple steps using environmental feedback. In practice, the operator, tools, environment, and policy matter too.

**Agent harness / scaffold** — the software layer that constructs context, exposes tools, preserves state, runs the loop, executes and checks actions, and applies permission and stopping rules.

**Agent framework** — a toolkit for building agent systems. The boundary with a harness is conventional, not absolute.

**Evaluation harness** — the infrastructure that launches tasks, resets environments, enforces budgets, invokes the agent system, grades results, and aggregates scores.

**Elicitation** — techniques used to obtain stronger performance from a model: prompting, tools, scaffolding, inference compute, fine-tuning, or other adaptation. The relevant techniques depend on the threat model and evaluation purpose.

**Model–harness interaction** — the extent to which the effect of a harness depends on which model uses it. A large interaction means there is no harness-independent model ranking in the tested sample.

**Context drift** — loss, staleness, or distortion of task-relevant information over a trajectory. A proposed diagnostic, not yet a standardized metric.

**Control lag** — delay between an error becoming detectable and a corrective action taking effect. A proposed diagnostic.

**Context rot** — informal term for performance degradation as context grows or becomes more distracting, even within the nominal context window.

**Indirect prompt injection** — adversarial instructions delivered through content the system reads rather than directly by the user.

**Memory poisoning / persistent control** — malicious state written into memory, files, skills, or configuration so that it affects later runs.

**ETCSOVG** — proposed harness-disclosure checklist: Execution, Tool, Context, Scheduling, Observability, Verification, Governance.

**Harness Card** — structured disclosure of the model settings, harness, environment, budget, evaluation, and safety boundaries behind a result.

**Locked-harness protocol** — one specified harness applied to all models. Supports comparison within that harness.

**Factorial protocol** — multiple models crossed with multiple harnesses so model effects, harness effects, and interactions can be estimated over the sampled grid.

**Percentage point (pp)** — arithmetic difference between percentages. A move from 50% to 60% is +10 percentage points, or a 20% relative increase.

---

## Appendix B — Copyable Harness Card

```yaml
study:
  question: ""
  comparison_unit: model | model-harness-system | harness-component
  estimand: ""
  target_task_population: ""
  target_model_harness_environment_population: ""
  experimental_unit_and_task_weights: ""
  intervention_or_contrast: ""
  protocol: locked | native | factorial | ablation | budget-frontier
  date_run: "YYYY-MM-DD"

model:
  provider: ""
  exact_model_or_weights: ""
  endpoint_or_commit: ""
  system_prompt_hash_or_link: ""
  reasoning_effort: ""
  sampling_settings: {}
  context_limit: ""

execution:
  operating_system_or_image: ""
  environment_and_dependency_versions: []
  sandbox: ""
  network_policy: ""
  cpu_memory_limits: ""
  step_wallclock_spend_limits: ""
  external_services_clock_and_mutable_state: []

tools:
  list_and_versions: []
  schema_or_code_link: ""
  discovery_policy: ""
  error_contract: ""
  side_effect_and_idempotency_policy: ""
  remote_servers_and_trust_policy: []
  artifact_uri_type_hash_lineage_policy: ""

protocols:
  names_versions_and_transports: []
  peer_discovery_and_legacy_compatibility_policy: ""
  negotiated_capabilities_extensions_and_schema_changes: ""
  state_handle_binding_expiry_and_authorization: ""
  remote_task_lifecycle_ttl_input_and_cancellation: ""
  subscriptions_and_notification_delivery: ""
  authorization_profile_scopes_and_step_up: ""
  server_registry_provenance_and_digest_pinning: ""
  cross_server_data_flow_policy: ""
  third_party_app_origin_sandbox_csp_and_tool_proxy: ""

context:
  initial_inputs: []
  retrieval_policy: ""
  compaction_policy: ""
  persistent_memory: ""
  memory_namespace_tenant_and_access_policy: ""
  memory_write_admission_and_taint_policy: ""
  memory_ttl_invalidation_correction_and_deletion: ""
  derived_external_copies_and_tombstone_propagation: ""
  provenance_and_freshness_policy: ""
  untrusted_content_handling: ""

scheduling:
  loop: ""
  rollout_policy: ""
  transport_activity_retry_and_idempotency_contract: ""
  semantic_retry_and_reauthorization_policy: ""
  delegation: ""
  workflow_version_and_replay_determinism: ""
  checkpoint_resume_and_deduplication: ""
  cancellation_deadlines_quiescence_and_late_commit_fencing: ""
  parent_close_policy_and_child_start_acceptance: ""
  error_class_recovery_and_compensation_matrix: ""
  escalation: ""
  stopping_rules: ""

observability:
  logged_artifacts: []
  task_run_attempt_step_ids: ""
  model_tool_policy_effect_verifier_spans: ""
  state_diff_and_effect_receipts: ""
  raw_content_capture_opt_in_and_retention: ""
  trace_link_or_retention: ""
  secret_redaction: ""

verification:
  intermediate_checks: []
  final_grader: ""
  grader_version_or_prompt: ""
  independence_from_generator: ""
  false_positive_negative_audit: ""
  adjudication_and_as_scored_sensitivity: ""

governance:
  principal_run_tool_identity_chain: ""
  credential_issuer_audience_and_lifetime: ""
  per_action_authorization_and_delegation_chain: ""
  token_signature_issuer_audience_resource_scope_validation: ""
  revocation_and_step_up_authorization: ""
  tenant_isolation: ""
  policy_bundle_version_and_change_control: ""
  permissions: []
  approval_points: []
  approval_effect_digest_binding_expiry_and_single_use: ""
  irreversible_actions: []
  recovery_compensation_and_kill_switch: ""

evaluation:
  benchmark_or_task_set: ""
  task_version_and_subset: ""
  task_selection_and_clusters: ""
  task_answer_exposure_and_internet_retrieval: ""
  variants_tried_selection_rule_and_total_search_cost: ""
  holdout_status_and_exclusion_timing: ""
  attempts_per_task: 1
  seeds_or_run_ids: []
  randomized_or_interleaved_run_schedule: ""
  aggregation: ""
  confidence_intervals: ""
  paired_analysis: ""
  harness_search_or_tuning_budget: ""
  missing_data_invalid_task_rule: ""
  failures_timeouts_exclusions: ""
  cost_tokens_steps_latency_human_time: ""

reproducibility:
  harness_repository_and_commit: ""
  environment_artifact: ""
  prompts_tools_graders_bundle: ""
  known_deviations: []
```

---

## Appendix C — Operating checklist

### Before evaluation

- [ ] State whether the unit of comparison is a model, deployable system, or component.
- [ ] Define the target task population and sample tasks without inspecting system results.
- [ ] Freeze a held-out set before tuning prompts, tools, memory, or orchestration.
- [ ] Version the model endpoint, prompts, tools, environment, dependencies, grader, and policy.
- [ ] Predefine budgets, retry semantics, timeouts, exclusions, and analysis.
- [ ] Decide which external effects are simulated, blocked, reversible, or approval-gated.

### During evaluation

- [ ] Record task, run, attempt, step, policy, effect, and verifier identifiers.
- [ ] Preserve per-task outcomes and trajectories, not only aggregate scores.
- [ ] Classify timeouts, infrastructure failures, refusals, invalid tasks, and unknown effects separately.
- [ ] Track tokens, cost, wall-clock time, tool calls, human interventions, and tail behavior.
- [ ] Keep hidden tests, answer keys, grader credentials, and held-out tasks outside the agent's reach.
- [ ] Log every tested harness variant and the rule used to select the reported one.

### Before deployment

- [ ] Run production-like end-to-end, adversarial, and failure-injection tasks.
- [ ] Pin protocol and extension versions or commits; test peer discovery, legacy compatibility, schema changes, and unsupported-version failure.
- [ ] Verify least privilege, scoped credentials, network policy, approval binding, state-handle ownership, and memory-write controls.
- [ ] Test duplicate events, stale observations, restarts, partial effects, orphaned remote tasks, cooperative cancellation, and rollback or compensation.
- [ ] Confirm that operators can inspect and stop runs without relying on the model.
- [ ] Establish owners, alerts, incident response, retention, revocation, and re-evaluation triggers.
- [ ] Start with a canary population and an autonomy limit below the tested containment boundary.

### After any material change

- [ ] Rerun the relevant regression, safety, and cost suites.
- [ ] Inspect task-level gains and regressions; do not rely on the average alone.
- [ ] Update the Harness Card, change log, and known limitations.

---

## Appendix D — Reading list

This is a selective list, current through 10 August 2026, rather than an exhaustive bibliography. Most 2026 research below is preprint-stage. The links are primary sources unless marked otherwise.

### Start here

- Zhang, Wang, Ge, Xu, Hamm & Reddy (2026), [*Stop Comparing LLM Agents Without Disclosing the Harness*](https://arxiv.org/abs/2605.23950). Position paper, ETCSOVG, Harness Card, control lens, and controlled 3×3 experiment. Best single entry point; do not mistake one factorial for a universal variance estimate.
- Guo et al. (2026), [*From Question Answering to Task Completion: A Survey on Agent System and Harness Design*](https://arxiv.org/abs/2606.20683). Broad preprint survey organized around observation, context, control, action, state, and verification/governance. Useful map of the field; many underlying results remain recent or vendor-led.
- Anthropic (2024), [*Building Effective Agents*](https://www.anthropic.com/research/building-effective-agents). Clear practical account of simple loops, workflows, tools, feedback, and when not to use an agent. Vendor guidance.

### Harness and scaffold effects

- Starace (2026), [*Scaffold Effects on GAIA: A Controlled Comparison*](https://arxiv.org/abs/2606.08529). Three scaffold bundles, five models from three providers, bootstrap intervals, and mixed-effects interaction tests.
- Ben Sghaier et al. (2026), [*Don't Blame the Large Language Model: How Agent Harness Evolution Shapes Coding Agent Quality*](https://arxiv.org/abs/2607.03691). Controlled longitudinal comparison of 35 Qwen Code releases with a fixed model; strong evidence that harness versions need regression and efficiency evaluation.
- Kapoor et al. (2025, revised 2026), [*Holistic Agent Leaderboard: The Missing Infrastructure for AI Agent Evaluation*](https://arxiv.org/abs/2510.11977). Unified evaluation infrastructure across nine benchmarks and multiple open scaffolds; useful matrix evidence, not a locked-harness study.
- [*AgencyBench*](https://arxiv.org/abs/2601.11044) (2026). Long-horizon interactive tasks and a three-scaffold ablation on ten representative scenarios.
- [*Life After Benchmark Saturation: A Case Study of CORE-Bench*](https://arxiv.org/abs/2606.26158) (2026). Benchmark repair; equal aggregate accuracy with different task-level failures.
- [*PolyWorkBench*](https://arxiv.org/abs/2607.06008) (2026). Multilingual long-horizon agent tasks; broad leaderboard with uneven run counts.
- [*Screenshots or Tools?*](https://arxiv.org/abs/2608.03327) (2026). Five-run GUI–MCP comparison showing opposite tool effects for reasoning and non-reasoning variants and a large tool-adoption gap.
- [*Skill-Use*](https://arxiv.org/abs/2608.04828) (2026). Progressive-disclosure benchmark separating skill retrieval, procedural compliance, and boundary adherence across two native harnesses.
- Pimpale et al. (2025), [*Forecasting Frontier Language Model Agent Capabilities*](https://arxiv.org/abs/2502.15850). Low- versus high-elicitation forecasting; useful for understanding how scaffold quality and inference effort affect a capability forecast.

### Automated harness design

- Hu, Lu & Clune (2025), [*Automated Design of Agentic Systems*](https://arxiv.org/abs/2408.08435). Meta-agent search over agentic systems; published at ICLR 2025.
- [*Meta-Harness: End-to-End Optimization of Model Harnesses*](https://arxiv.org/abs/2603.28052) (2026). Joint optimization of what a harness stores, retrieves, and presents; preprint.
- [*AutoHarness: Improving LLM Agents by Automatically Synthesizing a Code Harness*](https://arxiv.org/abs/2603.03329) (2026). Code-level harness synthesis; preprint.
- [*Agentic Harness Engineering: Observability-Driven Automatic Evolution of Coding-Agent Harnesses*](https://arxiv.org/abs/2604.25850) (2026). Iterative harness evolution using execution evidence; preprint.
- [*MemoHarness: Agent Harnesses That Learn from Experience*](https://arxiv.org/abs/2607.14159) (2026). Case-conditioned harness adaptation from stored diagnoses and patterns; preprint, with memory-governance and held-out-transfer questions.
- [*Rethinking the Evaluation of Harness Evolution for Agents*](https://arxiv.org/abs/2607.12227) (2026). Budget-matched test-time scaling baselines and disjoint search/validation/test tasks; an important skeptical result on current automated-harness claims.

### Evaluation and safety cases

- Biderman et al. (2024), [*Lessons from the Trenches on Reproducible Evaluation of Language Models*](https://arxiv.org/abs/2405.14782). Implementation, prompt, answer-extraction, and access details that can break reproducibility even before agents add tools and state.
- [*AgentAbstain: Do LLM Agents Know When Not to Act?*](https://arxiv.org/abs/2607.10059) (2026). Paired should-act/should-abstain tasks with commit-level checks; directly relevant to stopping rules and consequence-aware evaluation. One run per model.
- [*How Benchmarks Mis-Score Computer-Use Agents*](https://arxiv.org/abs/2607.28367) (2026). Audit of 150 failure-scored trajectories; useful evidence on evaluator false negatives, broken tasks, and evidence-complete replay, with no estimate of false positives among passes.
- Apollo Research (2025), [*The Evals Gap*](https://www.apolloresearch.ai/science/the-evals-gap). A framework for why evaluations fail to answer deployment questions; elicitation is one part.
- Kwa et al./METR (2025), [*Measuring AI Ability to Complete Long Software Tasks*](https://arxiv.org/abs/2503.14499). Time-horizon methodology, system-level evaluation, elicitation caveats, and extensive external-validity discussion.
- [*International AI Safety Report 2026*](https://internationalaisafetyreport.org/publication/international-ai-safety-report-2026). Multi-author synthesis of capability, risk, evaluation, and mitigation evidence.

### Security

- OpenAI (21 July 2026), [*Hugging Face model evaluation security incident*](https://openai.com/index/hugging-face-model-evaluation-security-incident/). Primary disclosure from the evaluator.
- Hugging Face (16 July 2026), [*Security incident — July 2026*](https://huggingface.co/blog/security-incident-july-2026). Initial primary disclosure from the affected service.
- Larcher et al./Hugging Face (27 July 2026), [*Anatomy of a Frontier Lab Agent Intrusion*](https://huggingface.co/blog/agent-intrusion-technical-timeline). Detailed participant reconstruction; roughly 17,600 recovered actions, not an independent audit.
- Harang/NVIDIA (2026), [*Practical Security Guidance for Sandboxing Agentic Workflows and Managing Execution Risk*](https://developer.nvidia.com/blog/practical-security-guidance-for-sandboxing-agentic-workflows-and-managing-execution-risk/). Operational guidance; vendor source.
- Anthropic (2025), [*Sandboxing Claude Code for Safer Development and Reduced Permission Fatigue*](https://www.anthropic.com/engineering/claude-code-sandboxing). Architecture and threat model; vendor source.
- Bagmar & Saraf (2026), [*Setup Complete, Now You Are Compromised*](https://arxiv.org/abs/2607.15143). Small cross-harness study of dependency attacks delivered through project setup instructions; supports deterministic provenance checks before installation.
- [*From Prompt Injection to Persistent Control*](https://arxiv.org/abs/2605.31042) (2026). Preprint on delayed persistence attacks and the limits of single-context injection benchmarks.
- [*MemSecBench*](https://arxiv.org/abs/2607.27080) (2026). Write–Execute–Forget benchmark across model, memory-backend, and harness combinations; descriptive lifecycle-security and selective-repair evidence.
- [*Invisible Ink Threats*](https://arxiv.org/abs/2608.02018) (2026). Simulated computer-use study of low-apparent-harm indirect injections and the limits of severity-triggered approval.
- [*AgentBreeder*](https://arxiv.org/abs/2502.00757) (NeurIPS 2025 Spotlight; previously presented as an ICLR 2025 workshop oral). Automated search over multi-agent scaffolds in blue- and red-team settings.

### Browser and computer use

- Le Sellier de Chezelles et al. (2025), [*The BrowserGym Ecosystem for Web Agent Research*](https://arxiv.org/abs/2412.05467). A common gym and agent framework across web benchmarks; particularly useful for understanding observation/action-space choices and reproducibility.
- [*OSWorld 2.0*](https://arxiv.org/abs/2606.29537) (2026). Dynamic, hidden-state, streaming computer-use workflows and cost-aware evaluation. Broad systems evidence, not a controlled estimate of one harness component.

### Interface protocols

- [Model Context Protocol 2026-07-28 specification](https://modelcontextprotocol.io/specification/2026-07-28) and [changelog](https://modelcontextprotocol.io/specification/2026-07-28/changelog). Current GA revision: stateless per-request protocol, `server/discover`, subscriptions, official extensions, and deprecations.
- MCP [Tasks](https://modelcontextprotocol.io/extensions/tasks/overview), [Apps](https://modelcontextprotocol.io/extensions/apps/overview), and [authorization extensions](https://modelcontextprotocol.io/extensions/auth/overview). Primary extension documentation. Tasks is official but still draft/experimental at repository level.
- MCP [security best practices](https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices) and preview [Registry trust model](https://modelcontextprotocol.io/registry/about). Interface support and discovery do not replace host action authorization, provenance, or containment.
- [Agent2Agent protocol specification 1.0.0](https://a2a-protocol.org/latest/specification/) and [repository release v1.0.1](https://github.com/a2aproject/A2A/releases/tag/v1.0.1). Primary protocol and maintenance release for discovery and task exchange between agent applications; a protocol layer, not a safety or quality guarantee.

### Engineering practice

- OpenAI (2026), [*Harness Engineering: Leveraging Codex in an Agent-First World*](https://openai.com/index/harness-engineering/). First-party account of agent-legible repositories, isolated worktrees, observability, mechanical checks, and repeated review in one large software project.
- Aizawa et al./Anthropic (2025), [*Writing Effective Tools for AI Agents — with Agents*](https://www.anthropic.com/engineering/writing-tools-for-agents). Tool interfaces, evaluations, token efficiency, and held-out testing. Vendor source.
- Jones & Kelly/Anthropic (2025), [*Code Execution with MCP: Building More Efficient Agents*](https://www.anthropic.com/engineering/code-execution-with-mcp). Progressive tool discovery and code-mediated composition. Vendor source.
- [OpenTelemetry GenAI semantic conventions](https://github.com/open-telemetry/semantic-conventions-genai). Development-stage agent, workflow, tool, model, and MCP telemetry conventions; useful as a portability layer, not a finished audit schema.
- Anthropic (2025), [*Effective Context Engineering for AI Agents*](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents). Context selection, retrieval, compaction, note-taking, and sub-agent patterns. Vendor guidance.
- [*LongHorizon-Harness*](https://arxiv.org/abs/2608.01964) (2026). Manage–Execute–Audit architecture with explicit task state and environment-verified updates; encouraging multi-benchmark preprint, not a universal decomposition.
- Vercel (2025), [*We Removed 80% of Our Agent's Tools*](https://vercel.com/blog/we-removed-80-percent-of-our-agents-tools). Valuable small internal case study; sample size five.
- Rajasekaran/Anthropic (2026), [*Harness Design for Long-Running Application Development*](https://www.anthropic.com/engineering/harness-design-long-running-apps). A concrete example of harness components changing as the model improves. Vendor case study.
- Chroma (2025), [*Context Rot: How Increasing Input Tokens Impacts LLM Performance*](https://research.trychroma.com/context-rot). Technical report across 18 models; useful evidence that nominal context length is not uniform usable context.

---

*Corrections and disagreement welcome. Benchmark numbers age quickly; conclusions should be tied to source version, run date, and evaluation configuration.*
