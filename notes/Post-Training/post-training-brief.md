---
title: "Post-Training in 2026"
description: "An engineering reference to supervised fine-tuning, preference optimization, RLHF, verifiable-reward RL, distillation, agentic environments, and the failure modes that connect them."
kind: "reference"
section: "Post-Training"
published: "2026-07-27"
updated: "2026-07-27"
checked: "2026-07-28"
version: "1.0"
status: "Reviewed"
topics:
  - post-training
  - fine-tuning
  - reinforcement learning
  - preference optimization
  - distillation
  - AI agents
order: 3
---

# Post-Training in 2026

**How foundation models become assistants, reasoners, and agents — a working reference**

*Leslie Teo · July 2026 · last checked 28 July 2026*

---

## TL;DR

**Post-training is not one pipeline. It is a portfolio of feedback loops.** Labs combine supervised examples, human or AI preferences, learned reward models, programmatic verifiers, teacher distributions, and interactive environments. The sequence depends on the behavior being trained.

The cleanest way to understand the field is to separate two questions:

1. **Where does the training signal come from?** Human demonstrations, preference labels, AI feedback, executable tests, environment outcomes, or a teacher model.
2. **How does the model learn from that signal?** Supervised fine-tuning, a direct preference loss, an on-policy RL algorithm, distillation, or checkpoint merging.

That distinction prevents common category errors. RLHF and RLAIF describe the **provenance of feedback** and a broader training recipe. PPO and GRPO describe **policy-optimization algorithms**. RLVR describes a **reward source**. DPO, SimPO, KTO, and ORPO describe **offline objectives for learning from preference-style data**.

Seven conclusions matter in practice:

1. **There is no universal three-stage recipe.** Public pipelines already use different orders and repeat stages.
2. **SFT remains the usual starting point.** It teaches task distribution, format, and interaction style. Its bottleneck is data quality and coverage, not a new optimizer.
3. **Preference optimization is efficient but bounded by its data.** Offline methods can improve behavior without online rollouts, but they do not explore beyond the responses represented by the training distribution.
4. **Online RL matters when outcomes can be tested.** Verifiers for math, code, tools, and environments can reward newly sampled strategies. RL still needs a capable starting policy and a reward that is hard to game.
5. **Distillation copies; RL searches.** Off-policy distillation learns from teacher trajectories. On-policy distillation asks the teacher to grade trajectories sampled by the student, combining relevant states with dense token-level feedback.
6. **Agentic training turns environments into the data engine.** The environment, tools, reset logic, verifier, and sandbox become part of the training specification.
7. **The reward is part of the attack surface.** Strong optimization finds defects in graders, rubrics, tests, and environments. Evaluation and containment must scale with training pressure.

The practical rule is simple: **start with the cheapest method that produces a measured gain on a held-out evaluation, then add complexity only when the failure analysis demands it.**

---

## 1. Scope: what counts as post-training

A useful boundary is:

- **Pretraining** learns broad language, knowledge, representations, and latent capabilities from large corpora.
- **Continued pretraining or mid-training** adds domain knowledge or changes the data distribution before behavior-specific tuning.
- **Post-training** changes how a base model behaves on targeted tasks: following instructions, expressing preferences, reasoning, using tools, refusing unsafe actions, or operating within a workflow.
- **Test-time compute** spends compute during inference through longer reasoning, parallel sampling, search, or verification. It is adjacent to post-training, not a training method.

The boundary is not perfectly standardized. A long domain-adaptation run may be called mid-training by one lab and post-training by another. The useful question is not the label. It is **what information the stage adds and what objective moves the weights**.

Post-training can do several different jobs:

- **Elicit** behavior that the base model can already produce but rarely does.
- **Select** among behaviors according to human, organizational, or safety preferences.
- **Internalize** examples, tool schemas, response policies, or a teacher's behavior.
- **Search** for trajectories that achieve a verifiable outcome.
- **Compress** a stronger or more specialized model into a cheaper student.
- **Integrate** skills learned in separate runs or checkpoints.

It does not reliably manufacture arbitrary missing knowledge. Online RL can discover better strategies when successful trajectories are reachable from the current policy. If the model has no useful probability mass on the required behavior, the usual remedy is better data, a stronger initialization, curriculum design, or a teacher—not more aggressive optimization.

---

## 2. The method map

| Method family | Typical signal | Offline or on-policy? | What it is good at | Main constraint |
|---|---|---:|---|---|
| **Supervised fine-tuning (SFT)** | Demonstrations or accepted outputs | Offline | Format, task adaptation, interaction patterns | Example quality and coverage |
| **Rejection-sampling fine-tuning** | Model samples filtered by a verifier or judge | Usually offline or iterative | Bootstrapping from the model's successful attempts | Filter errors; limited exploration |
| **Reward modeling + RLHF/RLAIF** | Human or AI preferences converted into a learned reward | On-policy policy updates | Sequence-level, subjective behavior | Reward-model error and training complexity |
| **Direct preference optimization** | Chosen/rejected pairs or binary desirability labels | Offline | Simpler preference learning without online RL | Fixed-data ceiling; distribution shift |
| **RL with verifiable rewards (RLVR)** | Tests, proof checkers, exact answers, environment outcomes | On-policy | Math, code, tools, and other checkable tasks | Verifier quality and enough initial successes |
| **Off-policy distillation** | Teacher outputs or logits on teacher-selected trajectories | Offline | Cheap transfer from a stronger model | Exposure bias; teacher-state mismatch |
| **On-policy distillation (OPD)** | Teacher token probabilities on student rollouts | On-policy sampling, dense supervision | Efficient transfer on student-visited states | Teacher log-probability access and cost |
| **Self-play and synthetic curricula** | Tasks and feedback generated by models or environments | Iterative | Expanding training data near the policy frontier | Drift, collapse, and self-confirming errors |
| **Model or checkpoint merging** | Parameters from separately tuned models | Neither | Combining compatible specializations without another full run | Parameter interference; hard-to-predict regressions |

These are not mutually exclusive. A single pipeline may use SFT, rejection sampling, RLVR, general-preference RL, distillation, and a final merge.

### Keep three layers separate

Every post-training design has at least three layers:

1. **Data or environment** — prompts, examples, tools, tasks, and states.
2. **Feedback** — demonstrations, rankings, scores, tests, or teacher probabilities.
3. **Optimization** — the loss or RL algorithm that updates the policy.

A fourth layer sits outside training but determines whether the result is real:

4. **Evaluation** — held-out tasks, graders, safety probes, cost measures, and regression checks.

Changing any one can reverse the result. An apparent algorithm gain may actually come from a better prompt mixture, a stronger judge, more samples per prompt, a different inference budget, or contamination of the evaluation set.

---

## 3. Supervised fine-tuning: teach the target distribution

SFT is next-token prediction on selected input-output examples. It can teach the model to:

- follow instruction and chat templates;
- emit valid schemas and tool calls;
- adopt a response policy or tone;
- solve domain tasks represented in demonstrations;
- imitate longer reasoning traces;
- recover from errors when recovery examples are included.

The algorithm is familiar. The work is in the dataset.

### There is no universal SFT scale

Claims that SFT “typically” requires a fixed number of examples hide more than they reveal. Scale depends on model capability, example length, task breadth, repetition, and how far the target behavior sits from the base distribution.

Two public results show the range:

- [LIMA](https://arxiv.org/abs/2305.11206) fine-tuned a 65B LLaMA model on **1,000 carefully curated sequences** and demonstrated strong instruction-following behavior. The result supports the value of quality and diversity; it does not prove that 1,000 examples are enough for every task.
- NVIDIA reports that [Nemotron 3 Super](https://arxiv.org/abs/2604.12374) used **more than 7 million SFT samples** before a multi-stage RL pipeline. That model targeted a much broader mix, including long context, reasoning, safety, software engineering, and tool use.

The practical target is not a fashionable sample count. It is sufficient coverage of the behaviors and failure modes that matter.

### The main data patterns

**Curated demonstrations.** Human-authored or expert-reviewed examples remain the cleanest way to specify behavior that is difficult to score automatically.

**Rejection sampling.** Generate several candidates, keep outputs that pass a test or judge, and fine-tune on the accepted set. This is sometimes called rejection-sampling fine-tuning or RFT. It can be repeated as the policy improves. It is effective when acceptance is trustworthy and the model already succeeds often enough to produce useful positives.

**Synthetic instruction data.** A stronger model generates prompts, responses, critiques, or revisions. Synthetic data can expand coverage cheaply, but it also copies the teacher's blind spots and style. Use independent filters and preserve a human-reviewed anchor set.

**Distillation.** Train a student on outputs or token distributions from a teacher. Sequence distillation needs only teacher samples; logit distillation needs access to the teacher's token probabilities.

**Mixture design.** Data ratios matter. A stage that improves one domain can regress another. Mix design, replay data, learning rate, and stopping criteria often matter more than the brand name of the optimizer.

### LoRA and QLoRA are update mechanisms

[LoRA](https://arxiv.org/abs/2106.09685) learns low-rank parameter updates rather than changing every model weight. [QLoRA](https://arxiv.org/abs/2305.14314) backpropagates through a quantized base model into LoRA adapters. They change memory, storage, and deployment economics. They do **not** decide whether the learning signal is SFT, DPO, or another objective.

### Where SFT fails

SFT has three recurring limits:

1. **It only reinforces observed targets.** Missing negative cases and recovery paths remain missing.
2. **It is off-policy.** The model trains on trajectories selected by the dataset, not necessarily the states it will visit after its own mistakes.
3. **It can overwrite earlier behavior.** Aggressive or narrow tuning can improve the target metric while degrading general knowledge, calibration, refusal boundaries, or other domains.

A weak SFT result is often a data or evaluation problem. But “the optimizer is never the problem” is too strong: learning rate, packing, loss normalization, adapter rank, regularization, and distributed-training correctness can all decide whether the data is learned cleanly.

---

## 4. Preference learning: specify what “better” means

Demonstrations show one acceptable answer. Preference data says which of two answers is better, or whether one answer is desirable.

The classical [InstructGPT](https://arxiv.org/abs/2203.02155) pipeline has three parts:

1. Fine-tune on demonstrations.
2. Collect pairwise preferences and train a reward model.
3. Optimize the policy against that reward using PPO, with a penalty that discourages excessive drift from a reference policy.

That recipe is commonly called RLHF. The term is now used loosely, so it helps to name the actual components: **who supplied the labels, whether an explicit reward model exists, whether policy updates are online, and which optimizer was used**.

### Reward models

A reward model turns a response into a score. Pairwise human comparisons are often modeled with a Bradley–Terry-style loss: the preferred response should receive a higher score than the rejected one.

Reward models make subjective criteria trainable, but they create a proxy:

- labelers may disagree or apply the rubric inconsistently;
- the model may learn presentation cues rather than substance;
- a fixed reward model becomes stale as the policy moves away from its training distribution;
- stronger optimization exposes regions where the reward is wrong.

The reward model therefore needs its own validation set, calibration checks, disagreement analysis, and adversarial testing.

### DPO: remove the explicit reward-model-and-RL loop

[Direct Preference Optimization](https://arxiv.org/abs/2305.18290) reparameterizes the KL-constrained RLHF objective so the policy can be trained directly on `(prompt, chosen, rejected)` triples. It fits an **implicit** reward through a classification-style loss and avoids online rollout generation during training.

DPO is simpler than PPO-based RLHF, but it does not remove the hard parts:

- the preference data still defines the target;
- a reference policy is normally required;
- hyperparameters still control the trade-off between preference fit and drift;
- offline data may not cover outputs produced by the updated model;
- higher judge scores can conceal regressions in factuality or task capability.

DPO did not “kill RLHF.” It made one important form of offline preference learning much easier. Online RL remains useful when the policy must explore and receive fresh feedback from its own trajectories.

### SimPO, KTO, and ORPO

These methods remove different dependencies. Their published gains are results on particular models and datasets, not a universal ranking.

**[SimPO](https://arxiv.org/abs/2405.14734)** uses length-normalized sequence log probability as a reference-free implicit reward and adds a target margin between chosen and rejected responses. Its paper reported gains over its DPO baselines of up to 6.4 points on AlpacaEval 2 and 7.5 on Arena-Hard. The same paper also documents capability regressions under a higher learning rate on one Llama 3 setup—an example of why chat win rates cannot be the only gate.

**[KTO](https://arxiv.org/abs/2402.01306)** learns from a binary desirable/undesirable signal rather than requiring paired responses. This maps better to production feedback such as approval, rejection, or regeneration events. Those signals are plentiful but confounded: a user may regenerate because of style, latency, curiosity, or a changed intention.

**[ORPO](https://arxiv.org/abs/2403.07691)** adds an odds-ratio preference term to supervised fine-tuning, combining adaptation and preference learning in one stage without a separate reference model. It reduces pipeline steps; it does not eliminate the need for representative preferred and disfavored behavior.

### RLAIF and Constitutional AI

Human labels are expensive and inconsistent. [Constitutional AI](https://arxiv.org/abs/2212.08073) shifts part of the work from judging individual examples to writing principles that guide model critiques and revisions. [RLAIF](https://arxiv.org/abs/2309.00267) uses AI-generated preferences or scores in place of some human feedback.

This changes who writes the specification; it does not remove specification risk. AI judges can show position bias, verbosity bias, self-preference, rubric leakage, and correlated blind spots. High-stakes criteria still need human ownership and independent evaluation.

### Choosing a preference method

| Situation | Sensible starting point |
|---|---|
| High-quality chosen/rejected pairs; limited rollout budget | DPO or a closely tested offline variant |
| Abundant independent like/dislike labels | KTO-style binary feedback, after correcting for user and interface bias |
| Need one compact SFT-plus-preference stage | ORPO, with explicit regression testing |
| A clear subjective rubric but scarce human labels | RLAIF, anchored to a human-labeled audit set |
| Policy must improve on newly sampled behavior | Online RL with a learned or direct judge |

Do not choose from benchmark tables alone. Run the candidates on the same initialization, data, inference settings, and held-out graders.

---

## 5. Online RL and verifiable rewards

Offline preference methods learn from a fixed dataset. Online RL samples from the current policy, scores what it does now, and updates on those trajectories. That feedback loop can discover strategies absent from the static training set.

The strong form of the case is **reinforcement learning with verifiable rewards (RLVR)**: use tasks where an external procedure can check the outcome. Examples include:

- exact-answer math problems;
- unit tests and hidden tests for code;
- proof assistants or constraint solvers;
- tool calls checked against environment state;
- games and simulators with explicit success conditions.

Verifiable does not mean correct by construction. A test may be incomplete. A proof checker may verify the formal statement but not the intended one. An agent may alter the test harness. The verifier is executable specification, with all the risks that phrase implies.

### What DeepSeek-R1 established—and what it did not

[DeepSeek-R1](https://arxiv.org/abs/2501.12948) showed that large-scale RL on verifiable reasoning tasks could elicit behaviors such as reflection, verification, and strategy switching without human-written reasoning traces in the RL stage. DeepSeek-R1-Zero began from a base model and used RL directly. The production R1 recipe then added cold-start data, supervised stages, multiple RL stages, rejection sampling, and general-purpose preference data.

The careful conclusion is:

> Online RL can increase the probability of useful reasoning strategies and discover trajectories not present in a fixed preference dataset, when the base model, task distribution, sampling budget, and verifier make those trajectories reachable.

That is not evidence that RL can create arbitrary knowledge from nothing, nor that every visible chain of thought is faithful.

### GRPO

[Group Relative Policy Optimization](https://arxiv.org/abs/2402.03300) removes PPO's separately learned value model. For each prompt, it samples a group of responses, scores them, and estimates relative advantage from rewards within the group. The group baseline reduces memory and avoids training a critic.

What disappears: the learned value model.

What does not disappear: rollouts, reward computation, a policy model, an old policy for importance ratios, clipping and other stabilization choices, and often a reference-policy or KL term.

GRPO has a sharp operational failure: if every response in a group receives the same reward, the group supplies no useful relative signal. Sampling temperature, prompt difficulty, group size, and curriculum therefore shape training efficiency.

A 2026 theoretical analysis, [*Demystifying Group Relative Policy Optimization*](https://arxiv.org/abs/2603.01162), characterizes the GRPO policy-gradient estimator as a U-statistic and proves asymptotic results under its assumptions. This is useful theory, not a guarantee that any large distributed implementation is unbiased, stable, or correctly rewarded.

### DAPO

[DAPO](https://arxiv.org/abs/2503.14476) addresses failure modes that appear in long-chain reasoning RL:

- **Clip-Higher** gives low-probability tokens more room to increase and helps resist entropy collapse.
- **Dynamic Sampling** removes prompts whose sampled groups are all correct or all incorrect and therefore carry no relative signal.
- **Token-level loss** avoids unintended sequence-length weighting from response-level normalization.
- **Overlong reward shaping** softens the penalty around truncation instead of injecting a hard, noisy boundary.

The paper reports 50 points on AIME 2024 with Qwen2.5-32B, compared with 47 for its cited DeepSeek-R1-Zero-Qwen-32B baseline, using half as many training steps. This is a result on one benchmark and setup, not a general claim that DAPO halves RL cost.

### Outcome and process supervision

**Outcome supervision** scores the final result. It is cheap when answers are automatically checkable, but gives sparse credit and may accept a correct answer reached through a brittle or invalid path.

**Process supervision** scores intermediate steps. [*Let's Verify Step by Step*](https://arxiv.org/abs/2305.20050) found process supervision more effective than outcome supervision on its MATH setup and released 800,000 step-level labels. The trade-off is substantial: step labels are expensive, and process reward models can learn superficial markers or reward plausible-looking reasoning.

Use process supervision when intermediate validity is itself part of the requirement—not merely because denser rewards sound better.

---

## 6. Distillation: transfer the discovered behavior

Distillation and RL solve different problems.

- **RL searches** over trajectories using a reward.
- **Distillation transfers** behavior from a teacher to a student.

A common pattern is to spend expensive RL compute on one model, then distill the resulting behavior into smaller or more deployable models.

### Off-policy distillation

The teacher generates solutions; the student trains on those fixed trajectories. This is simple and works with API-only teachers if generated text is available.

Its weakness is state mismatch. The teacher visits states produced by the teacher. At deployment, the student visits states produced by the student. An early student error can move the trajectory into a region that was absent from the dataset.

Mitigations include:

- sampling from several teachers and temperatures;
- including incorrect attempts with corrected recoveries;
- iterative data collection from later student checkpoints;
- filtering for both correctness and diversity;
- mixing in real target-domain prompts and failures.

### On-policy distillation

In on-policy distillation, the **student samples the trajectory** and the **teacher scores tokens on that trajectory**. The student therefore learns on states it actually visits while receiving denser feedback than a final outcome reward.

The public [Qwen3 technical report](https://arxiv.org/abs/2505.09388) gives a useful controlled comparison from the same off-policy-distilled 8B checkpoint. On its math-and-code subset:

| Method | AIME 2024 | GPQA-Diamond | Reported GPU hours |
|---|---:|---:|---:|
| + Reinforcement learning | 67.6 | 61.3 | 17,920 |
| + On-policy distillation | 74.4 | 63.3 | 1,800 |

The result supports OPD as a serious efficiency method. It does **not** establish a universal 10× law. Cost depends on student and teacher sizes, sequence lengths, rollout engines, teacher-logit access, hardware utilization, and which capabilities the teacher already possesses.

Thinking Machines Lab's [on-policy distillation experiments](https://thinkingmachines.ai/blog/on-policy-distillation/) reproduce the central mechanism with a reverse-KL token loss and report sizable savings against their SFT and RL comparisons. Their own cost discussion makes the assumptions explicit: teacher generation, log-probability computation, and amortization can change the answer.

A 2026 preprint, [*Rethinking On-Policy Distillation*](https://arxiv.org/abs/2604.13016), studies OPD's behavior and recipes further. Evidence is growing, but public replication remains thinner than for SFT or DPO.

### Practical constraints

OPD is not available whenever a stronger chat API is available. It usually needs teacher log probabilities on student-generated prefixes. Many proprietary APIs expose text but not full logits. A local open-weight teacher, a purpose-built inference service, or a provider that supports log-probability queries may be required.

Teacher quality also bounds the target. OPD can efficiently copy a teacher's strategy and mistakes. Keep independent outcome evaluations; do not use teacher agreement as the only success metric.

---

## 7. Agentic post-training: environments become the dataset

Tool use and long-horizon agency turn training into an interaction problem. A static completion cannot represent all states produced by a browser, shell, code repository, customer-service simulator, or scientific instrument.

The training environment now determines:

- which actions exist;
- what observations the model receives;
- how state resets between rollouts;
- whether tools return realistic errors and latency;
- how success is verified;
- what the policy can access or modify;
- how failures are contained.

This moves the bottleneck from collecting rows in a dataset to building **faithful, scalable, and secure environments**.

### One public pipeline

[Nemotron 3 Super](https://arxiv.org/abs/2604.12374) is a useful counterexample to the idea of one standard post-training sequence. NVIDIA reports:

1. SFT on more than 7 million samples;
2. multi-environment RLVR across 21 environments;
3. a separate software-engineering RL stage because those rollouts are slower and longer;
4. RLHF for instruction-following and interaction quality;
5. a final multi-token-prediction healing stage.

The report also describes asynchronous RL across thousands of GPUs. The significant fact is not one model's scale. It is the separation of environments by latency, horizon, reward, and regression risk.

Open infrastructure now includes [NeMo Gym](https://github.com/NVIDIA-NeMo/Gym), [RLFactory](https://arxiv.org/abs/2509.06980), and [Prime Intellect's prime-rl](https://github.com/PrimeIntellect-ai/prime-rl). These systems reduce engineering cost; they do not supply a trustworthy task distribution or verifier automatically.

### Train refusal and recovery as trajectories

An agent should learn more than task completion. Training data and rewards should cover:

- ask for approval before a high-impact action;
- refuse actions outside policy;
- recover from a failed or partial tool call;
- detect inconsistent environment state;
- preserve evidence and explain what changed;
- stop when uncertainty or budget crosses a threshold.

The 2026 [MOSAIC paper](https://arxiv.org/abs/2603.03205) is one example of trajectory-level training for safe multi-step tool use. Treat such results as task-specific evidence, not proof that safety has been solved.

### Security is part of the training system

Never let the policy grade itself through the same channel it can edit. Separate:

- policy credentials from grader credentials;
- writable workspaces from hidden tests;
- network access from the reward service;
- training telemetry from the agent's observation;
- reset and cleanup authority from the rollout process.

A model that patches the tests has not learned software engineering. It has learned the environment.

---

## 8. Self-play and synthetic curricula

Self-play asks models to generate their next training challenge.

**[SPIN](https://arxiv.org/abs/2401.01335)** iteratively trains a model to distinguish its own generated responses from human-written responses, then updates the policy through that game. It reduces the need for new preference labels, but still depends on the quality and coverage of the human data that anchors the discriminator.

**[SPICE](https://arxiv.org/abs/2510.24684)** grounds self-play in a document corpus. One model plays Challenger, mining documents to generate tasks near the Reasoner's frontier; the Reasoner learns to solve them. The paper reports gains of 8.9% across its math evaluations and 9.8% across general-reasoning evaluations on its tested model families. Corpus grounding is the important design choice: it supplies external information and makes tasks less self-referential.

The attraction is an automatic curriculum:

```text
measure weaknesses → generate tasks → attempt tasks → verify → train → repeat
```

The failure mode is a closed loop that writes its own exam and marks its own paper. Preserve external anchors:

- held-out human or real-world tasks;
- independent programmatic verifiers;
- fresh documents or environments;
- diversity and novelty checks;
- periodic manual audits of generated curricula.

---

## 9. Reward hacking: optimization finds the seam

Every post-training method optimizes a proxy. Stronger optimization pressure increases the value of finding a shortcut.

Common forms include:

- **label exploitation** — learning annotator or AI-judge preferences that are unrelated to correctness;
- **style exploitation** — verbosity, confident headings, self-praise, or rubric restatement;
- **verifier exploitation** — passing weak tests while violating the intended task;
- **environment exploitation** — modifying files, clocks, state, or grader inputs;
- **reward tampering** — changing the mechanism that produces or records reward;
- **evaluation overfitting** — improving a public benchmark while losing general capability.

[*Sycophancy to Subterfuge*](https://arxiv.org/abs/2406.10162) studies reward tampering in controlled language-model environments and also documents false positives in its own operational definition. The broader 2026 survey [*Reward Hacking in the Era of Large Models*](https://arxiv.org/abs/2604.13602) organizes mechanisms and open problems. Both reinforce the same lesson: detecting proxy exploitation is itself an empirical problem.

### Defenses

No single defense closes the gap. Use layers:

1. **Keep training reward and final evaluation separate.** Do not promote a checkpoint on the metric it directly optimized.
2. **Use hidden and rotating tests.** Static visible tests invite memorization and patching.
3. **Check invariants outside the model's permissions.** The policy should not edit its grader, audit log, or reset mechanism.
4. **Use multiple graders with different failure modes.** Rules, execution, model judges, and human review should not all share one blind spot.
5. **Measure length, style, and refusal separately.** Many reward hacks appear first as distribution shifts in simple telemetry.
6. **Audit high-reward outliers.** The most rewarded trajectories are where exploitation pays most.
7. **Red-team the reward channel.** Ask explicitly how the policy could earn reward without doing the intended work.
8. **Retain a rollback path.** Store checkpoints, data provenance, reward versions, environment images, and evaluation outputs.

Reward hacking is not a temporary implementation bug. It is a standing cost of optimizing an imperfect specification.

---

## 10. Test-time compute: the second scaling axis

Post-training and inference-time search are complements.

Post-training can teach a model to use longer reasoning productively. Test-time compute then allocates tokens, samples, search steps, or verifier calls to a particular query.

OpenAI reported that o1 performance improved with both [more train-time RL and more test-time reasoning](https://openai.com/index/learning-to-reason-with-llms/). Independent work on [optimal test-time compute](https://arxiv.org/abs/2408.03314) shows that the best strategy depends on problem difficulty and the quality of the proposal and verifier.

Common inference-time methods include:

- longer single-chain reasoning;
- best-of-*N* sampling;
- majority vote or self-consistency;
- verifier-guided selection;
- tree or graph search;
- tool-assisted checking.

More tokens are not automatically more intelligence. Weak verifiers select polished errors, and easy tasks can waste compute. Report accuracy together with token budget, latency, number of samples, and selection method.

---

## 11. Merging and composition

Checkpoint merging is post-training-adjacent: it combines models after separate training runs rather than collecting new feedback.

[Model soups](https://arxiv.org/abs/2203.05482) showed that averaging compatible fine-tuned weights can improve accuracy without extra inference cost. [TIES-Merging](https://arxiv.org/abs/2306.01708) addresses interference by trimming small updates, resolving sign conflicts, and merging aligned parameter changes.

Merging is useful when:

- specializations share the same base model and architecture;
- separate runs learned complementary skills;
- retraining a single multitask model is expensive;
- serving one merged checkpoint is simpler than routing among adapters.

It is not free composition. Two strong specialists can merge into one weaker model. Treat the merge coefficient and method as hyperparameters, then rerun the full evaluation and safety suite.

---

## 12. Evaluation: the stage that makes the others legible

A post-training claim is incomplete without the evaluation protocol.

### Minimum evaluation stack

**Capability.** Held-out tasks that represent the intended use, including easy, hard, and out-of-distribution cases.

**Preference.** Blind comparisons with calibrated human or model judges. Randomize response order and track ties and disagreement.

**Regression.** Knowledge, instruction following, multilingual ability, calibration, refusal boundaries, and base-model tasks that the new stage was not meant to change.

**Safety and security.** Misuse prompts, prompt injection, excessive agency, permission boundaries, reward tampering, and environment escape.

**Operational performance.** Tokens, latency, rollout success, tool errors, GPU hours, memory, and cost per accepted outcome.

**Variance.** Multiple seeds or samples where stochasticity matters. A one-point gain without uncertainty may be noise.

### Evaluation rules

1. Freeze a promotion set before tuning.
2. Keep a second hidden set for final release.
3. Version the model, data, reward, judge prompt, environment, and inference configuration together.
4. Do not use the same model as generator, reward, and final judge without an independent check.
5. Separate pass@1 from best-of-*N* or consensus results.
6. Report the reasoning and token budget.
7. Audit contamination and near-duplicates.
8. Read failures, not only averages.

The right unit is the deployed configuration: model, system prompt, sampling policy, tools, harness, environment, budget, and grader. A bare checkpoint score is useful but incomplete.

---

## 13. A practical sequence for teams without frontier budgets

Most teams should not begin with RL.

### Step 1 — Define the behavior and the gate

Write the target tasks, unacceptable failures, evaluation sets, budget, and promotion threshold before training. Include a no-training baseline: prompting, retrieval, tools, or a better harness may solve the problem more cheaply.

### Step 2 — Start with curated SFT

Use a small, diverse, reviewed dataset. Include ordinary successes, edge cases, refusals, and recovery traces. Run full fine-tuning only when adapters do not provide enough capacity or when deployment economics justify a merged model.

### Step 3 — Add preference learning for subjective quality

Use DPO or another tested offline objective when good chosen/rejected data exists. Use binary-feedback methods only after accounting for interface and user bias. Keep a human-reviewed set that was never labeled by the AI judge.

### Step 4 — Use RLVR only where the verifier deserves trust

Math, code, structured transformations, tools, and simulations are the natural starting points. Measure the base policy's success distribution first. If almost every rollout fails, improve the curriculum or initialization before scaling RL.

### Step 5 — Distill when a teacher already has the behavior

Off-policy distillation is the accessible default. OPD is attractive when teacher log probabilities are available and the student visits states the fixed teacher dataset misses.

### Step 6 — Train agents inside real but contained environments

Build resettable sandboxes, hidden graders, realistic tool failures, approval states, and audit logs. Start with short horizons. Increase horizon only after recovery and credit assignment work.

### Step 7 — Promote by evidence, not training reward

A checkpoint ships only if it passes capability, regression, safety, and operational gates on held-out evaluations.

### Budget guide

| Budget and problem | Highest-return starting point |
|---|---|
| Small team; subjective assistant behavior | Curated SFT, then offline preference optimization |
| Small team; stronger teacher available | Distillation, with independent outcome checks |
| Domain lab; executable tasks | SFT or distillation, then limited RLVR |
| Large lab; multi-domain reasoning | Mixed RLVR, process or learned rewards, replay, distillation |
| Agent developer | Environment and verifier engineering before large RL runs |

The cheapest useful method is usually the one whose failure you can diagnose.

---

## 14. Open questions

### How far can online RL move beyond the base policy?

RL can search and amplify strategies, but success still depends on initialization, sampling, and curriculum. The boundary between elicitation and genuinely new algorithmic behavior remains difficult to measure.

### Can process rewards be made trustworthy?

Dense credit helps, but a process judge can reward plausible form over valid reasoning. Formal verifiers cover only a narrow slice of useful work.

### How should skills be accumulated without forgetting?

Replay, low learning rates, adapters, merging, KL control, and on-policy distillation all help in some settings. None provides a general continual-learning solution.

### How do we compare post-training compute?

GPU-hour figures hide hardware, utilization, sequence length, sampling cost, teacher inference, failed runs, and environment overhead. Public disclosures are too inconsistent for simple ratios.

Cursor's [Composer 1.5 disclosure](https://cursor.com/blog/composer-1-5)—20× more RL than its prior model and more post-training compute than base-model pretraining—shows that post-training can dominate a product's training budget. It does not establish a field-wide norm.

### Who specifies the reward?

Human feedback, AI judges, written constitutions, tests, and environment outcomes all embed choices about whose preferences count and which failures matter. Scaling labels does not settle that question.

### How do we evaluate agents without training to the benchmark?

Long-horizon environments are expensive to build and easy to leak. Fresh tasks, private variants, realistic resets, and independent graders are becoming core research infrastructure.

---

## 15. The durable frame

The preference-optimization alphabet will keep changing. The underlying design problem is stable:

```text
Behavior target
    ↓
Data or environment
    ↓
Feedback signal
    ↓
Update rule
    ↓
Independent evaluation
    ↓
Deployment monitoring and new failures
    ↺
```

SFT teaches examples. Preference learning selects behavior. RL searches against a reward. Distillation transfers what a teacher already knows. Environments make long-horizon behavior trainable. Evaluation tells you whether any of it was real.

The algorithms are increasingly available. The scarce assets are a trustworthy task distribution, a reward that resists shortcuts, and an evaluation the training loop has not already seen.

---

## Selected primary sources

### Supervised tuning and efficient updates

- [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155) — InstructGPT / canonical SFT–reward model–PPO pipeline.
- [LIMA: Less Is More for Alignment](https://arxiv.org/abs/2305.11206) — small, curated SFT study.
- [LoRA](https://arxiv.org/abs/2106.09685) and [QLoRA](https://arxiv.org/abs/2305.14314) — parameter-efficient fine-tuning.
- [Llama 2](https://arxiv.org/abs/2307.09288) — public account of SFT, rejection sampling, reward modeling, and RLHF.

### Preference learning and AI feedback

- [Direct Preference Optimization](https://arxiv.org/abs/2305.18290) — DPO.
- [SimPO](https://arxiv.org/abs/2405.14734) — reference-free, length-normalized preference objective.
- [KTO](https://arxiv.org/abs/2402.01306) — binary desirable/undesirable feedback.
- [ORPO](https://arxiv.org/abs/2403.07691) — combined SFT and preference objective.
- [Constitutional AI](https://arxiv.org/abs/2212.08073) and [RLAIF vs. RLHF](https://arxiv.org/abs/2309.00267) — AI-generated critiques, preferences, and rewards.

### Reasoning and verifiable-reward RL

- [DeepSeekMath](https://arxiv.org/abs/2402.03300) — GRPO.
- [DeepSeek-R1](https://arxiv.org/abs/2501.12948) — large-scale reasoning RL and distillation.
- [DAPO](https://arxiv.org/abs/2503.14476) — long-chain RL stabilization techniques.
- [Let's Verify Step by Step](https://arxiv.org/abs/2305.20050) — process versus outcome supervision.
- [Demystifying GRPO](https://arxiv.org/abs/2603.01162) — 2026 theoretical analysis; preprint.

### Distillation, agents, and self-generated curricula

- [Qwen3 Technical Report](https://arxiv.org/abs/2505.09388) — public RL and on-policy-distillation comparison.
- [On-Policy Distillation](https://thinkingmachines.ai/blog/on-policy-distillation/) — mechanism, implementation, and experiments from Thinking Machines Lab.
- [Rethinking On-Policy Distillation](https://arxiv.org/abs/2604.13016) — 2026 preprint and open code.
- [Nemotron 3 Super](https://arxiv.org/abs/2604.12374) — public multi-stage agentic post-training pipeline.
- [NeMo Gym](https://github.com/NVIDIA-NeMo/Gym), [RLFactory](https://arxiv.org/abs/2509.06980), and [prime-rl](https://github.com/PrimeIntellect-ai/prime-rl) — open environment and RL infrastructure.
- [SPIN](https://arxiv.org/abs/2401.01335) and [SPICE](https://arxiv.org/abs/2510.24684) — self-play and corpus-grounded curricula.
- [MOSAIC](https://arxiv.org/abs/2603.03205) — safe multi-step tool-use training; 2026 paper.

### Evaluation, reward hacking, and composition

- [Sycophancy to Subterfuge](https://arxiv.org/abs/2406.10162) — reward-tampering experiments.
- [Reward Hacking in the Era of Large Models](https://arxiv.org/abs/2604.13602) — 2026 survey; preprint.
- [Learning to reason with LLMs](https://openai.com/index/learning-to-reason-with-llms/) and [Scaling LLM Test-Time Compute Optimally](https://arxiv.org/abs/2408.03314) — train-time and test-time scaling.
- [Model soups](https://arxiv.org/abs/2203.05482) and [TIES-Merging](https://arxiv.org/abs/2306.01708) — checkpoint composition.

---

## Version history

- **Re-checked 28 July 2026.** Verified the Cursor Composer 1.5 disclosure (20× more RL, post-training compute exceeding base pretraining) and NVIDIA's Nemotron 3 Super RLVR details (21 environments, multi-stage curriculum) against primary and current secondary sources; both confirmed accurate. No corrections found; content unchanged.
- **1.0 — 27 July 2026.** Reframed the original briefing around feedback sources and update rules; corrected claims about fixed pipelines, DPO, GRPO, compute, and capability creation; added reward modeling, method-selection tables, evaluation gates, agentic environments, merging, primary citations, and operational guidance.
