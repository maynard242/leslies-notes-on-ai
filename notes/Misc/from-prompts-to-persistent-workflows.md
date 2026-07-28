---
title: "From Prompts to Persistent Workflows"
description: "A practical map of six capabilities that move AI from a one-off chat to a dependable recurring workflow—and the controls that should grow with them."
kind: "guide"
section: "Misc"
published: "2026-07-28"
updated: "2026-07-28"
checked: "2026-07-28"
version: "1.0"
status: "Reviewed"
topics:
  - AI adoption
  - AI agents
  - tool use
  - workflow design
order: 1
---

# From Prompts to Persistent Workflows

**AI becomes more useful when a question becomes a job—but every increase in capability should come with a clearer control boundary.**

[Claude in Action](https://claude-in-action.vercel.app) is a tutorial built around six increasingly capable ways to work with Claude: reasoning over context, tool use, long context, connected data, background and parallel work, and reusable agents. This note keeps the transferable operating lesson. It is not a product comparison, a claim about any vendor's current features, or a prescription to automate every task.

The useful shift is from asking a model for an answer to designing a bounded piece of work: what information it may use, what it should produce, what it may change, how it is checked, and when a person takes over.

## The capability map

| Capability | What changes | The practical question |
|---|---|---|
| **Reasoning over context** | The model can interpret a supplied thread, document, image, or brief against stated criteria. | What context, judgment criteria, and output format would let someone else do this task well? |
| **Tool use** | The model can retrieve fresh information, inspect files, run code, or create a defined artifact. | Which narrow tools would remove the manual lookup or formatting step? |
| **Long context** | The model can compare a curated set of documents in one task. | Which contradictions, patterns, or missing questions only become visible across the set? |
| **Connected data** | The work can combine evidence from more than one approved system. | What useful question sits between systems rather than inside one of them? |
| **Background and parallel work** | The task can run over time, on a schedule, or across independent sub-tasks. | What should trigger a report, how much work is justified, and what must wait for review? |
| **Reusable agents** | A recurring workflow becomes a named, repeatable package of instructions, inputs, tools, and checks. | Which repeated task has stable enough inputs, outputs, and acceptance criteria to deserve a reusable workflow? |

These are not six rungs that every team must climb. They are capabilities to add only when the task earns them. A careful, well-contextualized one-off prompt is often better than an overbuilt agent.

## The design rule: add capability only when the job is clear

A prompt is enough when the work is short, reversible, and easy to inspect. The next step should solve a specific constraint:

1. **Add context** when generic answers are not useful.
2. **Add a tool** when the work needs fresh evidence, computation, or a durable artifact.
3. **Add more documents** when comparison—not retrieval—is the real task.
4. **Connect systems** when the answer depends on their relationship, not merely a larger pile of data.
5. **Run in the background or in parallel** when the job is genuinely time-consuming, recurring, or divisible.
6. **Package the workflow** when the same goal, inputs, and output structure recur often enough to justify maintenance.

The sequence matters because each addition widens either the model's view of the world, the actions it can take, or the time for which it can act. Those are different kinds of risk. A connection to a calendar is not the same as permission to send a message; a scheduled briefing is not the same as an automated trade or deployment.

## A control boundary for each step

The tutorial's most useful operational insight is that the human role changes rather than disappears. The person sets the question, constraints, and decision rule; the system does bounded work; the person reviews consequential output or approves consequential action.

| If you add… | Also define… |
|---|---|
| **More context** | What may be shared, what is missing, and what the model must not infer as fact. |
| **Tools** | A narrow allowed action set, source or artifact provenance, and a check on the result. |
| **Connected data** | Least-privilege access, a clear purpose for every connection, and a way to revoke it. |
| **Schedules or parallel workers** | Trigger conditions, budget and fan-out limits, ownership, cancellation, and a review point. |
| **A reusable agent** | Versioned instructions, stable inputs and outputs, acceptance checks, and a safe failure mode. |

For high-stakes work, use independent evidence and human approval before an external effect. A model can draft a message, recommend a trade, or prepare a change; those are not reasons to let it send, trade, or deploy without an appropriate control.

## A practical adoption path

Start with one annoying but reversible task from the past week. Give the model the real context, the decision criteria, and the desired output. Inspect the result.

If that works, ask what blocked the next useful version of the job. It may need a reliable source, a small tool, another document, or a recurring schedule. Add one capability at a time and keep the workflow legible enough to explain, test, and stop.

When you notice the same setup repeating, write it down. The durable skill is not clever prompting. It is **workflow articulation**: being clear about the trigger, inputs, steps, expected output, checks, and the moment a person must decide.

## When not to use it

Do not force an AI workflow onto work that is faster to do yourself than to specify, depends on a relationship or private context you cannot safely share, has no clean approval path, or is costly to reverse. Automation is a design choice, not a default.

## Sources and verification

- [Claude in Action](https://claude-in-action.vercel.app) — Leslie Teo's tutorial, accessed 28 July 2026. Primary source for the six-capability teaching arc and its practical examples. Product-specific descriptions, pricing, and vendor claims were intentionally not carried into this vendor-neutral note.
- [Harnesses](/notes/harnesses) — related reference on why agent behavior belongs to a model–harness–environment configuration, and on the control, verification, and approval layers that make longer-running workflows safe enough to operate.

## Change history

- **28 July 2026 — v1.0:** Initial reviewed distillation of *Claude in Action* into a vendor-neutral guide for identifying, designing, and controlling increasingly capable AI workflows.
