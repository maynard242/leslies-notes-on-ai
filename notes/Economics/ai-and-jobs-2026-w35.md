---
title: "AI and Jobs: Week 2026-W35 Evidence"
description: "Draft synthesis of this week's research on ai and jobs."
kind: reading-note
section: Economics
published: "2026-08-29"
updated: "2026-08-29"
status: Draft
topics:
  - economics
  - ai-and-jobs
---

# AI and Jobs: Week 2026-W35 Evidence

Note draft. AI-jobs theme, week 2026-W35.

---

Two papers this week attack the same question from opposite ends: what actually counts as "a job" when AI reshapes work? One redefines occupations from the bottom up using 750 million job ads. The other asks whether AI should even count as a labor substitute in survey research, or become a co-participant in producing knowledge. Together they sharpen a point the pipeline keeps returning to: occupation-level counts hide where the real movement happens.

## What the evidence says

Chen, Fang, Wang & Yang (2026) build a "dynamic O*NET" for China from 752.6 million job postings (2022-2026), splitting employer language into two separate catalogs: 20,721 requirements (what a candidate must hold: credentials, licenses, experience) and 44,479 tasks (what the hire will actually do). The separation matters. The paper's central finding: counting occupations says AI-exposed work is disappearing; counting tasks says far less of it is. Tasks outlive the job titles that carried them. An accountant role vanishing from postings doesn't mean accounting tasks vanished. They migrated into other titles, often behind a higher credential bar. The paper also documents requirements rising since late 2023 as credential gates spread, a labor-market response distinct from any task-content shift.

This validates something Autor et al. (2024) established for the US: over six in ten of today's jobs sit in titles that didn't exist in 1940. Occupational categories are containers that get relabeled while the contents move. What's new here is measurement frequency and grain: monthly instead of years-between-updates, and task-level instead of one national average per title. O*NET's own task list for programmers barely changed between 2015 and 2026, while the actual work of programmers didn't sit still. The instrument was blind to the exact margin that matters for AI exposure research: within-occupation task substitution, the mechanism the task-based literature (Autor, Acemoglu) has theorized for two decades but rarely measured directly at this resolution.

Romberg et al. (2026) work a different seam: whether AI belongs in the survey infrastructure itself, not just as an object of study but as a participant. Their "hybrid panel" concept treats LLMs as one source of responses alongside humans, with planned-missingness designs (some questions answered by the model, rotated across waves) and continuous validation against human answers over time. The paper is candid about the current state: general-purpose LLMs show response biases sensitive to question wording and social-desirability effects (Tjuatja et al., 2024), and no specialized model yet exists for survey research. Full synthetic replacement isn't proposed or defended. The pilot covers only the recruitment phase.

## What it means

The China paper's task/occupation divergence is the more consequential finding for anyone using occupation-level AI-exposure scores (Frey-Osborne, Felten, Eloundou, Handa) as a policy input. If exposure is scored at the task level and tasks migrate rather than disappear, then aggregate "share of jobs at risk" numbers likely overstate displacement and understate the credential-gate effect: workers may keep doing exposed tasks, just behind a harder door to enter. That's a distributional story, not an employment-level one. It shifts the policy question from "how many jobs are lost" to "who can still get in" — closer to a licensing and mobility problem than a headcount problem. Second-order: if this generalizes beyond China, LLM-exposure indices built on static O*NET snapshots (most of the literature) are measuring a moving target with a fixed ruler, and probably in a way that biases toward apparent stability by anchoring to old task profiles.

The survey paper matters more for measurement infrastructure than for jobs directly. If hybrid panels mature, the same wave of labor-displacement research this pipeline tracks may itself start incorporating LLM-generated survey responses. Worth flagging early given the field's evidentiary reliance on self-reported adoption and sentiment surveys, several of which already sit in the wiki's AI Jobs Measurement framework. Contamination risk here is real: any panel using LLMs to fill gaps in labor-attitude surveys needs the bias corrections the authors admit don't exist yet.

## Open questions

- Does the task/occupation divergence replicate outside China's unusually fast-churning labor market, or is the "tasks outlive jobs" pattern an artifact of a market restructuring faster than credentialing can track?
- How much of the "credential gate rising" trend is AI-driven versus general post-2023 labor-market tightening unrelated to AI?
- Hybrid panels: what validation threshold would make LLM-imputed survey responses trustworthy enough to blend with human data at all, and who sets it?
- If task-level measurement becomes standard, do existing LLM-exposure scores (built on static O*NET) need wholesale re-estimation, or just directional caveats?

Occupation counts are a rear-view mirror; task counts are closer to a speedometer. The evidence this week says we've been reading the wrong gauge.
