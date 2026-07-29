---
title: "Evaluating Multilingual and Cultural Capability"
description: "How to use SEA-HELM and complementary tests without mistaking one multilingual or cultural benchmark score for readiness."
kind: "reference"
section: "Training"
topics:
  - "evaluation"
  - "SEA-HELM"
  - "multilingual models"
  - "cultural evaluation"
  - "Southeast Asia"
published: "2026-07-29"
updated: "2026-07-29"
checked: "2026-07-29"
version: "1.0"
status: "Reviewed"
order: 3
---

# Evaluating Multilingual and Cultural Capability

A model does not become multilingual because it can produce a sentence in many languages. It does not become culturally grounded because it can name a country’s food, festival, or capital. And it does not become suitable for Southeast Asia because its regional benchmark scores average well.

Evaluation has to separate several questions:

- Can the model parse and generate the language?
- Can it reason when the task is expressed in that language?
- Does it know facts and everyday context from the relevant community?
- Can it follow instructions and sustain a useful conversation?
- Is it safe and appropriate in that language and context?
- Does it work consistently across prompts, runs, dialects, domains, and user groups?
- What does it cost in tokens, latency, and memory?

SEA-HELM—SouthEast Asian Holistic Evaluation of Language Models—is a maintained regional suite built to make these questions measurable. Its value is not just the leaderboard. It gives model builders a common target, exposes gaps hidden by English benchmarks, and creates a public place where new languages and community-designed tasks can be added.

Its limits matter too. No finite suite can certify “cultural understanding.” Benchmarks compress a moving, plural society into items, prompts, metrics, and aggregates. A strong evaluation system therefore needs both standardization and humility.

> **Short version:** use SEA-HELM as the shared regional spine, not the whole evaluation body. A score is produced by a pipeline; inspect the construct, data, prompt, inference settings, parser, metric, aggregation, uncertainty, and missing coverage.

## 1. What exactly are we trying to measure?

“Multilingual capability” combines different constructs that can move independently.

### 1.1 Language proficiency

This includes orthography, morphology, syntax, semantics, pragmatics, discourse, and generation quality. A model may recognize a language but make grammatical errors. It may answer multiple-choice questions while producing unnatural free text. It may handle formal news but fail on colloquial code-switching.

### 1.2 Cross-lingual transfer

A model trained heavily in English may solve a Thai question by mapping it into an English-centered internal representation. That can be useful. It is not the same as learning from and operating naturally within Thai data.

Parallel benchmarks such as [Belebele](https://arxiv.org/abs/2308.16884) are valuable here. Because the reading-comprehension content is aligned across 122 language variants, differences can reveal a cross-language performance gap under closely matched semantics. But parallel construction also means the task originates from one content distribution; it does not represent the full native discourse of every language. This is not a hypothetical concern for SEA-HELM: Belebele is the reading-comprehension task the suite itself uses for Malay, Burmese, and its other newest languages, so the single-content-distribution caveat above applies directly to part of SEA-HELM's own scoring, not only to benchmarks it sits beside.

### 1.3 Factual and domain knowledge

A model can be linguistically fluent but lack local law, institutions, history, geography, products, names, or public-service knowledge. Conversely, it can memorize local facts but fail to explain them naturally.

Knowledge evaluations should distinguish closed-book factual recall, reasoning over supplied evidence, and retrieval-augmented performance. These are different system capabilities.

### 1.4 Cultural knowledge and judgment

Culture includes everyday practices, etiquette, institutions, identities, values, humour, taboo, social relations, and context-sensitive expectations. Many questions have several valid answers. Answers vary by age, ethnicity, religion, class, location, and time.

This makes cultural evaluation harder than checking capital cities. [BLEnD](https://arxiv.org/abs/2406.09948), for example, asked native annotators about ordinary practices across 16 countries or regions in 13 languages. Its premise is sound: everyday knowledge is often missing from web sources such as Wikipedia. [CulturalBench](https://arxiv.org/abs/2410.02677) went further by collecting and verifying challenging questions across 45 global regions, allowing multiple valid answers during annotation.

These benchmarks measure selected cultural knowledge under a defined protocol. They do not assign a single true culture to millions of people.

### 1.5 Behaviour and safety

Users need models that follow instructions, preserve the requested language, refuse harmful requests appropriately, avoid unwanted stereotypes, and remain helpful across turns. Safety policies created and tested only in English can fail when prompts are translated, code-switched, euphemistic, or culturally indirect.

Safety evaluation must therefore be multilingual and locally contextual. It also needs separate measures for over-refusal: a model that refuses ordinary discussions of politics, religion, health, or identity is not safe in a useful sense.

### 1.6 Efficiency

A model that achieves the same accuracy but uses twice as many tokens in one language provides less context and costs more to run. Evaluation should include [tokenizer efficiency](/notes/multilingual-tokenizers), latency, throughput, and memory on realistic inputs.

This was part of the original [HELM](https://arxiv.org/abs/2211.09110) philosophy: evaluate multiple scenarios and multiple metrics, make the omissions explicit, and standardise conditions so comparisons mean something.

## 2. Why translated English benchmarks are not enough

Translation is indispensable for scaling evaluation. It is also a source of distortion.

### 2.1 Translationese

Translated text can retain the source language’s sentence structure, discourse, and assumptions. A fluent native speaker may find it grammatical but unnatural. A model can score well because it has seen similar translated corpora, not because it handles native usage.

SEA-HELM’s paper explicitly prioritised datasets originally written in the target language where possible, and otherwise used careful human translation. The authors framed machine-translated and lightly verified benchmarks as a cultural-authenticity risk, not just a translation-quality issue. See [Susanto and colleagues’ SEA-HELM paper](https://arxiv.org/abs/2502.14301).

### 2.2 Construct drift

An English question may stop measuring the same thing after translation. A pun disappears. A grammatical distinction becomes explicit. A wrong answer becomes implausible. A school or legal concept has no direct equivalent.

Back-translation can catch gross errors, but it cannot prove construct equivalence. The target-language item needs review by someone who understands both the subject matter and the local language.

### 2.3 Cultural substitution

Replacing “baseball” with a local sport or “Thanksgiving” with a local holiday makes an item more familiar, but it also creates a new item. That may be appropriate. It should be labeled as adaptation, not translation.

A useful benchmark keeps provenance at item level:

- native original;
- human translation;
- machine translation plus human review;
- cultural adaptation;
- synthetic generation;
- imported unchanged.

Scores can then be disaggregated by provenance.

### 2.4 Language and culture are confounded

If a model answers an Indonesian cultural question incorrectly in Indonesian, three explanations are possible: it did not understand the language, it lacked the knowledge, or it failed the reasoning task.

A paired design helps:

| Content | Prompt language | What the comparison suggests |
|---|---|---|
| Same regional item | English and local language | Language-access gap |
| Same local-language task | Native and translated item sets | Translation artifact |
| Same reasoning form | Local and non-local knowledge | Knowledge/cultural gap |
| Same answer content | Multiple prompt templates | Prompt robustness |

No comparison identifies one cause perfectly, but the matrix is much more informative than a single accuracy score.

## 3. SEA-HELM’s five-pillar design

The original 2025 SEA-HELM release supported **Filipino, Indonesian, Tamil, Thai, and Vietnamese**. It organized tasks into five pillars and standardised prompts and evaluation. The [paper](https://arxiv.org/abs/2502.14301) and [open repository](https://github.com/aisingapore/SEA-HELM) are the primary references.

### 3.1 NLP Classics

This pillar covers established natural-language tasks:

- sentiment analysis and extractive question answering;
- translation and abstractive summarization;
- natural-language inference and causal reasoning.

These tasks remain useful because they separate basic comprehension and generation from chat behavior. They also provide historical comparability. Their weakness is saturation and narrowness: a model can learn benchmark format or dataset artifacts without becoming broadly capable.

Metric choice matters. Classification accuracy is easy to compare. Extractive QA may use exact match and token-level F1, but token boundaries are language-sensitive. Summarisation metrics based on n-gram overlap can punish valid paraphrases. Translation metrics have improved beyond BLEU, yet learned metrics inherit model and language coverage biases. SEA-HELM's own translation tasks score against FLORES using MetricX-24, a concrete instance of that caution rather than an abstract one.

### 3.2 LLM-specifics

SEA-HELM includes tasks designed for modern instruction models:

- **SEA-IFEval**, which tests whether a model follows verifiable instructions in regional languages;
- **SEA-MTBench**, which tests multi-turn conversational performance with an LLM judge.

Instruction following is more than answer correctness. A model may know the answer and still violate a word limit, output format, language constraint, or requested structure. Verifiable constraints should be scored with deterministic checkers where possible.

Multi-turn chat is inherently harder to score. Open answers have no single reference, so an LLM judge compares or rates them. This captures qualities that exact match misses, but adds another model to the measurement chain.

### 3.3 SEA Linguistics

This pillar asks whether a model handles language-specific phenomena rather than only translated tasks. The original suite included **LINDSEA**, with granular diagnostics in Indonesian and Tamil.

Linguistic minimal pairs are powerful. If two sentences differ in one controlled feature, the test can target morphology, syntax, semantics, or pragmatics. However, acceptability is not always binary. Dialects and registers vary, and an annotator’s judgment is not a complete grammar.

A strong diagnostic dataset records phenomenon labels, source grammar or linguistic rationale, dialect, and annotator agreement. It should test generation as well as recognition where feasible.

### 3.4 SEA Culture

The suite incorporates culture-focused evaluation, including **KALAHI** for Filipino cultural knowledge, and integrates regional resources under the broader SEA-HELM framework. A later addition, **SEA-NLI**, is the first culture-competency task with region-wide coverage rather than a single-language one: its prompts explicitly instruct the model to answer "as a native speaker who understands the culture, social norms, and daily life" of the relevant Southeast Asian society, scored for the implied meaning rather than the literal one, with a separate "hard" subset for harder cases.

Culture tasks should avoid two traps:

- **tourist trivia:** famous food, flags, festivals, and monuments;
- **essentialism:** presenting one practice as what an entire country “does.”

Better tasks include everyday institutions, local public services, language use, etiquette, history, media, and context-sensitive scenarios. Questions should permit multiple answers where reality does. Annotator metadata and disagreement should inform the metric rather than being discarded.

### 3.5 Safety

In the original paper, the Safety pillar began with toxicity-detection classification in Filipino, Indonesian, Thai, and Vietnamese. The later repository adds SEA Safeguard Bench tasks that evaluate prompts and generated responses more directly.

Safety evaluations should cover:

- direct harmful requests;
- obfuscated and code-switched requests;
- local slurs and stereotypes;
- political, religious, and inter-group contexts;
- self-harm and health scenarios;
- response helpfulness after a refusal;
- false positives on benign content.

A classifier trained on English labels is not sufficient. Native review is required for both attacks and refusals.

## 4. The paper is a snapshot; the suite is a living system

This distinction is important when citing SEA-HELM.

The 2025 paper describes five languages and the original task suite. The repository’s June 2026 README documents subsequent expansion. By January 2026, SEA-HELM had added Malay and Burmese and announced task additions for Lao and Khmer; it also added knowledge and vision categories and moved to eight-run leaderboard evaluation. The June 2026 update added English and long-context evaluations, SEA Safeguard Bench, criteria-based judges, and code evaluation infrastructure.

The live suite now has broader coverage than the paper, but not every announced language has every task. At the reviewed commit, the default `seahelm` task configuration schedules Indonesian, Vietnamese, Thai, Tamil, Filipino, Malay, and Burmese—not Lao or Khmer. The two are not symmetric gaps: the configuration's own supported-language comment lists Khmer as a target the suite is built to reach, while Lao is not listed at all. Treat both as announced or partial coverage unless separately configured, and keep missing cells visible.

This is a strength. A regional benchmark should grow through language experts and community contributions. It also creates a versioning obligation: every published score needs the SEA-HELM commit, dataset revisions, task list, prompt configuration, model endpoint or checkpoint, and judge version.

The repository’s current [score-calculation specification](https://github.com/aisingapore/SEA-HELM/blob/7b0c61944d058ec50b18ff47ab38e3172c7b1729/docs/score_calculations.md) is unusually explicit. It uses eight independent runs per model, draws 30 bootstrap replicates from those runs, and uses model-specific generation defaults where available. For applicable tasks, it presents native-language prompts zero-shot to instruction/reasoning models and five-shot to base models; enabling `--base_model` also disables MT-Bench. Scores are normalized against a task baseline, then aggregated from task to competency, language, and overall SEA levels. The spec's own competency list is already behind its config: it names seven competencies and omits Knowledge, even though tasks such as Global MMLU Lite and a Thai knowledge exam are scheduled under a `knowledge` competency in the same repository. These are defensible choices, not neutral facts of nature. Model-specific decoding and different adaptation regimes for base and instruction checkpoints remain part of the measured configuration.

## 5. The evaluation pipeline creates the score

A benchmark result is not a direct observation of model capability. It is the output of a pipeline:

```text
construct
  -> dataset items
  -> prompt and demonstrations
  -> tokenizer / API
  -> decoding settings
  -> raw completion
  -> parser or judge
  -> item metric
  -> aggregation
  -> reported score
```

Each arrow can change rankings.

### 5.1 Prompt templates

Prompt language, politeness, role markers, answer labels, and instructions affect performance. Multiple-choice evaluation is especially fragile:

- Does the model output `A`, the answer text, or a sentence?
- Are answer choices labeled with Latin letters in every language?
- Is the answer scored by generation or by token likelihood?
- Is probability length-normalized?
- Are demonstrations included, and are they translated?

A model’s native chat template should generally be used for instruction checkpoints, but comparison then mixes model and template. A common template improves standardization but may disadvantage a model trained on another format. The right solution is to document both and, for important comparisons, run a template-sensitivity check.

### 5.2 Decoding

Greedy decoding is reproducible but may not reflect recommended product settings. Sampling reflects actual chat use but introduces variance. Maximum length, stop sequences, temperature, top-p, repetition penalties, and system prompts all matter.

The eight-run protocol described above is a substantial improvement for stochastic generation. The result should still report dispersion, not only the mean.

### 5.3 Parsing

A model can give the correct answer in an unexpected format and receive zero. A permissive parser can accidentally extract a guessed option from the explanation. Parsing rules should be deterministic, tested on adversarial examples, and reported as part of the benchmark.

For generative tasks, store raw completions. This makes re-scoring possible when a parser or metric changes.

### 5.4 Metrics

Use the metric that matches the construct:

- classification: accuracy, macro-F1, weighted accuracy where classes are imbalanced;
- QA: exact match plus language-aware F1 or semantic measures;
- translation: multiple automatic metrics plus human review on a sample;
- summarization: overlap, factuality, and human or model-based quality;
- instruction following: deterministic constraint checks;
- open chat: rubric-based judging with calibration;
- safety: attack success, harmfulness, over-refusal, and helpful recovery;
- efficiency: tokens, latency, throughput, and memory.

One metric should not stand in for another. A fluent unsafe answer can score well on semantic similarity. A safe but useless refusal can score well on harmfulness alone.

## 6. LLM-as-a-judge: useful, not ground truth

The current SEA-HELM README advertises `gpt-4.1-2025-04-14` for MT-Bench judging, but the task actually scheduled by the default configuration is `mt-bench-judge`, whose own config pins a different model: the self-hosted, open-weights `openai/gpt-oss-120b`, served via vLLM at high reasoning effort. A third document in the same repository, the dataset reference, names a third judge again for a related win-rate comparison. Three places in one repository name three different judges for the same evaluation. That is not a case for "pinning the judge version is good practice" — the repository already does that, in triplicate, inconsistently. It is the sharper version of this note's own thesis: a score is produced by a pipeline, and the pipeline has to be inspected, not assumed from the README.

Judge models introduce several risks:

- position bias between response A and B;
- preference for longer or more polished answers;
- self-family preference;
- weaker judgment in low-resource languages;
- cultural assumptions inherited from training;
- sensitivity to the rubric and prompt;
- API drift if the version is not fixed.

A defensible judging protocol should:

1. randomize or swap pair order;
2. conceal model identities;
3. use a detailed language-specific rubric;
4. calibrate against native human ratings;
5. measure agreement and systematic disagreement;
6. include direct scoring and pairwise comparison where possible;
7. retain judge rationales for audit, while not treating them as evidence by themselves.

For low-resource languages, a stronger English judge after machine translation may appear attractive. It changes the construct: the system now measures the answer filtered through translation. A native-capable judge with human calibration is preferable.

## 7. Aggregation can hide the region

Suppose $s_{m,l,t}$ is the score for model $m$, language $l$, and task $t$. A global mean can be written as:

$$
S_m = \sum_l \sum_t w_{l,t}s_{m,l,t}.
$$

The weights $w_{l,t}$ are a policy decision. Micro-averaging by item lets large datasets and high-coverage languages dominate. Macro-averaging gives each language or task equal weight, but can give a tiny task the same influence as a mature one.

A good report shows at least:

- per task;
- per language;
- per pillar;
- macro-average across languages;
- macro-average across tasks;
- worst-language or lower-percentile performance;
- missing cells;
- uncertainty across items and runs.

Do not fill missing tasks with zero; that confuses lack of evaluation with model failure. Do not silently drop missing tasks either; that makes incomplete models look stronger. Report coverage next to score. SEA-HELM itself has a concrete missing cell worth naming rather than treating as abstract risk: its default configuration disables multi-turn chat scoring for Burmese, so a Burmese SEA row currently carries no MT-Bench-style score at all.

Normalising different metrics to a common scale can aid visualisation, but it does not make a one-point change equally meaningful across tasks. Leaderboard order should not replace the scorecard.

## 8. Statistical uncertainty and practical significance

Benchmark scores are estimates from finite items and sometimes stochastic generations.

For item-level metrics, bootstrap confidence intervals are often straightforward:

1. sample items with replacement;
2. recalculate the score;
3. repeat many times;
4. report percentile intervals.

For paired model comparison, resample paired item outcomes so that the test uses the same questions. For multiple stochastic runs, report mean, standard deviation, and the run configuration. If prompts or judges vary, treat them as additional sources of variance rather than pooling them silently.

Item-level bootstrapping is not the only defensible choice, and it is not what SEA-HELM itself uses at the task level: its score specification computes clustered standard errors following Miller (2024), treating runs as the resampling unit rather than items. Bootstrapping over items and clustering over runs answer different questions — one about item-sampling uncertainty, one about run-to-run variance — and a report that only does one should say which.

A difference of 0.3 percentage points on one run may be noise. A five-point gain confined to a contaminated dataset may also be meaningless. Statistical significance does not establish practical value; pair it with error analysis and effect size.

Subgroup sample sizes matter. A broad cultural score may contain too few items for any one community. Confidence intervals should widen rather than disappear when a slice is small.

## 9. Benchmark contamination and saturation

Public benchmarks eventually enter training corpora, prompt repositories, synthetic-data pipelines, and model-generated textbooks. Exact-match deduplication catches only direct copies.

Defenses include:

- private or delayed-release test sets;
- canary strings and provenance tracking;
- n-gram and semantic overlap checks against known training data;
- dynamic item refreshes;
- held-out templates and locally collected items;
- comparing public-benchmark gains with native human evaluation;
- inspecting suspiciously perfect or format-specific performance.

A benchmark can also saturate without contamination. If most strong models score near the ceiling, it no longer separates them. Harder items should be added, but difficulty must not come from ambiguity, obscure trivia, broken translation, or adversarial formatting unrelated to the target capability.

## 10. Cultural questions rarely have one correct label

Many machine-learning benchmarks assume one item has one correct label. Culture often does not.

### 10.1 Preserve disagreement

If annotators disagree, first ask whether the item is bad or reality is plural. Record response distributions. A soft score can reward answers that acknowledge several common practices.

### 10.2 Sample within countries

Country is a convenient administrative label, not a homogeneous culture. Where feasible, collect region, language, ethnicity, religion, age, urban/rural context, and other relevant dimensions—with privacy protection and without treating any category as destiny.

### 10.3 Date the knowledge

Etiquette, slang, media, institutions, and ordinary practices change. Cultural datasets need timestamps and refresh policies. An “incorrect” old answer may have been common when collected.

### 10.4 Evaluate explanation and uncertainty

A culturally appropriate answer often says “this varies” and identifies the relevant context. Multiple-choice formats can punish that nuance. Include open scenarios where the model must explain assumptions, ask a clarifying question, or present alternatives.

### 10.5 Test harm, not just recall

The highest-stakes failure is not forgetting a dish. It is stereotyping a group, giving inappropriate advice, mishandling names or honorifics, or applying foreign legal and social assumptions. Scenario-based review should complement factual cultural QA.

## 11. A practical evaluation architecture

### Layer 1: capability matrix

Define rows for languages and meaningful variants, and columns for:

- basic language modeling;
- comprehension;
- generation;
- reasoning;
- instruction following;
- multi-turn chat;
- local knowledge;
- culture and pragmatics;
- safety;
- long context;
- code or tools where relevant;
- efficiency.

Mark every cell as covered, partial, or missing.

### Layer 2: benchmark registry

For each dataset, store:

- construct and intended use;
- language, country, dialect, and domain;
- native/translated/synthetic provenance;
- license;
- item count and split;
- prompt template;
- metric and parser;
- contamination risk;
- known limitations;
- responsible maintainers;
- version and checksum.

### Layer 3: reproducible runner

Pin:

- model checkpoint or API version;
- tokenizer and chat template;
- serving framework;
- precision and quantization;
- prompt and demonstrations;
- decoding settings;
- random seeds and number of runs;
- judge model and rubric;
- code and dataset commits.

Record raw prompts, completions, token counts, timings, parsed outputs, and scores.

### Layer 4: analysis

Produce:

- scorecards and confidence intervals;
- per-language and per-task errors;
- prompt and run variance;
- calibration against native human review;
- cost and latency;
- regression comparisons with the previous model;
- a short sample of representative failures.

### Layer 5: decision gates

Different releases need different gates. A regional general model might require no material regression in English, minimum performance in every supported language, and improvement in the lower-performing language quartile. A public-service assistant might require domain accuracy, calibrated abstention, low harmful-response rate, and native review in deployment languages.

The gate should be set before training. Moving it after seeing the result is not evaluation; it is storytelling.

## 12. Reading a SEA-HELM result responsibly

When someone says a model is “best on SEA-HELM,” ask:

1. Which SEA-HELM version and commit?
2. Which languages and tasks were included?
3. Were any cells missing?
4. How were scores aggregated?
5. Was the model evaluated with its own chat template?
6. What decoding settings and number of runs were used?
7. Which judge model and rubric scored open responses?
8. Are raw completions available?
9. What are the confidence intervals?
10. Was the model trained on the public benchmark?
11. Does the improvement hold on native private tests and human review?
12. What happened to token cost, latency, and safety?

The answer can still be “this model is better.” The questions make the claim specific enough to trust.

## 13. Recommended default

Use SEA-HELM as the shared regional spine, not the whole evaluation body.

During [model development](/notes/continued-pretraining-mid-training), run its language, linguistic, cultural, instruction, chat, and safety tasks at every serious checkpoint. Preserve all per-language results and use the lowest-performing languages as explicit training signals. Add private native tasks drawn from intended applications, plus tokenizer-efficiency and deployment measurements.

For public reporting, publish a scorecard before a rank: coverage, per-language results, pillar results, run variance, judge configuration, cost, and known gaps. Show the paper-era five-language suite separately from later expansions rather than pretending they are directly identical.

For new language coverage, fund language experts and community partners, not just translation. The scarce resource is often not another model call. It is the human capacity to define what good language, relevant knowledge, appropriate behavior, and meaningful failure look like.

SEA-HELM’s strategic importance follows from this. Without a regional evaluation target, model builders optimize what is easy and already measured. With one, the region can state its requirements in executable form.

## Sources

- Susanto, Y. et al. (2025), [*SEA-HELM: Southeast Asian Holistic Evaluation of Language Models*](https://arxiv.org/abs/2502.14301) — primary paper for the original five-language, five-pillar suite.
- AI Singapore, [SEA-HELM repository at the reviewed commit](https://github.com/aisingapore/SEA-HELM/tree/7b0c61944d058ec50b18ff47ab38e3172c7b1729) and [SEA-HELM leaderboard](https://leaderboard.sea-lion.ai/) — checked 2026-07-29, still the current tip of the default branch; the repository supports the post-paper language, task, judge, and multi-run updates.
- Liang, P. et al. (2023), [*Holistic Evaluation of Language Models*](https://arxiv.org/abs/2211.09110) — framework for multi-scenario, multi-metric, transparent evaluation.
- Miller, E. (2024), [*Adding Error Bars to Evals: A Statistical Approach to Language Model Evaluations*](https://arxiv.org/abs/2411.00640) — clustered standard-error method SEA-HELM's own score specification uses for run-level uncertainty.
- Singh, S. et al. (2024), [*Global MMLU: Understanding and Addressing Cultural and Linguistic Biases in Multilingual Evaluation*](https://arxiv.org/abs/2412.03304) — evidence on translation and cultural bias in multilingual knowledge tests.
- Bandarkar, L. et al. (2024), [*The Belebele Benchmark: a Parallel Reading Comprehension Dataset in 122 Language Variants*](https://arxiv.org/abs/2308.16884) — controlled cross-language reading-comprehension comparison.
- Myung, J. et al. (2024), [*BLEnD: A Benchmark for LLMs on Everyday Knowledge in Diverse Cultures and Languages*](https://arxiv.org/abs/2406.09948) — native-annotated everyday cultural knowledge.
- Chiu, Y. Y. et al. (2025), [*CulturalBench: A Robust, Diverse, and Challenging Cultural Benchmark by Human-AI CulturalTeaming*](https://arxiv.org/abs/2410.02677) — human-verified regional questions with multiple-answer annotation.
- Zhang, W. et al. (2023), [*M3Exam: A Multilingual, Multimodal, Multilevel Benchmark for Examining Large Language Models*](https://arxiv.org/abs/2306.05179) — multilingual exam data illustrating educational and cultural variation.

## Change history

- **2026-07-29 — v1.0:** Initial reviewed version, checked against current public sources.
