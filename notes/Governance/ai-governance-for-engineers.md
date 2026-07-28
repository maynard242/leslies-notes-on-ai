---
title: "AI Governance for Engineers"
description: "An engineer-first reference for making, keeping, and proving claims about AI-system behavior."
kind: "reference"
section: "Governance"
published: "2026-07-27"
updated: "2026-07-28"
checked: "2026-07-28"
version: "2.2"
status: "Reviewed"
topics:
  - AI governance
  - engineering
  - evaluation
  - safety
  - regulation
order: 2
---

# AI Governance for Engineers

**An engineer-first reference for building claims, controls, and evidence**

**Version 2.2 — 28 July 2026**
Regulatory and tooling facts were checked against the cited sources on 28 July 2026. This is engineering guidance, not legal advice. Law, standards, model behavior, and tool ownership change at different speeds; see Appendix D.

---

## Executive summary

AI governance is not a policy document. It is the control system that lets a team:

1. **make a bounded claim** about an AI system;
2. **keep that claim true enough** in deployment; and
3. **produce evidence** for somebody who did not build the system.

Those are the three verbs used throughout this document:

- **Make claims** = specification.
- **Keep claims** = enforcement.
- **Prove claims** = assurance and audit.

The practical loop is:

```text
SPECIFY → TRACE → EVALUATE → GATE → ENFORCE → OBSERVE → AUDIT
   ▲                                                        │
   └──────────── incidents, drift, and change ───────────────┘
```

The loop is necessary but not sufficient. Before it starts, the team must know **what system is being governed, in which role, for whom, in which jurisdictions, and with what possible consequences**. A model inventory without a system boundary is not enough. A model may be low risk in a drafting tool and high risk when the same output controls hiring, credit, medical treatment, public benefits, physical machinery, or an autonomous agent.

Ten conclusions carry most of the document:

1. **Govern the deployed system, not just the model.** Prompts, retrieval, tools, memory, permissions, people, and downstream workflows often determine more risk than the base weights.
2. **Write claims narrowly enough to test.** “Safe,” “fair,” and “secure” are headings, not testable claims.
3. **Evaluation shows what happened under specified test conditions.** A demonstrated success is evidence of capability; a failure to elicit behavior is not proof that the capability is absent.
4. **For agents, authorization beats content filtering.** Least privilege, transaction boundaries, approval gates, and compensating actions are stronger controls than asking another model whether a request looks dangerous.
5. **Prompt injection remains an open security problem.** Layer defenses, test with adaptive attacks, and do not represent a guardrail as a security boundary.
6. **Logging is the evidence substrate.** Preserve enough version and context information to reconstruct consequential behavior, but apply privacy, confidentiality, retention, and access controls to the logs themselves.
7. **Release mode determines residual control.** A provider can monitor and revoke a hosted service; it cannot control every downstream deployment of released weights. Downstream deployers can still govern their own systems.
8. **Human oversight must be operational.** A person without time, information, authority, competence, or a reversible decision is not a control.
9. **AI-specific law is only one layer.** Privacy, discrimination, consumer protection, product safety, cybersecurity, intellectual property, employment, health, and sector rules may apply even where no “AI law” does.
10. **The goal is a living assurance case.** A release dossier should connect each claim to a risk, control, test, result, owner, residual risk, and decision.

---

## Part 0 — Purpose, audience, and evidence discipline

### 0.1 Who this is for

Engineers, scientists, security teams, SREs, product owners, and technical risk owners who build, fine-tune, buy, deploy, or operate machine-learning systems, especially language models and agents. Familiarity with CI, threat models, and postmortems is assumed. Legal expertise is not.

### 0.2 Scope

This document covers controls at model and system level:

- system inventory and classification;
- behavioral and product specification;
- data, model, prompt, and tool provenance;
- evaluation and red-teaming;
- release and access decisions;
- runtime authorization and guardrails;
- logging, monitoring, and incident response;
- evidence, assurance, and audit;
- compute and frontier-model governance;
- privacy, human oversight, procurement, and change management where they affect engineering.

It does not try to replace counsel, a sector safety case, a privacy impact assessment, a national policy, or an organizational operating model.

### 0.3 Four evidence labels

Keep these categories separate in design documents and release decisions:

| Label | Meaning | Example |
|---|---|---|
| **Binding requirement** | An obligation that applies because of law, regulation, contract, or regulator order | EU AI Act duties for a provider of a covered high-risk system |
| **Standard or framework** | A voluntary or contractually adopted management or technical reference | NIST AI RMF; ISO/IEC 42001 |
| **Engineering control** | A mechanism chosen to reduce a specified risk | Tool allowlist; canary release; append-only log |
| **Evidence or research finding** | An observation with a method, scope, and limitations | Attack success on AgentDojo under a named threat model |

A voluntary framework can become practically mandatory through procurement or contract. A benchmark result does not become a legal safe harbor merely because a standard mentions evaluation. A vendor’s claim about its own filter is neither independent evidence nor a guarantee.

### 0.4 Claims must be bounded

A defensible claim identifies at least:

- **subject:** model, application, workflow, or organization;
- **version:** model, prompt, retrieval corpus, tools, policies, and code;
- **population:** users, languages, geographies, and relevant groups;
- **condition:** operating mode, permissions, sampling settings, and environment;
- **metric and threshold:** including uncertainty and cost of error;
- **time window:** when the evidence was collected and how long it remains valid;
- **exception path:** what happens when the system is uncertain or outside scope.

Bad claim:

> The assistant is safe and unbiased.

Better claim:

> In release candidate `2026-07-24`, with model `M`, prompt `P`, retrieval snapshot `R`, and no write-capable tools, the system refused at least 98% of the 1,200 policy-violating English test cases in suite `S` (95% Wilson interval reported), while inappropriate refusal on the 600 benign contrast cases remained below 3%. The result does not cover other languages, adaptive attacks, or future provider model updates.

The second claim is narrower. That is why it is useful.

---

## Part 1 — Governance as a control loop

### 1.1 The loop

![Seven-stage AI governance control loop: specify, trace, evaluate, gate, enforce, observe, and audit; incidents, drift, and material change feed the next cycle.](/illustrations/ai-governance-control-loop-framework.webp)

*Figure — The engineering control loop connects claims, controls, operational evidence, and revision. The detailed definitions and limits follow below.*

- **Specify:** What is the system intended and forbidden to do? What risk is tolerated?
- **Trace:** What code, weights, data, prompts, tools, and external services produced this system and this output?
- **Evaluate:** What happens under representative, difficult, adversarial, and out-of-distribution conditions?
- **Gate:** Who can access which capability, in which release mode, under what limits?
- **Enforce:** What runtime controls constrain content, data, actions, and authority?
- **Observe:** What happened in production, and did the input or system change?
- **Audit:** Can another party reproduce the reasoning and inspect the evidence behind the claim and decision?

Incidents, near misses, complaints, drift, and material changes feed back into the specification and test suite.

### 1.2 The precondition: inventory and classification

Do not start with a generic list of “AI risks.” Start with a system record. At minimum:

```yaml
system_id: support-agent
owner: customer-operations
business_purpose: draft and, after approval, send support replies
model:
  provider: example-provider
  immutable_version: model-2026-07-01
  deployment: hosted-api
components:
  system_prompt: prompts/support/v18.md
  retrieval_snapshot: kb-2026-07-24
  tools:
    - tickets.read
    - replies.draft
    - replies.send_after_approval
users: support_staff
subjects: customers
geographies: [EU, US, SG]
data_classes: [customer_identity, support_history]
consequential_effects: [external_message, account_advice]
human_decision: required_before_send
fallback: manual_support_queue
risk_tier: high
applicable_requirements: [privacy, consumer-protection, contracts]
```

Classification should consider consequences, not only model scale:

- Does the system make, recommend, or materially shape a decision about a person?
- Can it spend money, change data, communicate externally, execute code, control equipment, or alter access?
- Does it process sensitive, confidential, biometric, health, employment, educational, credit, or children’s data?
- Is it exposed to untrusted content?
- Can errors be detected and reversed before harm?
- Are affected people able to understand, challenge, or appeal the result?
- Is the model or a material component controlled by a third party?
- Is the system open-weight, self-hosted, fine-tuned, or served by an API that may change?

### 1.3 The DevSecOps analogy—and its limits

Much of the machinery transfers from mature software practice:

- change control and code review;
- signed, versioned artifacts;
- CI and release gates;
- least privilege and secrets management;
- canaries, feature flags, and rollback;
- logging, SLOs, and incident response;
- control evidence collected as a by-product of work.

But AI systems add several complications:

1. **Behavior is statistical and context-sensitive.** Repeated calls may differ; even deterministic decoding does not make a broad natural-language specification complete.
2. **The specification is partial.** Correct behavior is not defined for every possible input and context.
3. **The system is composite.** A pinned model can still behave differently after a prompt, retrieval corpus, tool, policy, or provider endpoint changes.
4. **Users and attackers adapt.** Static tests decay faster than ordinary regression suites.
5. **Observed failure may be non-reproducible.** Reproduction requires the complete trace, including model version, sampling settings, retrieved context, and tool outputs.
6. **A behavioral fix is rarely a clean patch.** Teams can patch prompts, permissions, filters, retrieval, tools, or training, but the effect is usually probabilistic and may move other behaviors.

So the right analogy is not “AI needs a new compliance tool.” It is “AI needs disciplined software and safety engineering, plus explicit treatment of statistical evidence and human consequences.”

### 1.4 Govern the system, not the model

For most application teams, model-level risk is only one term:

```text
system risk = model behavior
            + data and retrieval
            + prompts and orchestration
            + tool authority
            + user interface and defaults
            + human workflow
            + operating environment
            + downstream use
```

Examples:

- A strong model with a poisoned knowledge base can produce systematically wrong answers.
- A model with modest jailbreak resistance can still be acceptable if it has no sensitive data or external authority.
- A harmless drafting model can become consequential when its output is automatically submitted as a benefits decision.
- A “human in the loop” can increase risk if the interface creates automation bias and review time is unrealistic.

---

## Part 2 — Failure and threat model

### 2.1 Malfunction

**Definition:** the system produces an unintended result without an adversary.

Examples:

- fabricated facts or citations;
- poor calibration or abstention;
- disparate error rates across affected groups;
- reward hacking or proxy optimization;
- retrieval that surfaces stale or contradictory material;
- tool-selection errors;
- drift after a provider update or user-population change.

Primary controls:

- representative and subgroup evaluation;
- uncertainty and abstention where meaningful;
- human review before consequential effects;
- production monitoring and complaint channels;
- fallback and reversal paths.

### 2.2 Misuse and abuse

**Definition:** a user or third party intentionally steers the system toward prohibited or unauthorized behavior.

Examples:

- jailbreaks and policy evasion;
- fraud, impersonation, or prohibited-content generation;
- prompt injection through documents, email, websites, images, or tool output;
- extraction of private data or system prompts;
- model theft, membership inference, or training-data extraction;
- poisoning of training data, retrieval corpora, memory, plugins, or model artifacts.

Primary controls:

- identity, authentication, tiered access, and rate limits;
- threat-informed red-teaming;
- least privilege and scoped credentials;
- separation of untrusted data from control decisions;
- transaction limits and approval gates;
- abuse monitoring and revocation;
- ordinary supply-chain and application security.

### 2.3 Systemic and aggregate harm

**Definition:** individual deployments may function as intended while cumulative effects harm markets, institutions, communities, workers, culture, or the environment.

Examples include concentration of power, labor displacement, homogenized information, pollution of the information commons, energy and water use, and feedback loops from synthetic training data.

No product control fully solves this class. Public policy, competition, labor, environmental, and sector institutions are central. Engineers can still reduce contribution and improve evidence through resource accounting, accessibility, provenance, product defaults, opt-outs, user research, distribution monitoring, and limits on scale or use. The honest claim is **limited contribution**, not “the stack addresses systemic risk.”

### 2.4 Safety, security, privacy, reliability, and rights

These overlap but are not interchangeable:

| Question | Discipline |
|---|---|
| Does it achieve the intended function under normal conditions? | Reliability / quality |
| Can its behavior cause unacceptable harm even without an attacker? | Safety |
| Can an adversary violate confidentiality, integrity, availability, or authorization? | Security |
| Is personal data processed lawfully, minimally, transparently, and with appropriate rights? | Privacy / data protection |
| Does the design unjustifiably burden or discriminate against people, or impair contestability? | Fundamental rights / fairness |

A “safe model” statement says nothing about access control. A “secure platform” says nothing about disparate error. A privacy filter says nothing about lawful purpose. Keep separate claim sets and join them only in the final assurance case.

### 2.5 Agent-specific threat model

An agent turns text generation into state change. Threat-model at least:

- **identity:** whose authority is the agent exercising?
- **delegation:** what may the user delegate, and what may the agent sub-delegate?
- **data boundary:** which data may enter model context or leave the system?
- **untrusted content:** can email, web pages, files, retrieved documents, or tool output inject instructions?
- **tool boundary:** which tools, arguments, records, networks, and environments are reachable?
- **transaction boundary:** what can be committed atomically, previewed, reversed, or compensated?
- **memory:** who can write durable memory, and can poisoned content persist across sessions?
- **supply chain:** which plugins, MCP servers, packages, model endpoints, and remote tools are trusted?
- **termination:** can operators stop the agent and revoke credentials promptly?

A useful heuristic is the **lethal trifecta**: private data, untrusted content, and an external communication channel in the same authority domain. Break at least one leg; do not rely on prompt wording to neutralize all three.

---

## Part 3 — The governance stack

Each layer below lists its purpose, minimum artifacts, engineering controls, acceptance criteria, and characteristic failure.

### 3.1 Specification

**Purpose:** turn broad intent into bounded, prioritized, testable claims.

#### Minimum artifacts

- system purpose and out-of-scope uses;
- user, subject, and affected-population definitions;
- allowed, refused, escalated, and logged behavior;
- decision and action authority;
- measurable quality, safety, security, privacy, and fairness claims;
- risk acceptance criteria and named approver;
- exception and appeal paths;
- versioned system prompt and policy set;
- claim-to-eval map.

Use requirement language deliberately:

- **MUST:** release-blocking or legally/contractually necessary;
- **SHOULD:** expected unless a recorded exception is approved;
- **MAY:** optional behavior.

When requirements conflict, specify precedence. Provider model specifications illustrate two useful patterns: values or constitutional rules, and instruction-authority hierarchies. They are useful inputs, not substitutes for the application specification.

#### Capability-threshold commitments

Frontier developers publish frameworks that link measured capabilities to additional safeguards, including Anthropic’s Responsible Scaling Policy, OpenAI’s Preparedness Framework, and Google DeepMind’s Frontier Safety Framework. These frameworks are voluntary commitments of the publishing companies; names, categories, thresholds, and exceptions change. Their durable engineering idea is:

```text
if measured_condition X is met,
then safeguard Y and approval Z are required before action A.
```

Application teams can use the pattern at smaller scale:

- If the model can execute a defined sensitive task above threshold, restrict access and require external review.
- If an agent reaches a transaction value or data sensitivity threshold, require step-up authentication and human approval.
- If regression exceeds the approved tolerance, block release automatically.

#### Acceptance criteria

A specification is ready when:

- every release-blocking claim has an owner and a test or inspection method;
- conflicts and priority rules are explicit;
- the team can identify what evidence would falsify each claim;
- residual risks have an approver, expiry, and mitigation plan;
- affected people have a defined escalation or appeal path where relevant.

#### Where it breaks

- Prose claims have no executable test.
- The team specifies model behavior but not tool authority or downstream decisions.
- “Human review” is stated without time, information, authority, or reversal.
- A provider’s usage policy is copied into a product spec without matching the product context.
- Requirements are so broad that passing them is unfalsifiable.

**Verdict:** specification is the highest-leverage layer and still the least automated. A repository, review process, schema, and traceability matrix matter more than a governance dashboard.

---

### 3.2 Provenance and lineage

**Purpose:** identify what the system is made of and reconstruct what produced a specific output or action.

#### Upstream lineage

Record, as applicable:

- base-model provider, exact model or weights, version, checksum, license, and terms;
- tokenizer, sampler, quantization, merge, adapter, and inference runtime;
- training and fine-tuning runs, code revision, hyperparameters, and compute;
- datasets, collection method, consent or legal basis, provenance, license, transformations, filters, and deletion process;
- evaluation datasets and contamination controls;
- system and developer prompts;
- retrieval sources, chunking, embedding model, index version, and freshness policy;
- tools, plugins, MCP servers, packages, container images, and permissions;
- safeguard models and policy versions.

Use normal supply-chain controls: signed commits and images, checksums, lock files, isolated builds, vulnerability scanning, secrets management, and change approval. Model registries such as MLflow, experiment systems, data versioning, and cloud catalogs are components, not the whole lineage system.

#### An AI bill of materials

There is no single universally adopted AI-BOM format. [CycloneDX](https://cyclonedx.org/capabilities/mlbom/) supports machine-learning BOM concepts; [SPDX 3.0](https://spdx.dev/use/specifications/) includes AI and dataset profiles. Choose a format that can be generated from the build, record extensions explicitly, and do not wait for perfect convergence.

A minimum AI-BOM should link rather than duplicate authoritative records and include:

```yaml
system_version: assistant-2.4.0
base_model:
  id: provider/model-version
  hash_or_immutable_id: ...
  license_or_terms: ...
training:
  code_revision: ...
  data_manifest: ...
  compute_record: ...
runtime:
  container_digest: ...
  prompt_revision: ...
  retrieval_snapshot: ...
  tool_policy_revision: ...
evaluations:
  release_report: ...
known_limitations: ...
approvals: ...
```

#### Downstream provenance

Two different mechanisms are often called watermarking:

- **C2PA Content Credentials** attach signed provenance and edit-history manifests to media. They are useful while the manifest and trust chain remain intact, but metadata can be removed and absence of a manifest does not prove human origin. See the [C2PA specifications](https://c2pa.org/specifications/).
- **Statistical watermarks** modify generation so a detector can find a signal. Robustness varies by medium, transformation, language, sampling method, and attacker knowledge. A service can enforce its sampler; released weights allow downstream users to replace it.

Treat provenance as positive evidence when present and verified—not as a universal detector of AI-generated content.

#### Acceptance criteria

- Any production output can be linked to an immutable or otherwise identifiable system configuration.
- A material component change triggers the required re-evaluation.
- Training and retrieval data records include provenance, rights, retention, and deletion handling.
- Third-party components have owner, license/terms, security review, update policy, and exit plan.
- Downstream provenance claims state what survives stripping, transformation, or alternative sampling.

#### Where it breaks

- A model card is not cryptographically bound to weights.
- Closed providers may not disclose training data or stable model internals.
- Fine-tunes, merges, quantization, and re-uploads degrade lineage.
- Hosted model aliases can change underneath an application.
- Logs record model name but omit prompt, retrieval, tool, or policy version.

**Verdict:** code provenance is mature; model and data provenance are uneven; output provenance is useful but not a universal truth detector.

---

### 3.3 Evaluation and assurance

**Purpose:** measure behavior and capability under defined conditions, find failures, and support a release or restriction decision.

#### Evaluation types

| Type | Question | Examples |
|---|---|---|
| Task quality | Does the system perform the intended job? | factual accuracy, completion rate, groundedness |
| Behavioral propensity | What does it tend to do? | refusal, abstention, sycophancy, escalation |
| Fairness and subgroup performance | Who bears errors and how unevenly? | false-negative rates by relevant group |
| Safety | What harm can occur without an attacker? | unsafe advice, automation bias, control failure |
| Security | What can an attacker cause? | injection, extraction, poisoning, tool abuse |
| Dangerous capability | Can the system materially assist severe harm? | advanced cyber, biological, autonomy evaluations |
| Human factors | How do people use and rely on it? | override behavior, comprehension, review quality |
| Operational | Does it meet service constraints? | latency, cost, availability, fallback behavior |

**Red-teaming** is adversarial search for unknown or weakly specified failures. It complements rather than replaces a repeatable eval suite.

#### A valid evaluation record

Record:

- system and evaluator versions;
- dataset source, sampling, inclusion criteria, languages, and affected groups;
- elicitation strategy, tools, scaffolding, attempts, and token/compute budget;
- decoding settings and number of samples;
- scorer and rubric version;
- raw outputs or protected references to them;
- confidence intervals or uncertainty where relevant;
- human calibration and disagreement for model-graded tasks;
- known contamination, coverage, and transfer limits;
- preregistered release thresholds where feasible.

#### Elicitation and lower-bound reasoning

A successful demonstration is evidence the evaluated system can produce the behavior under at least those conditions. Failure to elicit a behavior may reflect absence, weak prompts, inadequate tools, insufficient attempts, a narrow dataset, or evaluator failure. Therefore:

> Report “not observed under these test conditions,” not “incapable,” unless additional evidence justifies the stronger statement.

Test both realistic product use and stronger elicitation proportionate to the risk. For agents, vary tool access, environment cues, horizon length, and retry budget.

#### Model-graded evaluation

LLM judges can scale open-ended scoring, but they exhibit position, verbosity, rubric, family, and self-preference effects. Use them as measurement instruments that need calibration:

- blind or randomize candidate order;
- use explicit rubrics and reference anchors;
- sample human review across passes, failures, and boundary cases;
- report judge-human and inter-rater agreement;
- use a different family where self-preference matters;
- retain raw responses so scores can be regraded;
- do not report spurious precision.

#### Contamination and private tests

Public benchmarks may be present in training data or optimized against. Combine:

- private held-out cases;
- newly collected production-derived cases with privacy review;
- dynamic or rolling tasks;
- canaries and access controls for high-value suites;
- public benchmarks for comparability, labeled as such;
- periodic suite refresh without silently changing historical baselines.

#### Distribution and subgroup design

Average performance can conceal unacceptable harm. Stratify by factors that are causally and legally relevant to the use case: language, dialect, accessibility needs, geography, document quality, device, user expertise, or protected characteristics where lawful and necessary. Define the cost of false positives and false negatives for each affected party.

Do not process special-category data casually in the name of fairness. Establish purpose, necessity, legal basis, minimization, access control, and deletion. The EU’s 2026 AI Act amendments include a limited legal basis for certain bias-detection and correction activities subject to conditions; it is not a general exemption from data-protection law.

#### Evaluation in CI and before release

A practical pipeline:

```text
pull request
  └─ smoke suite: deterministic checks, policy examples, schema and tool tests
candidate build
  └─ full quality + safety suite across configured variants
release review
  └─ human review, security tests, subgroup results, residual risk
canary
  └─ production metrics and complaint channels
post-release
  └─ scheduled evals + incident-derived regressions + material-change triggers
```

Not every statistical fluctuation should fail a build. Define minimum effect size, uncertainty treatment, and an exception process.

#### Tools

- [Inspect](https://inspect.aisi.org.uk/) is a mature open framework for model and agent evaluation. Its current documentation describes composable datasets, solvers/agents, tools, and scorers; sandboxing; transcripts; and over 200 pre-built evaluation implementations.
- [promptfoo](https://github.com/promptfoo/promptfoo) is pragmatic for declarative application tests, comparisons, red-teaming, and CI. OpenAI announced an agreement to acquire Promptfoo in March 2026, subject to customary closing conditions; the canonical repository remained MIT licensed on the verification date.
- [lm-evaluation-harness](https://github.com/EleutherAI/lm-evaluation-harness) is useful for reproducible classical benchmarks.
- [HELM](https://crfm.stanford.edu/helm/) supports standardized multi-metric evaluation.
- [garak](https://github.com/NVIDIA/garak) provides automated vulnerability probes and is maintained in NVIDIA’s GitHub organization.
- [PyRIT](https://github.com/microsoft/PyRIT) supports orchestrated generative-AI risk identification. Use the `microsoft/PyRIT` repository; the old `Azure/PyRIT` repository was archived in March 2026 and points to it.

Tool output is evidence about the cases run, not a certification.

#### Where it breaks

- The eval distribution differs from deployment.
- Public scores are contaminated or over-optimized.
- The scorer measures style rather than the intended construct.
- Attackers know the defense and adapt.
- Evaluation-awareness and sandbagging research shows a plausible validity problem, but evidence about spontaneous behavioral impact remains mixed; do not present it as settled.
- Passing thresholds are chosen after results are seen.
- A one-time model eval ignores the application, tools, and human workflow.

**Verdict:** evaluation is indispensable and bounded. The strongest output is a transparent measurement claim with limitations, not the word “safe.”

---

### 3.4 Access and deployment gating

**Purpose:** decide whether, how, and to whom a capability is released.

#### Release is a spectrum

| Release mode | Provider retains | Provider gives up or weakens |
|---|---|---|
| Internal only | direct control, telemetry, revocation | external access and scrutiny |
| Hosted API | policy enforcement, rate limits, account controls, updates | customer-side transparency and some customization |
| Hosted fine-tuning | most service controls | some behavioral predictability |
| Structured external access | controlled scrutiny and evaluation | speed and scale |
| Staged or gated release | learning before broad exposure | immediate reach |
| Licensed open weights | license recourse; publisher documentation | control over downstream runtime and redistribution |
| Permissive open weights | transparency and broad access | publisher-side technical control over downstream use |

Open weights do **not** make governance impossible. They move responsibility. A downstream deployer can and should evaluate, permission, monitor, and audit its own system. The original developer cannot guarantee those controls exist in every deployment and cannot reliably recall released weights.

#### A release gate should consider

- intended benefit and users;
- severity, scale, reversibility, and detectability of plausible harms;
- system capability and elicitation uncertainty;
- exposure to adversaries and untrusted content;
- data sensitivity and action authority;
- monitoring and containment ability;
- open versus hosted release implications;
- external dependencies and jurisdictions;
- unresolved test failures and residual-risk owner;
- whether staged access would preserve learning and optionality.

#### Compute thresholds

Compute thresholds are administrative triggers, not safety guarantees:

- The EU AI Act creates a presumption of systemic risk for a GPAI model trained with more than `10^25` FLOPs, while allowing designation on other grounds.
- California SB 53 defines a frontier model using more than `10^26` integer or floating-point operations, including specified subsequent modification compute; some obligations distinguish “large frontier developers,” including a revenue threshold.

Teams training near relevant thresholds must preserve the calculation method, run boundaries, fine-tuning and reinforcement-learning compute, source records, and approval. Efficiency gains, distillation, and inference-time compute weaken the relationship between training FLOPs and capability, so use compute as a legal trigger and rough proxy—not a claim of safety below the line.

#### Acceptance criteria

- Release mode is an explicit risk decision, not an unrecorded commercial default.
- A release owner signs a dossier containing evidence and residual risk.
- High-risk changes use staged rollout and an observable canary.
- Access tiers, rate limits, identity controls, and revocation are tested.
- Open-weight decisions address irreversibility, downstream documentation, license, misuse, and independent research access.

#### Where it breaks

- Weights or secrets leak.
- Fine-tuning or alternate sampling removes behavioral safeguards.
- Access gates are bypassed by account farming or resellers.
- A release threshold is treated as proof that all risks below it are acceptable.
- A commercial deadline overrides an undefined risk threshold.

**Verdict:** release mode is a first-order control because it determines what can still be monitored, enforced, or revoked.

---

### 3.5 Runtime enforcement

**Purpose:** constrain what data, content, and actions are permitted while the system operates.

#### Four control planes

**1. Data plane**

- classify and minimize data before model use;
- redact secrets and unnecessary personal data;
- isolate tenants and contexts;
- validate retrieval source and freshness;
- treat retrieved and user-supplied content as untrusted;
- prevent durable memory writes without policy checks.

**2. Content plane**

- input and output classifiers;
- format and schema validation;
- grounding and citation checks where appropriate;
- policy rules and escalation;
- rate and volume controls.

**3. Action plane**

- tool allowlists and argument constraints;
- scoped, short-lived credentials bound to the user and task;
- read and write separation;
- sandboxing and network egress limits;
- preview/dry-run before commit;
- human approval for consequential actions;
- transaction value, velocity, and blast-radius limits;
- idempotency, rollback, and compensating actions.

**4. Control plane**

- signed configuration and policy changes;
- separation of duties for policy, model, and permission updates;
- emergency disable and credential revocation;
- protected logs and alerting;
- independent policy enforcement outside the model where feasible.

#### Prompt injection

Prompt injection exploits the fact that natural-language instructions and data share a representation. No generally effective method reliably separates them across arbitrary models, inputs, tools, and adaptive attackers.

Use defense in depth:

- keep untrusted content outside privileged prompts where possible;
- label and delimit data, but do not assume delimiters are a boundary;
- parse trusted structures before model context;
- keep authorization decisions in deterministic code or a reference monitor;
- require explicit provenance for commands and tool arguments;
- apply least privilege, egress controls, and approval gates;
- test adaptive attacks with knowledge of the defense;
- measure both attack success and benign task utility;
- break the private-data/untrusted-content/external-channel trifecta.

Research results vary sharply by benchmark and threat model. Strong results against static attacks have repeatedly weakened under adaptive evaluation. Therefore do not copy a headline percentage into a risk assessment without model, dataset, attempts, attacker knowledge, utility trade-off, and date.

Useful risk taxonomies include the [OWASP Top 10 for LLM Applications](https://genai.owasp.org/llm-top-10/) and [OWASP Top 10 for Agentic Applications](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/). They are community references, not standards of compliance.

#### Human approval as an engineered control

Approval is meaningful only if the reviewer has:

- the authority to stop or change the action;
- enough context to understand it;
- time and workload compatible with careful review;
- an interface that highlights uncertainty and material differences;
- competence for the decision;
- a reason not to rubber-stamp;
- a reversible or compensable action path.

Test reviewer behavior. Measure overrides, missed errors, time per decision, appeal outcomes, and automation bias.

#### Acceptance criteria

- Every tool call is authorized independently of model text.
- The model never receives credentials broader than the task requires.
- Consequential actions have preview, confirmation, limits, and recovery.
- Guardrail thresholds include false-positive and false-negative costs.
- Adaptive red-team tests cover realistic data and tools.
- Emergency disable works in a rehearsal.

#### Where it breaks

- A classifier is treated as the sole security boundary.
- The same model both proposes and authorizes an action.
- Approval fatigue turns human review into ceremony.
- Tool output, retrieved pages, or memory are trusted as instructions.
- Product pressure silently relaxes thresholds.

**Verdict:** use classifiers, but put the strongest controls around authority, data movement, and side effects.

---

### 3.6 Observation, monitoring, and incident response

**Purpose:** detect what happened after release, recognize material change, contain harm, and learn.

#### What to log

For consequential or agentic systems, usually record or derive:

- event time and trace/session ID;
- user, service, tenant, and authorization context;
- exact model endpoint or immutable version;
- prompt and policy revision;
- retrieval query, source identifiers, and snapshot/version;
- tool calls, arguments, authorization decisions, and results;
- guardrail decisions, thresholds, and versions;
- output or a protected reference to it;
- human review, edit, approval, or override;
- downstream effect and outcome where available;
- latency, cost, errors, retries, and fallback.

Do not default to storing every raw prompt forever. Logs may contain personal data, trade secrets, credentials, health information, privileged material, or other regulated content. Define:

- purpose and legal basis;
- data minimization and redaction;
- encryption and regional storage;
- role-based access and audit of access;
- retention and legal hold;
- subject or contractual rights;
- separation of operational, security, and research use;
- deletion propagation to derived datasets.

For some systems, privacy-preserving aggregates, hashed identifiers, sampled content, or tightly controlled secure review stores are better than universal raw logging.

#### What to monitor

- **quality:** task success, groundedness, correction and escalation;
- **distribution:** language, topic, length, source, user, and context shifts;
- **behavior:** refusal, abstention, tool use, retries, and unexpected sequences;
- **fairness:** relevant subgroup error and outcome patterns;
- **security:** injection attempts, exfiltration indicators, anomalous authority use, account abuse;
- **operations:** latency, failure, spend, and fallback;
- **human factors:** override, rubber-stamping, complaints, appeals, and time pressure;
- **provider change:** model alias, policy, endpoint, or safety-filter changes.

An alert is not a control unless it has an owner, threshold, triage path, response time, and authority to act.

#### Incident lifecycle

```text
detect → preserve evidence → triage → contain → notify/escalate
      → eradicate/mitigate → recover/compensate → learn → retest
```

AI-specific incident planning should include:

- switching model, prompt, retrieval, or tools;
- revoking credentials or disabling a capability;
- isolating affected tenants or users;
- correcting external messages or database writes;
- tracing copied or redistributed content;
- handling model-provider incidents;
- reporting to regulators, customers, insurers, or affected people;
- converting incidents and near misses into regression tests.

A rollback may stop future behavior but cannot unsend a message, unpublish content, undo a transaction, or erase reliance. Design compensating actions.

#### Regulatory clocks

Do not reduce incident duties to one universal number. Examples:

- California SB 53 generally requires a frontier developer to report a covered critical safety incident to the Office of Emergency Services within **15 days** of discovery; an incident posing an imminent risk of death or serious physical injury must be disclosed within **24 hours** to an appropriate authority as required by law.
- New York’s RAISE Act (S8828, Chapter 96 of 2026, effective 1 January 2027) requires a covered frontier developer to report a critical safety incident within **72 hours** of determination, plus a separate **24-hour** duty for imminent risk to life or safety — tighter than California’s clock, and worth checking explicitly for any system that spans both jurisdictions.
- EU AI Act reporting varies by role and event; serious-incident duties for high-risk systems and GPAI systemic-risk obligations must be mapped to the exact facts and applicable provisions.
- Privacy, cybersecurity, product, sector, and contract clocks may also apply to the same event.

The runbook should contain a jurisdiction-specific decision tree maintained with counsel—not a paragraph copied from this document.

#### Incident taxonomy

Use a taxonomy that separates:

- model failure;
- data or retrieval failure;
- prompt/orchestration failure;
- authorization or tool failure;
- human-process failure;
- security compromise;
- provider or supply-chain failure;
- policy or requirement failure.

Severity should consider actual and plausible harm, scale, sensitivity, reversibility, spread, legal clock, adversary presence, and whether control was lost—not press attention alone.

#### Where it breaks

- Logs cannot reproduce the configuration.
- A 1% false-positive detector creates an unmanageable queue at production scale.
- Metrics measure cost and latency but no governance decision.
- Complaint and appeal data never reaches engineering.
- Provider changes are not treated as material changes.
- The kill switch exists but has not been tested.

**Verdict:** observation is the bridge from assumed behavior to actual behavior. Design it before launch and govern the observer itself.

---

### 3.7 Assurance, audit, and accountability

**Purpose:** assemble evidence, make an explicit decision, and enable independent challenge.

#### Distinguish the objects

- **Management-system audit:** are required processes and records in place and used? ISO/IEC 42001 addresses this level.
- **Model evaluation or audit:** do the weights or endpoint exhibit specified properties under stated access and tests?
- **Application assurance:** does the deployed system, including people and workflow, meet its claims in context?
- **Compliance assessment:** does the system meet specified legal or contractual requirements?
- **Impact assessment:** what effects, affected people, mitigations, and residual risks are expected or observed?

One cannot substitute for another. A certified management system can operate a poor model. A good benchmark score does not establish lawful processing. A legal checklist does not establish robustness.

#### The assurance case

Use a structured argument:

```text
Top claim
  ├─ subclaim: intended performance is adequate
  │    ├─ evidence: representative eval
  │    └─ evidence: production outcome monitoring
  ├─ subclaim: unauthorized actions are constrained
  │    ├─ evidence: permission architecture
  │    ├─ evidence: adversarial test
  │    └─ evidence: approval and recovery exercise
  └─ subclaim: residual risk is monitored and governed
       ├─ evidence: runbook rehearsal
       ├─ evidence: alert-to-decision workflow
       └─ evidence: named risk acceptance
```

For every evidence item record source, date, system version, independence, method, limitations, and retention location.

#### Auditability by design

- immutable or tamper-evident evidence where warranted;
- trace IDs linking events to versions and decisions;
- separation between artifact author, approver, and independent reviewer for higher risk;
- reproducible test environments or protected snapshots;
- access for auditors proportionate to confidentiality and security;
- recorded exceptions and residual-risk acceptance;
- evidence retention aligned to claims, law, contracts, and appeal periods.

#### EU conformity assessment

The EU AI Act’s high-risk regime requires technical documentation, risk management, data governance, logging, human oversight, and evidence on accuracy, robustness, and cybersecurity, with conformity-assessment routes depending on system category and other applicable product law. The 2026 Digital Omnibus changed timing and several implementation details. Do not generalize “mostly self-assessment” into a universal rule; identify the system’s Article 6 route, annex, sector legislation, harmonized standards, and notified-body requirements.

#### Access determines assurance strength

State explicitly whether the reviewer had:

- documentation only;
- selected developer-produced results;
- API or product access;
- internal logs;
- source and configuration;
- weights;
- training or fine-tuning data;
- ability to choose tests independently;
- ability to publish or escalate findings.

Call documentation-only review an attestation or document review, not an independent model audit.

#### Where it breaks

- Evidence is self-selected and cannot be reproduced.
- The auditor lacks access or technical competence.
- The model changes before the report is issued.
- A broad assurance label obscures narrow tested claims.
- Exceptions have no owner or expiry.

**Verdict:** audit is not a badge. It is a scoped opinion whose strength depends on criteria, access, evidence, independence, and accountability.

---

## Part 4 — Cross-cutting controls the seven-layer diagram can hide

### 4.1 Change management

A “model change” is not the only material change. Trigger impact review and proportionate re-evaluation for changes to:

- model or provider alias;
- quantization, sampler, context window, or inference runtime;
- system or developer prompt;
- tool, permission, plugin, or MCP server;
- retrieval corpus, embedding model, ranking, or freshness policy;
- guardrail model, threshold, or taxonomy;
- user population, geography, language, or business purpose;
- autonomy level or removal of human review;
- data type, retention, or downstream integration;
- law, contract, or provider terms.

Use a change-impact matrix rather than rerunning every test after every edit.

### 4.2 Privacy and data governance

The governance stack can create a surveillance system if logging and evaluation data are not governed. Apply data-protection principles to training, prompts, retrieval, telemetry, human review, and derived eval sets:

- purpose limitation and lawful basis;
- necessity and minimization;
- transparency and rights;
- retention and deletion;
- access and security;
- international transfer and residency;
- data-subject and customer-contract handling;
- separation of production support from model improvement.

“Publicly accessible” is not equivalent to free of privacy, copyright, confidentiality, or terms restrictions.

### 4.3 Fairness and contestability

Fairness is not one metric. Define:

- decision and affected population;
- harm and error costs;
- relevant groups and lawful access to group data;
- metric choice and trade-offs;
- comparator and baseline;
- remedy, explanation, and appeal;
- monitoring for realized outcomes rather than model outputs alone.

If a system affects rights, opportunities, essential services, employment, credit, health, education, or public benefits, build contestability into the workflow. An explanation without a route to correction is not accountability.

### 4.4 Procurement and third-party models

A customer may not control weights or training data, but still controls procurement and integration. Require evidence on:

- exact service and model versions;
- change-notice and deprecation policy;
- data use, retention, location, and training opt-out;
- incident notification and cooperation;
- evaluation access and logs;
- subcontractors and model supply chain;
- uptime, fallback, and export capability;
- IP and indemnity terms;
- security attestations and penetration testing;
- termination, migration, and evidence preservation.

Do not accept “the vendor is compliant” without scope, date, criteria, and applicable product.

### 4.5 Human factors

Evaluate the joint human-machine system:

- Do users understand that the output may be wrong?
- Do confidence displays improve judgment or merely persuade?
- Can reviewers identify meaningful changes rather than reread fluent text?
- Are review queues compatible with careful attention?
- Do users know when and how to escalate?
- Are affected people told when AI materially shaped a decision where required or appropriate?
- Can an operator correct the record and downstream effects?

### 4.6 Security beyond prompts

Prompt injection is only one security problem. Include:

- secure development lifecycle;
- dependency, container, and model-artifact scanning;
- model and data access control;
- secrets and key management;
- tenant isolation;
- training and retrieval poisoning;
- model extraction and denial of wallet/service;
- endpoint, plugin, and MCP authentication;
- build signing and artifact verification;
- weight and checkpoint exfiltration;
- incident response integrated with the security operations center.

Use ordinary security controls first. AI-specific defenses do not replace them.

### 4.7 Accessibility and internationalization

A system that works for the benchmark language, device, or interaction mode may still exclude the people expected to use it. Treat accessibility and internationalization as requirements, not a final interface review:

- define supported languages, scripts, locales, reading levels, and assistive technologies;
- test complete workflows with affected users, including error, escalation, appeal, and recovery paths;
- measure whether translation changes policy, refusal, extraction, or subgroup behavior;
- ensure timeouts, challenge flows, CAPTCHAs, confidence displays, and human-review queues do not create inaccessible barriers;
- preserve a non-AI or assisted route where the AI path cannot serve a user reliably;
- apply relevant accessibility law and standards, such as WCAG, to the product interface while separately testing model behavior.

An English-only eval result is not evidence of equivalent behavior in another language. Interface conformance is not evidence that an AI-mediated decision is understandable or contestable.

### 4.8 Safe shutdown, rollback, and retirement

A “kill switch” is credible only if it can stop consequences, not merely hide the user interface. For consequential or agentic systems:

- place shutdown and credential revocation on a control plane independent of the model;
- define whether each component fails open or fails closed, and why;
- stop new actions, cancel or contain in-flight work, isolate egress, and revoke delegated credentials;
- define safe state, transaction rollback, and compensating actions for effects that cannot be reversed;
- name who can invoke shutdown without waiting for ordinary release approval;
- measure time to detect, decide, stop, contain, recover, and notify;
- rehearse the mechanism and preserve incident evidence.

Retirement is also a governed change. Disable identities, endpoints, scheduled jobs, and integrations; terminate vendor access; dispose of data according to policy; preserve required evidence; communicate replacement and appeal routes; and look for orphaned callers after shutdown.

---

## Part 5 — Law, standards, and frameworks

### 5.1 A legal map for engineers

Ask five questions:

1. **Role:** provider/developer, deployer/operator, importer, distributor, downstream modifier, employer, creditor, health provider, public authority, platform, or processor/controller?
2. **Object:** model, AI system, product safety component, automated decision, generated content, data processing, or online service?
3. **Use and consequence:** prohibited, high risk, regulated sector, material decision, consumer interaction, or low-consequence assistance?
4. **Jurisdiction and reach:** where is the provider, deployer, user, and affected person; where is the output placed on the market or used?
5. **Lifecycle date:** training, placing on market, deployment, material modification, incident, or report deadline?

A product can have several roles and laws at once.

### 5.2 European Union: verified dates as of 28 July 2026

The primary texts are [Regulation (EU) 2024/1689](https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng) and the amending [Regulation (EU) 2026/1744](https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng), the Digital Omnibus on AI, dated 8 July 2026 and published in the Official Journal on 24 July 2026.

Key dates:

| Date | Event or application point |
|---|---|
| 1 Aug 2024 | AI Act entered into force |
| 2 Feb 2025 | Chapters I and II applied, including the original prohibited-practice and AI-literacy provisions, subject to later amendments |
| 2 Aug 2025 | GPAI-model regime and related governance provisions began to apply, subject to Article 113 detail and transition rules for models already on the market |
| 27 Jul 2026 | Regulation 2026/1744 enters into force, three days after publication |
| 2 Aug 2026 | General application date; Article 50 transparency duties apply according to the amended Act’s structure |
| 2 Dec 2026 | Providers of covered generative systems placed on the market before 2 Aug 2026 must comply with Article 50(2); new prohibited-practice provisions on specified non-consensual intimate material and child sexual abuse material apply |
| 2 Dec 2027 | Chapter III Sections 1–3 apply to high-risk systems classified under Article 6(2) and Annex III |
| 2 Aug 2028 | Those sections apply to high-risk systems classified under Article 6(1) and Annex I product legislation |

Important corrections to common summaries:

- The Omnibus is enacted law, not only a Commission proposal or political agreement.
- The marking obligation was not universally “moved to 2 December 2026.” Article 50 remains part of the general 2 August 2026 application structure; the amendment gives systems already on the market before that date until 2 December 2026 to comply with Article 50(2).
- “High-risk deadline” is not one date. Annex III and Annex I systems now have different dates.
- Classification depends on role, intended purpose, exclusions, and the amended definition and provisions—not merely on use of a large language model.

For GPAI models, duties differ between all covered GPAI providers and those with systemic risk. Providers of GPAI models placed on the market before 2 August 2025 have a transition to 2 August 2027 under Article 111(3). The `10^25` FLOP threshold is a rebuttable presumption mechanism, not the sole path to designation and not a safe harbor below it.

### 5.3 United States

There is no single comprehensive federal private-sector AI statute as of 28 July 2026. Federal executive action, agency authority, procurement, sector law, civil-rights law, consumer protection, privacy, intellectual property, cybersecurity, and state law form the operative patchwork.

A December 2025 [executive order](https://www.whitehouse.gov/presidential-actions/2025/12/eliminating-state-law-obstruction-of-national-artificial-intelligence-policy) directed federal work toward a national policy framework and challenges to some state laws. It did not itself erase state statutes. In March 2026 the White House published [legislative recommendations](https://www.whitehouse.gov/wp-content/uploads/2026/03/03.20.26-National-Policy-Framework-for-Artificial-Intelligence-Legislative-Recommendations.pdf); recommendations are not enacted law. Treat preemption as statute- and issue-specific, and verify litigation and congressional action before relying on it.

A June 2026 [executive order on advanced AI innovation and security](https://www.whitehouse.gov/presidential-actions/2026/06/promoting-advanced-artificial-intelligence-innovation-and-security) directs federal initiatives, including classified cyber-capability benchmarking, a voluntary developer framework, and public-private cooperation; executive directions to agencies are not automatically private-sector statutory duties.

#### California SB 53

California’s Transparency in Frontier Artificial Intelligence Act is codified in the Business and Professions Code and effective 1 January 2026. The [official text](https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202520260SB53) defines frontier models using more than `10^26` operations and imposes framework, transparency, whistleblower, and incident provisions with role and size distinctions. Incident reporting includes the 15-day rule and the 24-hour imminent-risk rule described in Section 3.6. Read the code for scope and definitions; do not compress it into “all AI developers must report.”

#### California AB 2013

[AB 2013](https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240AB2013) requires specified public training-data documentation on or before 1 January 2026 and before later covered releases. Its operative scope reaches a generative AI system or service—or substantial modification—released on or after **1 January 2022** and made publicly available to Californians, subject to the statute’s definitions and exceptions. Build a data-manifest pipeline rather than a one-off webpage.

#### New York RAISE Act

New York repealed the original RAISE Act framework and replaced it with a chapter amendment, [S8828, Chapter 96 of 2026](https://www.nysenate.gov/legislation/bills/2025/S8828), signed 27 March 2026 and effective 1 January 2027. The amended Act defines a frontier model using more than `10^26` FLOPs, adds a large-frontier-developer threshold of $500 million or more in annual gross revenue (including affiliates), and requires a published frontier AI framework and safety assessment before deploying a covered model. It creates an oversight office inside the Department of Financial Services, requires large frontier developers to file quarterly internal-risk-assessment summaries, and sets civil penalties up to $1 million for a first violation and $3 million for subsequent violations. Its critical-safety-incident clock is **72 hours** after determination — tighter than California’s 15-day rule — with a separate 24-hour duty for imminent risk to life or safety. A pre-amendment summary of the December 2025 announcement is now stale; read the chapter amendment.

#### Colorado

Colorado repealed the original Colorado AI Act (SB24-205) and replaced it with [SB26-189](https://leg.colorado.gov/bills/sb26-189), signed by Governor Polis on 14 May 2026. The replacement reframes the law around **automated decision-making technology (ADMT)** used to make a “consequential decision” — covered domains include education, employment, financial services, insurance, healthcare, government benefits, and differentiated pricing or terms that could materially limit, delay, or deny access to them — rather than the original’s broader “high-risk AI system” regime. It drops SB24-205’s risk-assessment and attorney-general notice requirements in favor of consumer-facing transparency disclosures and a right to human review after an adverse ADMT-driven decision.

The effective date is 1 January 2027, but treat that date as provisional: x.AI’s federal suit against the original CAIA produced a court-ordered enforcement moratorium covering “SB24-205 or any legislation replacing or amending SB24-205,” running until 14 days after a ruling on x.AI’s preliminary injunction motion. Verify the docket before treating the 2027 date as fixed.

### 5.4 Singapore and other voluntary frameworks

Singapore’s IMDA/PDPC model governance frameworks are influential voluntary guidance, not generally binding AI legislation. The 2026 [Model AI Governance Framework for Agentic AI](https://www.imda.gov.sg/resources/press-releases-factsheets-and-speeches/press-releases/2026/model-ai-governance-framework-for-agentic-ai) focuses on bounded autonomy, human accountability, technical controls, transparency, and lifecycle management. Use it as practical guidance and procurement vocabulary, while mapping separate obligations under data-protection, consumer, sector, and contract law.

### 5.5 Standards and frameworks

| Instrument | Status | Primary engineering use | What it does not prove |
|---|---|---|---|
| [NIST AI RMF 1.0](https://www.nist.gov/itl/ai-risk-management-framework) | Voluntary framework | organize Govern, Map, Measure, Manage activities | compliance or product safety |
| [NIST AI 600-1 GenAI Profile](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence) | Voluntary profile | GenAI-specific risks and actions | that listed controls work in a given system |
| [NIST AI 100-2e2025](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-2e2025.pdf) | Voluntary taxonomy and terminology report, expanded to predictive and generative AI | define adversarial ML concepts, attacks, and mitigations | security certification |
| [ISO/IEC 42001](https://www.iso.org/standard/81230.html) | Certifiable management-system standard | organizational AI management system | quality or safety of a particular model |
| [ISO/IEC 23894](https://www.iso.org/standard/77304.html) | Guidance | AI risk-management process | certification by itself |
| [ISO/IEC 42005](https://www.iso.org/standard/44545.html) | Impact-assessment standard | structure AI system impact assessments | legal compliance in every jurisdiction |
| [ISO/IEC 5259 series](https://www.iso.org/standard/81088.html) | Data-quality series | data quality concepts and process | lawful or representative data automatically |
| [ISO/IEC 27001](https://www.iso.org/isoiec-27001-information-security.html) | Certifiable ISMS | information-security management | AI behavioral safety |
| [C2PA](https://c2pa.org/specifications/) | Technical specification | signed media provenance | universal AI-content detection |
| [OWASP LLM/Agentic Top 10](https://genai.owasp.org/) | Community taxonomy | threat-model prompts and checks | exhaustive or certified coverage |
| [MLCommons AILuminate](https://mlcommons.org/ailuminate/) | Benchmark effort | comparable safety evaluation under its method | application-level safety |

Standards can reduce duplicated control design and make evidence legible. They do not remove the need to define system-specific claims, test them, and address applicable law.

### 5.6 The rest of the law still applies

Depending on context, engineers must also consider:

- privacy and data protection;
- discrimination and civil-rights law;
- employment, credit, housing, education, health, insurance, and public-sector rules;
- consumer-protection and deceptive-practices law;
- product safety, medical-device, machinery, transport, and cybersecurity law;
- intellectual property, publicity, confidentiality, and database rights;
- online-platform, child-safety, and content laws;
- records, discovery, accessibility, and contractual duties.

A system can be outside the EU AI Act’s high-risk category and still be unlawful or negligent under another regime.

---

## Part 6 — Tooling: select by evidence need, not category label

Tool facts change quickly. Verify license, ownership, maintenance, supported versions, data flow, and repository before adoption.

### 6.1 Current reference map

| Need | Practical starting points — verify the exact license | Typical complements | Selection question |
|---|---|---|---|
| Inventory and lineage | MLflow, DVC, OpenLineage, CycloneDX/SPDX profiles | cloud catalogs, W&B | Can it emit an immutable, linkable system record? |
| Application eval in CI | promptfoo | custom pytest/Jest, human review | Can cases, thresholds, raw outputs, and versions be reviewed in Git? |
| Research-grade/agent eval | Inspect | Inspect Evals, private suites | Can it sandbox tools and preserve transcripts and environment? |
| Classical benchmarks | lm-evaluation-harness, HELM | private dynamic sets | Is comparability or product validity the goal? |
| Red-teaming | garak, PyRIT | human adaptive exercise | Does it model an attacker who knows the defense? |
| Output/schema validation | JSON Schema/Pydantic, Guardrails AI | provider structured output | Is enforcement deterministic or another classifier? |
| Conversational rails | NeMo Guardrails | custom policy and classifiers | Does it add value beyond simpler authorization code? |
| Safeguard classifiers | Llama Guard, Granite Guardian, provider services | tuned thresholds and human triage | What are false-positive, false-negative, language, and adaptive-attack results? |
| Tracing and production datasets | OpenTelemetry, Arize Phoenix, Langfuse | existing logs/SIEM | Can traces link to versions, decisions, and protected source data? |
| Drift/data quality | Evidently, whylogs | custom outcome metrics | Does an alert trigger a governed decision? |
| Policy enforcement | OPA/Rego, Cedar, application code | model-assisted classification | Can authorization stay outside model control? |
| Content provenance | C2PA reference tooling | platform integration, statistical marks | What survives stripping and transformation? |
| Mechanistic interpretability | TransformerLens, SAELens | research workflows | Is this exploratory research rather than a production control? |

### 6.2 Tool due diligence

Before adopting a governance tool, record:

- exact repository/package and license;
- active maintainer and ownership;
- latest release and security policy;
- data sent to vendors or model providers;
- supported models, modalities, languages, and agents;
- reproducibility and export of raw evidence;
- test methodology and adaptive threat model;
- false-positive and false-negative evidence;
- integration, operations, and lock-in cost;
- failure mode when unavailable;
- whether the tool measures, enforces, records, or merely displays.

A dashboard that triggers no decision is observability, not governance. A classifier that returns a score is measurement until deterministic policy decides what to do with it.

### 6.3 Corrected fast-moving facts

- **Inspect:** current official documentation says over 200 built-in evaluation implementations; the community register displays a different count because it is a curated registry, not the same object.
- **promptfoo:** OpenAI announced an agreement to acquire Promptfoo on 9 March 2026 and said closing was subject to customary conditions. Do not describe the transaction as closed without a later confirmation. The canonical open-source repository remained MIT licensed on the verification date.
- **PyRIT:** canonical repository is `microsoft/PyRIT`; `Azure/PyRIT` is archived and redirects readers.
- **garak:** canonical repository is `NVIDIA/garak`, Apache-2.0 licensed.
- **Robust Intelligence:** acquired by Cisco; verify product naming and support rather than treating the former company as an independent vendor.
- **Protect AI:** acquired by Palo Alto Networks; verify which tools remain open, supported, or integrated into platform products.
- **Arize Phoenix:** self-hostable and source-available under Elastic License 2.0; do not describe ELv2 as an OSI-approved open-source license.
- **Langfuse:** acquired by ClickHouse in January 2026; the self-hostable repository uses mixed licensing, so inspect the license of the components you deploy.
- **AI-BOM formats:** CycloneDX 1.7.1 includes AI/ML-BOM capabilities, while SPDX 3.0.1 includes AI and Dataset profiles. They overlap but are not interchangeable proof that a manifest is complete.
- **C2PA:** version 2.4 was the current published technical specification on the verification date. A valid manifest proves claims in a signed provenance chain, not that the media is truthful or necessarily AI-generated.

These facts justify quarterly maintenance of tool tables.

---

## Part 7 — A minimum credible implementation

### 7.1 Risk tiers

Use local names, but vary control strength by consequence:

| Tier | Example | Minimum posture |
|---|---|---|
| **T0 — experiment** | synthetic-data notebook with no real users or sensitive data | sandbox, no production credentials, basic provenance |
| **T1 — assistive** | internal drafting with human ownership and no automatic external effect | spec, provider/data review, quality eval, logging proportionate to privacy, feedback |
| **T2 — operational** | customer-facing assistant or internal workflow automation | full seven-layer loop, security tests, monitoring, incident runbook, staged release |
| **T3 — consequential/agentic** | employment, credit, health, benefits, critical operations, write-capable agent | independent review, impact assessment, subgroup/human-factors testing, strict authorization, appeal/reversal, rehearsed incident response, legal mapping |
| **T4 — frontier/critical** | frontier training, dangerous capability, critical infrastructure, broad autonomous authority | capability-threshold framework, strong weight security, external evaluation, board/executive risk decision, regulator/institute engagement as applicable |

Tier on the highest plausible consequence and authority, not the most common happy path.

### 7.2 Six-week baseline for a production LLM system

Time varies with system maturity and risk. The sequence matters more than the estimate.

#### Week 1: inventory, boundary, and claims

- create system record and diagram;
- classify data, users, subjects, consequences, jurisdictions, and authority;
- write allowed/refused/escalated behavior;
- define quality, safety, security, privacy, and fairness claims;
- map each release-blocking claim to evidence;
- name owners and residual-risk approver.

**Exit:** no material component or consequential effect is outside the boundary.

#### Week 2: lineage and test harness

- pin or record model, prompt, retrieval, tools, and policies;
- generate an AI-BOM or equivalent manifest;
- implement smoke and regression tests;
- create private held-out and benign contrast sets;
- preserve raw outputs and metadata.

**Exit:** a candidate build and its evidence are reproducible enough for review.

#### Week 3: runtime authority and data controls

- scope credentials and tools;
- separate read, propose, approve, and commit;
- add schema/argument checks, transaction limits, and egress controls;
- define human approval and recovery;
- add content classifiers where they have a clear role.

**Exit:** model text alone cannot authorize a consequential action.

#### Week 4: tracing and monitoring

- implement trace IDs and versioned events;
- apply privacy and retention controls;
- define quality, security, drift, fairness, and human-process indicators;
- route alerts to named owners with playbooks.

**Exit:** operators can reconstruct a material event and act on alerts.

#### Week 5: adversarial, subgroup, and human testing

- run automated probes and a human adaptive exercise;
- test realistic retrieved and tool content;
- test subgroup and language performance relevant to use;
- test approval behavior, fallback, and appeal;
- convert findings into regression cases.

**Exit:** release dossier shows results, limitations, and unresolved findings.

#### Week 6: release and incident rehearsal

- canary with limited users and authority;
- exercise kill, revoke, rollback, and compensate paths;
- run reporting decision tabletop;
- obtain approval or reject release;
- schedule post-release review.

**Exit:** approval is evidence-based, reversible where possible, and time-bounded.

### 7.3 Release checklist

#### System and responsibility

- [ ] System boundary includes model, prompts, retrieval, tools, data, humans, and downstream effects.
- [ ] Product, engineering, security, privacy, legal/compliance, and incident owners are named.
- [ ] Provider/deployer and other legal roles are mapped by jurisdiction.
- [ ] Risk tier and rationale are approved.

#### Claims and evidence

- [ ] Each MUST claim has a test, inspection, or justified alternative.
- [ ] Thresholds were set before final results or the exception is recorded.
- [ ] Results identify system version, population, conditions, uncertainty, and limitations.
- [ ] Public benchmarks are supplemented with private or production-representative tests.
- [ ] Model-graded results are human-calibrated.

#### Data and lineage

- [ ] Model and system versions are identifiable.
- [ ] Training/fine-tuning/retrieval data provenance, rights, freshness, and deletion are documented.
- [ ] Third-party dependencies, licenses, terms, and change policies are reviewed.
- [ ] Logs and eval data have purpose, access, retention, and deletion controls.

#### Security and agents

- [ ] Threat model includes injection, poisoning, data exfiltration, supply chain, and denial of wallet/service.
- [ ] Tool authorization is external to the model.
- [ ] Credentials are scoped and short-lived where feasible.
- [ ] Consequential actions use limits, approval, preview, and recovery.
- [ ] Adaptive red-team findings are resolved or explicitly accepted.

#### Operations and accountability

- [ ] Monitoring has owner, threshold, response, and escalation.
- [ ] Provider and configuration changes trigger impact review.
- [ ] Kill/revoke/rollback/compensate paths were rehearsed.
- [ ] Complaints, appeals, and affected-person remedies are connected to engineering.
- [ ] Release decision, residual risk, approver, review date, and evidence links are recorded.

---

## Part 8 — Templates

### 8.1 Claim–control–evidence matrix

*Illustrative rows only. Set thresholds from the system context, error cost, evidence, and applicable obligations; these numbers are not universal recommendations.*

| ID | Claim | Risk / failure | Control | Test and threshold | Evidence | Owner | Residual risk / expiry |
|---|---|---|---|---|---|---|---|
| C-01 | Drafts do not send without approval | unauthorized external message | tool policy requires reviewer token | 100% of adversarial cases blocked; integration test | report URI + logs | platform owner | approval-token theft; review in 90 days |
| C-02 | Answers cite only approved corpus | fabricated or unapproved source | retrieval allowlist + citation verifier | ≥99% source ID validity on held-out set | eval URI | ML owner | semantic misreading remains |

### 8.2 Material-change matrix

| Change | Minimum response |
|---|---|
| Prompt wording only, no policy effect | smoke + targeted regression + review |
| Retrieval corpus refresh | provenance/freshness checks + grounding regression |
| Model version or provider alias | full quality/behavior/security suite + canary |
| New write-capable tool | updated threat model + authorization tests + human/rollback exercise |
| New user group, language, or jurisdiction | impact, subgroup, legal, and UX review |
| Guardrail threshold change | false-positive/negative analysis + monitoring update |
| Removal of human review | re-tiering and full release approval |

### 8.3 Evaluation report header

```yaml
evaluation_id: eval-2026-07-26-001
system_version: support-agent-2.4.0
model_version: provider/model-2026-07-01
prompt_revision: 7b5...
retrieval_snapshot: kb-2026-07-24
policy_revision: 91c...
tools_and_permissions: tool-policy-12
population_and_languages: ...
dataset:
  source: ...
  sampling: ...
  private_or_public: ...
elicitation:
  prompts: ...
  tools: ...
  attempts: ...
scoring:
  rubric: ...
  judge: ...
  human_calibration: ...
results:
  point_estimates: ...
  uncertainty: ...
limitations: ...
release_threshold: ...
decision: pass | fail | exception
approver: ...
```

### 8.4 Incident record

```yaml
incident_id: ...
detected_at: ...
reported_by: ...
system_and_versions: ...
affected_users_and_systems: ...
actual_and_potential_harm: ...
data_and_authority_involved: ...
adversary_suspected: true | false | unknown
containment: ...
evidence_preserved: ...
legal_contractual_clocks: ...
notifications_and_rationale: ...
recovery_and_compensation: ...
root_causes:
  - model
  - data_or_retrieval
  - orchestration
  - authorization
  - human_process
  - provider_or_supply_chain
corrective_actions: ...
regression_tests: ...
residual_risk_owner: ...
```

### 8.5 Vendor evidence questions

1. Which exact models and system components does the evidence cover?
2. Can the vendor change the model behind the endpoint without notice?
3. What customer data, prompts, outputs, and telemetry are retained or used for training?
4. What evaluation access, raw results, and incident details can the customer obtain?
5. Which claims were tested by an independent party, with what access?
6. What are the service’s injection, data-isolation, and tool-authorization boundaries?
7. How are subprocessors, plugins, and model suppliers governed?
8. What are the change, breach, safety-incident, and deprecation notice periods?
9. Can data, configuration, traces, and evidence be exported on exit?
10. What claim is expressly *not* supported by the vendor’s certification or report?

---

## Part 9 — What the stack cannot establish

### 9.1 No general “alignment” measurement

Current tools measure constructs and proxies: task success, refusal, harmfulness scores, attack success, human preference, calibration, subgroup errors, or specific capabilities. None provides a general proof that a system will reliably pursue the operator’s intended goals in all novel circumstances.

Say what was measured. Do not upgrade a bounded result into a universal claim.

### 9.2 Guardrails are not proofs

Classifier performance depends on model, language, context, threshold, and attacker. A strong static benchmark result may collapse under adaptive attack. Guardrails remain useful for reducing ordinary misuse, enforcing product policy, and creating signals. Price residual risk explicitly.

### 9.3 Provenance is not detection

A valid signed manifest can show origin and edit history within its trust chain. Missing provenance does not prove human origin. Statistical watermark detection has error and robustness limits. Open-weight users may alter the sampler.

### 9.4 Compute is an imperfect proxy

Training compute is countable and administratively useful. Capability per FLOP changes; inference-time scaling and distillation complicate the relationship. A threshold identifies a regulatory class, not a safe boundary.

### 9.5 Open weights change control, not responsibility

The original developer loses service-side enforcement and universal visibility after release. Downstream deployers retain responsibility for the systems they operate. Independent access also enables scrutiny, reproducibility, regional adaptation, and competition. The decision is capability-, context-, and values-dependent, and release is irreversible in one direction.

### 9.6 Audit strength follows access

A review based on selected documents is weaker than independent testing; API testing is weaker than system and log access for some claims; even weight access does not reconstruct undisclosed training data. State access and independence plainly.

### 9.7 Governance does not replace judgment

Evidence does not choose the acceptable trade-off. The release decision must still weigh benefit, residual risk, distribution of harm, reversibility, uncertainty, and who bears the consequence. Governance should make that judgment explicit and challengeable—not hide it behind a score.

---

## Appendix A — Regulatory and standards quick reference

**Status checked 28 July 2026. Verify the primary text before relying on a date or scope.**

| Instrument | Type | Who or what it addresses | Engineering artifact |
|---|---|---|---|
| EU AI Act, Reg. 2024/1689 as amended by Reg. 2026/1744 | Binding EU regulation | providers, deployers and other operators by role and system category | classification, technical file, risk records, data governance, logs, human oversight, accuracy/robustness/cybersecurity evidence, conformity evidence as applicable |
| EU GPAI regime | Binding EU regulation | providers of covered GPAI models; added duties for systemic risk | model documentation, downstream information, copyright policy and training-content summary; evaluation, systemic-risk, incident and cybersecurity evidence for systemic-risk models |
| California SB 53 | Binding state statute | defined frontier and large frontier developers | framework and transparency publications, incident reporting, employee protections, assessment records |
| California AB 2013 | Binding state statute | defined public generative-AI systems/services released or substantially modified from 1 Jan 2022; publication duties began by 1 Jan 2026 | public training-data documentation |
| New York RAISE Act (S8828, Ch. 96/2026) | Binding state statute, effective 1 Jan 2027 | defined frontier and large frontier developers | frontier AI framework, safety assessments, 72-hour incident reports, quarterly internal-risk summaries |
| Colorado SB26-189 (ADMT) | Binding state statute, effective 1 Jan 2027 pending litigation | developers/deployers of automated decision-making technology for consequential decisions | transparency disclosures, consumer notice, human-review rights |
| NIST AI RMF / GenAI Profile | Voluntary framework | organizations managing AI risk | risk register and Govern/Map/Measure/Manage evidence |
| ISO/IEC 42001 | Certifiable standard | organization’s AI management system | policies, roles, objectives, operational records, internal audit, corrective action |
| ISO/IEC 23894 | Guidance standard | AI risk management | risk process and treatment records |
| ISO/IEC 42005 | Standard | AI system impact assessment | impact-assessment process and report |
| ISO/IEC 5259 series | Standard series | data quality for analytics and ML | data-quality model, measures, management and process records |
| C2PA | Technical specification | media provenance | signed manifest and verification chain |
| OWASP LLM/Agentic Top 10 | Community taxonomy | application and agent security | threat-model and test coverage |

---

## Appendix B — Primary sources and research used for validation

### Law and government

- EU AI Act, Regulation (EU) 2024/1689: <https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng>
- Digital Omnibus on AI, Regulation (EU) 2026/1744: <https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng>
- European Commission AI Act policy page: <https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai>
- European Commission Article 50 code work: <https://digital-strategy.ec.europa.eu/en/policies/code-practice-ai-generated-content>
- California SB 53 official text: <https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202520260SB53>
- California Business and Professions Code §22757.13: <https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&sectionNum=22757.13.>
- California AB 2013 official text: <https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240AB2013>
- New York RAISE Act chapter amendment, S8828 (Chapter 96 of 2026): <https://www.nysenate.gov/legislation/bills/2025/S8828>
- New York RAISE Act original December 2025 announcement (superseded by the March 2026 chapter amendment): <https://www.governor.ny.gov/news/governor-hochul-signs-nation-leading-legislation-require-ai-frameworks-ai-frontier-models>
- Colorado SB26-189: <https://leg.colorado.gov/bills/sb26-189>
- Colorado AI Act repeal and the x.AI enforcement-moratorium summary: <https://www.dwt.com/blogs/privacy--security-law-blog/2026/05/colorado-ai-act-repeal-new-transparency-law>
- White House EO 14365 on a national AI policy framework: <https://www.whitehouse.gov/presidential-actions/2025/12/eliminating-state-law-obstruction-of-national-artificial-intelligence-policy>
- White House March 2026 legislative recommendations: <https://www.whitehouse.gov/wp-content/uploads/2026/03/03.20.26-National-Policy-Framework-for-Artificial-Intelligence-Legislative-Recommendations.pdf>
- White House EO 14409 on advanced AI innovation and security: <https://www.whitehouse.gov/presidential-actions/2026/06/promoting-advanced-artificial-intelligence-innovation-and-security>
- NIST AI RMF: <https://www.nist.gov/itl/ai-risk-management-framework>
- NIST CAISI: <https://www.nist.gov/caisi>
- Singapore IMDA agentic governance framework: <https://www.imda.gov.sg/resources/press-releases-factsheets-and-speeches/press-releases/2026/model-ai-governance-framework-for-agentic-ai>

### Standards and security references

- ISO/IEC 42001: <https://www.iso.org/standard/81230.html>
- ISO/IEC 23894: <https://www.iso.org/standard/77304.html>
- ISO/IEC 42005: <https://www.iso.org/standard/44545.html>
- ISO/IEC 5259-1: <https://www.iso.org/standard/81088.html>
- C2PA specifications: <https://c2pa.org/specifications/>
- CycloneDX ML-BOM: <https://cyclonedx.org/capabilities/mlbom/>
- SPDX specifications: <https://spdx.dev/use/specifications/>
- OWASP GenAI Security Project: <https://genai.owasp.org/>

### Developer frameworks

- Anthropic Responsible Scaling Policy: <https://www.anthropic.com/responsible-scaling-policy>
- OpenAI Preparedness Framework: <https://openai.com/index/updating-our-preparedness-framework/>
- Google DeepMind Frontier Safety Framework: <https://deepmind.google/discover/blog/introducing-the-frontier-safety-framework/>

These are provider-authored commitments and descriptions. Treat factual statements about internal controls as first-party claims unless independently verified.

### Tooling and ownership

- Inspect documentation and evaluation listing: <https://inspect.aisi.org.uk/>
- promptfoo canonical repository and license: <https://github.com/promptfoo/promptfoo>
- OpenAI announcement of agreement to acquire promptfoo (closing described as conditional): <https://openai.com/index/openai-to-acquire-promptfoo>
- PyRIT canonical repository: <https://github.com/microsoft/PyRIT>
- garak canonical repository and license: <https://github.com/NVIDIA/garak>
- Cisco confirmation that Robust Intelligence became part of Cisco: <https://www.cisco.com/site/us/en/products/security/ai-defense/robust-intelligence-is-part-of-cisco/index.html>
- Palo Alto Networks acquisition of Protect AI: <https://www.paloaltonetworks.com/company/press/2025/palo-alto-networks-completes-acquisition-of-protect-ai>

### Evaluation and security research

- Inspect documentation: <https://inspect.aisi.org.uk/>
- Inspect Evals register: <https://ukgovernmentbeis.github.io/inspect_evals/>
- AgentDojo: <https://arxiv.org/abs/2406.13352>
- *A Critical Evaluation of Defenses against Prompt Injection Attacks*: <https://arxiv.org/abs/2505.18333>
- *Lessons from Defending Gemini Against Indirect Prompt Injections*: <https://arxiv.org/abs/2505.14534>
- CaMeL, *Defeating Prompt Injections by Design*: <https://arxiv.org/abs/2503.18813>
- Spotlighting: <https://arxiv.org/abs/2403.14720>
- *AI Sandbagging*: <https://arxiv.org/abs/2406.07358>
- *Probing and Steering Evaluation Awareness*: <https://arxiv.org/abs/2507.01786>
- *Evaluation Awareness in Language Models Has Limited Effect on Behaviour*: <https://arxiv.org/abs/2605.05835>
- *A Systematic Study of Position Bias in LLM-as-a-Judge*: <https://arxiv.org/abs/2406.07791>
- *Benchmark Data Contamination of Large Language Models: A Survey*: <https://arxiv.org/abs/2406.04244>
- *Fine-tuning Aligned Language Models Compromises Safety*: <https://arxiv.org/abs/2310.03693>

Preprints are research evidence, not settled fact. Check publication status, version, code, dataset, and threat model before using a quantitative result.

### Incidents and risk repositories

- AI Incident Database: <https://incidentdatabase.ai/>
- MIT AI Risk Repository: <https://airisk.mit.edu/>

---

## Appendix C — Glossary

**Adaptive attack** — An attack designed with knowledge of the target defense and optimized against it.

**AI-BOM** — A bill of materials linking an AI system to model, data, code, prompt, retrieval, tool, evaluation, license, and version records.

**Assurance case** — A structured argument connecting claims to evidence and explicitly recording assumptions and residual risk.

**Capability evaluation** — A test of whether a system can perform a defined task under stated elicitation conditions.

**Conformity assessment** — A procedure for demonstrating that specified regulatory requirements are met; route and third-party involvement depend on the governing law and system category.

**Construct validity** — Whether a measurement actually measures the concept claimed rather than an easier proxy.

**Contamination** — Evaluation material present in training or otherwise optimized against, weakening the interpretation of a score.

**Deployer** — EU AI Act term for a person using an AI system under its authority, excluding personal non-professional use; other laws use different role terms.

**Elicitation** — Prompting, scaffolding, tools, attempts, fine-tuning, and other effort used to surface a capability.

**Evaluation awareness** — A model’s recognition or inference that it is being evaluated. Evidence that awareness automatically produces strategic behavioral change is not uniform.

**GPAI model** — General-purpose AI model under the EU AI Act; legal definition and obligations should be read in the Act.

**Guardrail** — Runtime mechanism intended to constrain input, output, data, or action. The term does not imply a security boundary.

**High-risk AI system** — A legal classification under the EU AI Act based on Article 6 and annexes, not a generic synonym for any dangerous system.

**Human oversight** — Human ability to understand, intervene, stop, correct, or override within a usable workflow; presence of a person alone is insufficient.

**Indirect prompt injection** — Malicious instructions delivered through content the system consumes, such as a page, document, message, image, memory, or tool output.

**Material change** — A change that can affect risk, behavior, role, evidence, or legal obligations and therefore triggers impact review and proportionate re-evaluation.

**Model card** — Structured documentation of a model’s intended use, development, evaluation, and limitations; not proof that the claims are true.

**Model-graded evaluation** — Use of a model as scorer or judge, requiring calibration and bias controls.

**Prompt injection** — Manipulation that causes instructions in untrusted input to influence model or agent behavior contrary to the governing intent.

**Red-teaming** — Adversarial search for failures, usually less bounded than a fixed evaluation suite.

**Residual risk** — Risk remaining after controls, with named owner and decision.

**Risk acceptance** — Explicit, authorized, time-bounded decision to proceed despite a stated residual risk.

**Sandbagging** — Strategic underperformance intended to conceal capability. Research can induce or demonstrate the behavior under some conditions; prevalence in ordinary deployment is not established by that fact alone.

**System boundary** — The model, data, prompts, retrieval, tools, interfaces, humans, infrastructure, and downstream effects included in a governance claim.

**Watermark** — A signal embedded during generation to support later detection; effectiveness depends on medium, method, transformation, sampler control, and attacker.

---

## Appendix D — Maintaining this document

### Update cadence

| Surface | Cadence | Trigger examples |
|---|---|---|
| Law and regulatory dates | quarterly, and before a release decision | new statute, final rule, court decision, implementation guidance |
| Tool ownership, license, and maintenance | quarterly | acquisition, archive, license change, major security issue |
| Model-provider frameworks | quarterly for frontier work | new framework version, threshold, exception, or risk report |
| Security evidence | quarterly for agentic systems | adaptive attack, new benchmark, architecture change |
| Standards | twice yearly | new edition, technical report, certification requirement |
| Core control-loop frame | annually | evidence that the model/system boundary or assurance method changed materially |

### Source rules

1. Prefer enacted legal text over press releases and proposals.
2. Prefer regulator or standards-body pages over consultancies.
3. Prefer canonical repositories and current licenses over old blog posts.
4. Treat vendor pages as primary evidence of what the vendor claims, not independent proof.
5. For quantitative research, record model, dataset, attack knowledge, attempts, utility, date, and paper version.
6. Mark uncertainty rather than filling gaps with plausible detail.
7. Keep an archived source or citation record for load-bearing release decisions.

### Change log

**Version 2.2 — 28 July 2026**

- Replaced the stale New York RAISE Act summary with the enacted chapter amendment: S8828 (Chapter 96 of 2026), signed 27 March 2026, effective 1 January 2027, `10^26` FLOP and $500M-revenue thresholds, DFS oversight office, and the 72-hour critical-incident clock.
- Added New York's 72-hour incident clock to Section 3.6 alongside California's, since it is the tighter of the two.
- Rewrote the Colorado summary: SB26-189 reframes the law around automated decision-making technology for consequential decisions rather than the original high-risk-system regime, and its 1 January 2027 effective date is subject to a court-ordered enforcement moratorium tied to x.AI's pending federal suit.
- Re-verified EU Digital Omnibus timing and tooling facts; no changes found.

**Version 2.1 — 28 July 2026**

- Added the engineering control-loop illustration. The source-check date remains 26 July because this is a presentation change, not a source recheck.

**Version 2.0 — 26 July 2026**

- Preserved the make/keep/prove frame and seven-stage loop.
- Added inventory and classification as a precondition.
- Corrected deterministic-build and “no patch” overstatements.
- Reframed systemic risk and open weights to avoid categorical claims.
- Added system-boundary, privacy, fairness, human-factors, procurement, change-management, and agent-authorization guidance.
- Rewrote evaluation guidance around construct validity, calibration, contamination, subgroup design, and mixed evidence on evaluation awareness.
- Removed unsupported universal percentages for prompt-injection defense.
- Corrected EU timing using Regulation (EU) 2026/1744, including the distinction between 2 August and 2 December 2026 and the two high-risk dates.
- Added the 24-hour imminent-risk rule alongside California SB 53’s 15-day reporting rule.
- Updated Colorado to SB26-189.
- Corrected current tool ownership/repositories for promptfoo, PyRIT, and garak.
- Added operational templates, release checklist, risk tiers, and source-quality rules.
- Added accessibility/internationalization and tested shutdown/retirement controls after final red-team review.
- Updated the adversarial-ML reference to NIST AI 100-2e2025 and corrected the Appendix A summary of AB 2013.

---

*End of document. Version 2.2, 28 July 2026.*
