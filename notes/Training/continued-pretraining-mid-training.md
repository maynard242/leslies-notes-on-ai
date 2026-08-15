---
title: "Continued Pretraining and Mid-Training"
description: "How to adapt a pretrained model for regional capability, preserve what works, and distinguish batch CPT from deployment-time continual learning."
kind: "reference"
section: "Training"
topics:
  - "continued pretraining"
  - "mid-training"
  - "continual learning"
  - "SEA-LION"
  - "multilingual models"
published: "2026-07-29"
updated: "2026-08-10"
checked: "2026-08-10"
version: "1.1"
status: "Reviewed"
order: 2
---

# Continued Pretraining and Mid-Training

Training a useful regional or domain model no longer requires starting from random weights. In many cases, it should not.

A strong open checkpoint already embodies substantial investment in general language, code, and reasoning priors. Continued pretraining (CPT) reuses that investment. The model keeps learning with a pretraining objective, but the new corpus and curriculum shift it toward languages, knowledge, domains, or behaviors that were underrepresented before.

That sounds simple: load a checkpoint and keep predicting the next token. Operationally, it is one of the harder parts of model development. The new run has to create enough change to be worth doing without destroying capabilities already present. Its data mixture must compensate for low-resource languages without turning duplicated or synthetic data into the curriculum. Its learning rate must restore plasticity without destabilising the checkpoint. Its tokenizer may be a poor fit for the new language. Its evaluation has to detect gains, regressions, contamination, and alignment loss before the full budget is spent.

SEA-LION is a useful case study because its development spans both strategies: training from scratch and adapting strong open models through CPT. The lesson is not that CPT always wins. It is that the build-versus-adapt decision should be made with evidence, not prestige.

> **Short version:** baseline the exact checkpoint and define the release gates before training. Continued pretraining is controlled distribution shift; the central engineering problem is balancing adaptation and retention. Do not confuse a bounded CPT phase with deployment-time continual learning, where the model keeps changing from experience after release.

## 1. Terms that are often mixed together

The literature and model community use several overlapping terms.

### Pretraining from scratch

The architecture, tokenizer, parameters, and optimizer begin without a pretrained checkpoint. The objective is normally self-supervised next-token prediction for decoder-only language models. This gives maximum control and maximum cost.

### Continued or continual pretraining

Training resumes from an existing pretrained model using the same or a closely related self-supervised objective. “Continued” often describes one additional phase. “Continual pretraining” suggests a sequence of such updates as new data arrives. The two terms are frequently used interchangeably, but neither should automatically be read as deployment-time continual learning.

### Domain-adaptive pretraining

The new corpus is drawn from a target domain such as biomedicine, law, finance, code, or a region’s languages. The influential [*Don’t Stop Pretraining*](https://arxiv.org/abs/2004.10964) paper called this domain-adaptive pretraining (DAPT) and distinguished it from task-adaptive pretraining (TAPT), which continues pretraining on the smaller unlabeled distribution associated with a target task.

### Mid-training

“Mid-training” is a looser industry term. It usually means a substantial phase between broad base pretraining and final post-training. The objective may still be next-token prediction, but the data can be more structured: long-context documents, code, mathematics, multilingual corpora, question-answer traces, tool formats, or synthetic curricula. Some teams also use the term for annealing or capability-acquisition phases near the end of pretraining.

### Continual learning after deployment

In the stronger sense, continual learning means that deployed experience becomes training signal and the model's weights or adapters keep changing over time. This is not simply a longer CPT run. The update objective might be self-supervised learning, supervised learning, reinforcement learning, or a combination, and updates may be global, organization-specific, or user-specific.

External memory is different. Files, retrieval systems, and session summaries can preserve explicit facts and procedures without changing the model. Weight updates may be needed for some tacit skills, but how much economically useful learning requires full-weight updates rather than retrieval, tools, or adapters remains an open empirical question.

The important boundary is not the name. It is the objective and data:

- **Pretraining or mid-training** changes the model through large-scale self-supervised or structured-token learning.
- **Supervised fine-tuning (SFT)** teaches responses from prompt-response examples.
- **Preference optimization** changes which response the model favors.
- **Reinforcement learning** optimizes behavior against rewards.
- **Deployment-time continual learning** repeatedly updates the model from experience and therefore turns evaluation, data consent, security, and rollback into continuous operating requirements.

These stages interact, but they are not substitutes. CPT can improve a model’s command of Khmer text. It does not by itself teach the model to answer helpfully in Khmer. AI Singapore's [SEA-LION-ModernBERT](https://huggingface.co/aisingapore/SEA-LION-ModernBERT-600M) encoder line gives a concrete instance of mid-training as its own stage: the card describes pretraining from scratch on 2 trillion tokens, then an explicit mid-training phase on a further 1 trillion tokens, before any task fine-tuning. This note otherwise focuses on CPT because it is the clearest large-scale adaptation method in the rest of SEA-LION's history; broader mid-training may also use structured synthetic curricula, long-context adaptation, or capability-specific annealing.

## 2. When continued pretraining is the right tool

CPT is attractive when the target capability is underrepresented in the base model but can be learned from substantial text or token sequences.

Good candidates include:

- adding or strengthening languages;
- specialising in a technical domain;
- refreshing knowledge with newer data;
- expanding code, mathematics, or structured-data capability;
- adapting to long documents or a new context regime;
- learning domain syntax before instruction tuning;
- improving a weak capability while keeping most of the base model.

CPT is less attractive when:

- the desired change is mostly response style or policy;
- only a small high-quality supervised dataset exists;
- the base tokenizer is catastrophically inefficient and cannot be changed safely;
- the base license, architecture, or serving requirements are unsuitable;
- a newer public checkpoint already offers the desired capability;
- the evaluation suite cannot tell whether the run worked.

The last point matters. Training is not the first step. The first step is a baseline and a gate.

## 3. Start with the checkpoint decision

The starting model determines what can be preserved, what must be repaired, and which constraints are inherited.

### 3.1 Base or instruction-tuned?

A base checkpoint is the cleanest starting point for CPT. It has not been heavily shaped by a chat template, SFT, preference optimization, or safety tuning. After CPT, the model can be post-trained for the target application.

An instruction-tuned checkpoint may be tempting because it already behaves like an assistant. But CPT on raw text can weaken that behavior. [Li and Lee](https://arxiv.org/abs/2401.03129) studied continued pretraining of an aligned Llama-2 chat model on Traditional Chinese data and found non-trivial forgetting in output format and reliability, including repetition problems. Their setup is one study, not a universal result, but it demonstrates that alignment is not protected by the label on the checkpoint.

If an instruction model must be used, include behavioral regression tests and plan to restore alignment with SFT or preference tuning afterwards.

### 3.2 Architecture and context

Check:

- model width, depth, attention type, and positional encoding;
- maximum sequence length and whether extending it requires RoPE scaling or additional adaptation;
- embedding tying and tokenizer vocabulary;
- optimizer-state availability;
- numerical format and training framework support;
- license and downstream use conditions;
- inference cost on the intended hardware.

The best benchmark checkpoint is not always the best base. A smaller model with a good tokenizer and deployable architecture may produce more regional utility than a larger model that is too costly to serve.

### 3.3 Tokenizer fit

Measure the base tokenizer on the target corpus before training. Report per-language token counts, characters or grapheme clusters per token, byte-fallback share, and parallel-text token premiums. The companion note on [multilingual tokenizers](/notes/multilingual-tokenizers) gives the full measurement and migration framework.

Keeping the tokenizer preserves every embedding and serving assumption. Extending it can improve efficiency but introduces new embeddings and output rows. [OFA](https://arxiv.org/abs/2311.08849) is one approach to smarter initialization of unseen multilingual subwords; simpler methods initialize a new token from the average or composition of its old-token segmentation. In all cases, the new rows need enough training signal.

Tokenizer changes are justified when measured sequence inflation is large and the CPT budget can train the new interface. They are not justified merely because a custom vocabulary looks more regional.

## 4. The objective is familiar; the distribution is not

For a decoder-only model with parameters $\theta$ and token sequence $x_1,\ldots,x_T$, the CPT objective remains causal cross-entropy:

$$
\mathcal{L}(\theta) = -\sum_{t=1}^{T}\log p_\theta(x_t \mid x_{<t}).
$$

What changes is the data distribution. Let $D_0$ be the base model’s unknown or partly known pretraining distribution, and $D_1$ the new regional or domain corpus. The trainer chooses a mixture:

$$
D_{\text{CPT}} = \lambda D_{\text{target}} + (1-\lambda)D_{\text{general}}.
$$

A high $\lambda$ increases adaptation pressure. It can also accelerate forgetting, overfit duplicated target data, and distort output language. A low $\lambda$ preserves the base but may spend a large budget producing little regional gain.

There is no universal best ratio. The [D-CPT scaling-law work](https://arxiv.org/abs/2406.01375) treats mixture selection as a measurable optimization problem and fits general- and domain-loss curves from smaller experiments. Its specific law was tested on models and domains far narrower than the full Southeast Asian setting, but the approach is useful: use proxy runs to estimate the frontier instead of choosing one mixture by instinct.

## 5. Data is the main model intervention

CPT is often described as an optimization technique. Its outcome depends at least as much on the data and mixture.

### 5.1 Build a source ledger

For each source, record:

- provenance and license;
- collection date;
- language and script;
- country or community relevance;
- domain and register;
- quality filters;
- deduplication method;
- personally identifiable information handling;
- whether the text is human, translated, OCR-derived, or synthetic.

“Publicly accessible” does not mean commercially reusable. A transparent dataset may need to exclude a large amount of collected text because its origin or permission cannot be defended.

SEA-LION’s public materials repeatedly make this distinction. The project reports collecting much more Southeast Asian text than it ultimately treats as suitable for commercially permissive training. That is not wasted work. It is what a defensible pipeline looks like.

### 5.2 Filter per language, not only globally

A quality classifier trained on English web text can classify fluent low-resource text as low quality. Language identification can fail on short or code-switched passages. Toxicity filters can mistake reclaimed or context-specific terms. Heuristics tuned to Latin script can reject legitimate combining marks.

Evaluate every filter by language and source. Keep rejection samples. For very low-resource languages, human review of a few hundred accepted and rejected documents can be more valuable than another model-based score.

### 5.3 Deduplicate before oversampling

Low-resource data is often upweighted. If it contains copied news, mirrored religious text, or machine-generated templates, upweighting multiplies the duplication. Deduplicate within sources, across sources, and against evaluation data before sampling.

Exact hashes catch copies. MinHash or locality-sensitive methods catch near duplicates. Semantic deduplication may catch paraphrases but can also erase legitimate repeated cultural or legal formulas. Preserve the thresholds and audit decisions.

### 5.4 Mix language, domain, and quality

A single “Vietnamese” bucket can contain news, forums, government documents, subtitles, spam, and translated English. Sampling only by language hides the domain mixture. A useful mixture controller tracks at least language × source × domain × quality tier.

For language $l$ with $n_l$ examples, temperature sampling is a common starting point:

$$
p_l = \frac{n_l^\alpha}{\sum_j n_j^\alpha}, \qquad 0 < \alpha < 1.
$$

It reduces the dominance of high-resource languages. But the effective distribution is also changed by tokenizer efficiency: a language that fragments more heavily contributes less human text per token. Mixture reports should therefore include both raw text units and post-tokenization units.

### 5.5 Synthetic data: use it as a targeted instrument

Synthetic data can fill gaps in instruction formats, translation pairs, reasoning traces, and low-resource languages. It can also spread the teacher’s cultural defaults, factual errors, and linguistic awkwardness.

SEA-LION v4 provides a concrete example. The [Gemma-SEA-LION v4 model card](https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-27B) reports that 0.5% of its mixture was synthetically generated data for low-resource Khmer. That is a reasonable targeted intervention. It should be labeled, evaluated by native speakers, and prevented from overwhelming natural text.

Use synthetic data where its marginal value is clear. Do not treat volume as evidence of coverage.

## 6. Learning-rate schedules: restoring plasticity safely

A finished checkpoint often ended pretraining at a very low learning rate. Continuing at that rate may barely adapt. Jumping to a large rate can cause a loss spike or overwrite useful parameters.

### 6.1 Rewarming and redecay

[Gupta and colleagues](https://arxiv.org/abs/2308.04014) examined how to rewarm a pretrained Pythia model when moving to a new large corpus, with no replay of the original data — a clean isolate of rewarming on its own. They found that the maximum learning rate trades off downstream adaptation against upstream retention, and that warmup length itself matters less than how high the rate goes: their result states plainly that progressively increasing the learning rate to warm up is not necessary.

[Ibrahim and colleagues](https://arxiv.org/abs/2403.08763), in experiments up to a 10-billion-parameter model, found that a combination of learning-rate rewarming, redecay, and replay could match a retraining baseline on average while using less compute. Their paper reports 5% replay for a weaker English-to-English shift and 25% for a stronger English-to-German shift in the highlighted runs. These are empirical points, not constants for every model.

A safe workflow is:

1. recover the base run’s terminal learning rate and schedule if available;
2. run small sweeps over peak CPT learning rates;
3. monitor target and general validation loss during the initial stability gap;
4. reject rates that create persistent regression or unstable gradients;
5. redecay to a low rate before the final checkpoint.

### 6.2 Warmup–stable–decay

A warmup–stable–decay (WSD) schedule separates three phases:

- **warmup:** increase learning rate from a safe starting point;
- **stable:** hold it while most learning occurs;
- **decay:** cool down to consolidate the checkpoint.

This is attractive for CPT because the stable phase can be extended if data or compute changes. The decay phase also produces a useful final checkpoint rather than stopping at peak plasticity.

SEA-LION v3 used a WSD-style schedule. The [SEA-LION paper](https://arxiv.org/abs/2504.05747) reports a 10% warmup, 80% stable phase, and 10% cooldown for its CPT setup, with a peak learning rate of $10^{-5}$ and final rate of $10^{-7}$. The exact recipe belongs to those models, corpus, and budget. The transferable practice is the phase separation and the use of small-scale experiments before the main run.

### 6.3 Optimiser state and checkpoint continuity

If the original optimizer state is available, resuming it preserves moment estimates but may also preserve stale assumptions about the old distribution and schedule. Starting a fresh optimizer is operationally simpler for public checkpoints, because original state is rarely released, but it creates a genuine transition.

Whichever path is chosen, record it. “Continued from model X” is incomplete without the exact revision, tokenizer, optimizer, precision, sequence length, and learning-rate transition.

## 7. Forgetting is broader than benchmark accuracy

Catastrophic forgetting is usually described as a fall in old-task scores. In an aligned LLM, it can appear as:

- weaker English or general reasoning;
- loss of instruction-following format;
- repetition or degeneration;
- unwanted language switching;
- safety regression;
- worse calibration or truthfulness;
- loss of coding or mathematics;
- changes in chat-template compliance.

A model can preserve MMLU while becoming a worse assistant. [Li and Lee](https://arxiv.org/abs/2401.03129) found exactly this pattern in their aligned-checkpoint study: knowledge intact, reliability degraded.

### 7.1 Replay

Mixing previous or general data into CPT is the most direct mitigation. It anchors the model to capabilities that the target corpus does not exercise.

The hard part is that the original pretraining data is usually unavailable. A defensible substitute is a broad, licensed corpus that approximates the capabilities to preserve. Replay should be measured by source and capability, not only a single percentage.

### 7.2 Lower learning rate and shorter training

Reducing the peak rate or token budget preserves more of the base model, but may leave the target underlearned. This is a frontier, not a free improvement. Plot target gain against general regression for each checkpoint.

### 7.3 Data interleaving and curriculum

Instead of one stationary mixture, training can move through phases. [Parmar and colleagues](https://arxiv.org/abs/2407.07263) found benefits from a two-distribution recipe: the first blend already upweights high-quality sources, and the second adds QA-formatted data and further upweights the capabilities they most wanted to improve. They also report a concrete switch-point rule — start CPT near the pretrained model's minimum learning rate, cosine-decay toward roughly a hundredth of that rate, and switch distributions at about a fifth of the peak rate. This is analogous to annealing: broad coverage first, higher-quality or more capability-specific data later.

### 7.4 Distillation and regularization

A frozen reference model can provide targets on general data, constraining the new model’s output distribution. Parameter-distance penalties, elastic methods, adapters, and partial freezing are other options. They can reduce forgetting but also constrain useful adaptation.

Parameter-efficient CPT can be appropriate when compute is limited or multiple domain variants must share one base. It is not automatically equivalent to full CPT. Languages and domains may require changes distributed across embeddings, attention, and feed-forward layers.

### 7.5 Restore post-training after CPT

If CPT begins from a base model, post-train normally. If it begins from an instruct model, expect to restore behavior. Keep SFT and preference data versioned so that the procedure is repeatable.

## 8. SEA-LION: what successive generations teach us

SEA-LION is not one static model. Its generations show changing choices as stronger open foundations became available.

### 8.1 v1: learn the full stack by training from scratch

The [SEA-LION v1 3B model card](https://huggingface.co/aisingapore/SEA-LION-v1-3B) describes a decoder-only model trained from scratch on the SEA-LION corpus with a custom 256,000-token regional tokenizer. This path gave control over data, vocabulary, and architecture. It also built the team’s practical ability to curate data and run distributed training.

Training from scratch remains valuable when the architecture or tokenizer must be fundamentally different, when a clean sovereign stack is required, or when the learning objective itself changes. But it is expensive, and a small regional team must compete with foundation models trained on much larger budgets.

### 8.2 v2: adapt a strong open checkpoint

The [Llama-SEA-LION v2 8B card](https://huggingface.co/aisingapore/Llama-SEA-LION-v2-8B) describes continued pretraining of Llama 3 8B Instruct on roughly 48 billion tokens in English, Indonesian, Tamil, Thai, and Vietnamese. This reused a much stronger base while moving the language distribution toward the region.

Starting from an instruct checkpoint supplied useful prior behavior, but it did not guarantee that the behavior would survive CPT. Raw language adaptation and assistant alignment are different objectives, so instruction following still needed to be measured and repaired.

### 8.3 v3: systematic data-mixture and optimization experiments

SEA-LION v3 moved beyond “keep training on regional text.” The [technical paper](https://arxiv.org/abs/2504.05747) reports:

- small-scale ablations before the main run;
- a broad mixture of roughly 55% Southeast Asian language data, 25% English, and 20% code for the 200-billion-token v3 CPT recipe;
- BPE-Dropout to expose alternative token segmentations without replacing the base tokenizer;
- a WSD learning-rate schedule;
- filtering, language-specific sampling, deduplication, and a documented evaluation suite;
- subsequent instruction fine-tuning, SimPO preference optimization, and model merging for instruction models.

The specific outcome is less important than the process. The team did not assume that maximising regional token share would maximize regional capability. English and code replay helped preserve broad ability, and proxy experiments informed the mixture.

### 8.4 v4: larger CPT runs and language-specific interventions

The [Gemma-SEA-LION v4 27B card](https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-27B) reports 500 billion CPT tokens. Its listed mixture includes English, code, Chinese, and multiple Southeast Asian languages, with data cleaning and synthetic augmentation for Khmer. The [Qwen-SEA-LION v4 32B instruction card](https://huggingface.co/aisingapore/Qwen-SEA-LION-v4-32B-IT) describes a separate Qwen-based path: a 100-billion-token training budget sampled from a larger pool, across seven languages. A third lineage, [Apertus-SEA-LION v4 8B](https://huggingface.co/aisingapore/Apertus-SEA-LION-v4-8B-IT), continued pretraining from Swiss AI's Apertus-8B-Instruct-2509 — a reminder that "v4" spans at least three vendor bases, not one recipe reused across model sizes.

These cards should not be collapsed into one “v4 recipe.” They are different base models and training runs. Model-family choice remains part of the experiment.

### 8.5 v4.5: CPT is not always the next move

The [Qwen-SEA-LION v4.5 27B instruction card](https://huggingface.co/aisingapore/Qwen-SEA-LION-v4.5-27B-IT) describes reasoning and multilingual post-training only: logit distillation from the much larger Qwen3.5-397B-A17B on SEA-Instruct-2602, then model merging. There is no v4.5 base model in the collection and no new CPT tokens. A second, independent release confirms the pattern: the [Gemma-SEA-LION v4.5 E2B card](https://huggingface.co/aisingapore/Gemma-SEA-LION-v4.5-E2B-IT) is also post-training only, distilled onto a smaller on-device base. A third artifact in the same generation, the [Qwen-SEA-LION v4.5 27B SpecDecoder](https://huggingface.co/aisingapore/Qwen-SEA-LION-v4.5-27B-IT-SpecDecoder), is a block-diffusion speculative-decoding drafter — the return on this generation came from serving efficiency, not more training.

The sharper fact is what moved underneath the distillation. The 27B instruction model sits on a **Qwen3.6-27B** base — a newer vendor checkpoint than the Qwen3-32B that v4's 100-billion-token CPT run was built on. AI Singapore did not extend that CPT investment forward onto the new base; it started fresh with no continued pretraining at all, the "a newer public checkpoint already offers the desired capability" criterion from [Section 2](#2-when-continued-pretraining-is-the-right-tool) playing out in the team's own release history.

This is an important strategic point. Once strong multilingual base capability exists, the highest-return work may move to post-training, distillation, data quality, evaluation, and serving. CPT is a tool, not an identity — and sometimes the right response to a stronger new base is to let a CPT investment go rather than protect it.

### 8.6 A pattern the recipe advice doesn't fully capture

[Section 3.1](#31-base-or-instruction-tuned) calls a base checkpoint the cleanest CPT starting point. SEA-LION's own history mostly does something else: of its CPT runs surveyed here, only the Gemma-2-9B path behind v3-9B started from a true base model. The Llama-based v2 and v3 checkpoints, the Gemma-3-27B-it base behind v4-27B, and the Apertus-8B-Instruct-2509 base behind Apertus-SEA-LION v4 all started from instruction-tuned checkpoints.

That is not an oversight; it is a trade-off worth naming rather than glossing over. Redoing post-training from a base model is itself expensive, and an instruction-tuned checkpoint's existing behavior is worth protecting if it can be. SEA-LION v3's SimPO-and-merging step shows the buy-back directly: it folds the original instruction-tuned checkpoints back into the CPT'd model, restoring behavior a base-only recipe would otherwise have to rebuild from nothing. The honest version of Section 3.1's advice is not "always start from base." It is: know which behavior CPT puts at risk, and have a concrete plan — merging, replay, or full post-training — to restore it before you start.

## 9. From batch CPT to deployment-time continual learning

The runbook in this note assumes a bounded training phase followed by a versioned release. In [*8 Predictions for the Era of Continual Learning*](https://www.dwarkesh.com/p/era-of-continual-learning), Dwarkesh Patel sketches a different regime: useful work performed after deployment becomes training data, model variants improve from their own experience, and the boundary between training and deployment starts to disappear.

That is a useful extension to the CPT frame, but it is a forecast rather than a demonstrated recipe. The saxophone analogy in the piece makes the intuition vivid — notes passed between novices do not substitute for practice embodied in a learner — without proving which AI capabilities must be stored in weights. The practical question is comparative: for each capability, do full-weight updates outperform retrieval, explicit memory, tool improvement, or parameter-efficient adapters enough to justify their added risk and cost?

If deployment becomes part of training, several operating assumptions change:

- **Evaluation becomes recurring.** A one-time gate before release is insufficient for a moving model. Every promoted update needs a model ID, immutable test results, canary deployment, regression thresholds, and a rollback path.
- **Experience needs provenance and consent.** The training ledger must record which sessions may be learned from, whose data they contain, how long they may be retained, and whether improvements can be pooled across users or organizations.
- **Prompt injection becomes data poisoning.** A malicious interaction that only affects one session is different from one that can alter future weights. Candidate training traces need quarantine, filtering, adversarial testing, and bounded promotion.
- **Alignment must survive repeated updates.** Safety and behavioral evaluations must cover the update process, not only a frozen checkpoint. A model that passes today can regress after tomorrow's learning batch.
- **Forks create migration and lock-in problems.** A company-specific adapter or weight fork may accumulate valuable experience, but the operator must be able to audit it, export what is portable, and migrate or distil it when the underlying base model changes.
- **Economics may favor scale.** Patel argues that experience-trained models could create switching costs and that efficient batching may favor large organizations or widely shared weight variants. Those are plausible second-order effects, not yet established outcomes.

The conservative bridge from today's CPT to that future is not uncontrolled online learning. It is frequent but bounded updates: keep the deployed model fixed during an interval, quarantine new experience, train a candidate offline, run the full gate, then promote or reject a versioned checkpoint. This preserves the core lesson of CPT — adaptation must be balanced against retention — while adding provenance, security, and reversibility.

## 10. A practical CPT runbook

### Phase 0: define the hypothesis

Examples:

- “Reduce Thai and Vietnamese validation loss without more than a one-point drop on the general evaluation suite.”
- “Improve legal-domain retrieval and generation while preserving instruction following.”
- “Add Khmer reading capability with no increase in repetition or unsafe response rate.”

A hypothesis needs target metrics, retention metrics, and a budget.

### Phase 1: baseline the exact checkpoint

Pin the model and tokenizer revisions. Evaluate:

- per-language held-out loss;
- token efficiency;
- multilingual and cultural tasks, including the framework in the [SEA-HELM evaluation note](/notes/sea-helm-multilingual-cultural-evaluation);
- English/general reasoning;
- code and mathematics if they matter;
- instruction following and chat format;
- safety and repetition;
- throughput and memory.

### Phase 2: qualify the data

Create fixed train, validation, and quarantine splits. Deduplicate against benchmarks. Publish source and language composition before and after tokenization. Hold back recent or private evaluation sets that the training pipeline cannot access.

### Phase 3: run proxies

Use a smaller model, a shorter token budget, or both. Sweep:

- target/general ratios;
- peak learning rates;
- replay percentages;
- tokenizer policy;
- synthetic-data share;
- sequence length and packing;
- curriculum order.

Proxy results do not scale perfectly. They are still better than making every decision inside one expensive run.

### Phase 4: instrument the full run

Monitor:

- train and per-source validation loss;
- gradient norm and clipping rate;
- throughput, memory, and hardware errors;
- language mix after tokenization;
- duplicate exposure;
- checkpoint-level benchmark slices;
- sample generations for repetition and language switching.

Save enough checkpoints to reconstruct the adaptation-retention frontier. The final step is not always the best model.

### Phase 5: cool down and post-train

Use an explicit decay or annealing phase. Select several candidate checkpoints. Run SFT and preference optimization on the finalists, not blindly on only the last one.

### Phase 6: evaluate and document

Publish the base revision, corpus mixture, token budget, learning-rate schedule, hardware, precision, tokenizer choice, benchmark settings, and known limitations. Without these, the release is not a reproducible technical contribution.

## 11. Failure modes and responses

| Failure | Likely cause | Response |
|---|---|---|
| Target loss barely changes | Learning rate too low; weak data; insufficient target share | Rewarm carefully; improve data; increase target weight through proxy tests |
| General capability falls | Too much target data; LR too high; too long a run | Add replay; lower peak LR; select an earlier checkpoint |
| Output repeats or loops | Alignment loss; narrow duplicated corpus; instability | Deduplicate; add behavioral gates; restore SFT; reduce LR |
| Model answers in the wrong language | Mixture imbalance; prompt or SFT weakness | Add matched prompts; rebalance; evaluate language adherence separately |
| Low-resource gain stalls | Poor tokenizer; noisy or duplicated data | Measure token efficiency; repair corpus; consider vocabulary extension or segmentation regularization |
| Benchmarks improve but users do not | Contamination; translated benchmarks; narrow task coverage | Add private native tasks, human review, and product traces |
| Training is unstable | LR transition, precision, bad batches, distributed faults | Quarantine data, inspect gradients, resume from known checkpoint, reduce peak rate |
| CPT improves base but chat worsens | Started from instruct model or lost alignment | Begin from base where possible; repeat post-training |

## 12. Recommended default

For a regional model today, first choose the best deployable open base, not the largest available model. Measure its language loss, token efficiency, and SEA-HELM profile. Then build a commercially defensible regional corpus and use short proxy runs to map the adaptation-retention frontier.

A sensible default CPT recipe keeps the base tokenizer, uses a conservative learning-rate rewarm and explicit decay, mixes regional data with broad replay, and evaluates every checkpoint across language, general capability, behavior, safety, and serving cost. Change the tokenizer only if measured regional inefficiency is severe.

Keep the option not to run CPT. If SFT, retrieval, distillation, or a newer base model produces the required outcome more cheaply, that is the better engineering decision.

The strongest reason to build CPT capability is not ownership of one checkpoint. It is institutional learning: knowing how to collect defensible data, run stable training, diagnose regressions, evaluate languages and cultures, and repeat the process when the base model changes.

## Sources

- Gururangan, S. et al. (2020), [*Don’t Stop Pretraining: Adapt Language Models to Domains and Tasks*](https://arxiv.org/abs/2004.10964) — foundational DAPT and TAPT study.
- Gupta, K. et al. (2023), [*Continual Pre-Training of Large Language Models: How to (re)warm your model?*](https://arxiv.org/abs/2308.04014) — controlled evidence on rewarming and adaptation-retention trade-offs.
- Ibrahim, A. et al. (2024), [*Simple and Scalable Strategies to Continually Pre-train Large Language Models*](https://arxiv.org/abs/2403.08763) — experiments on replay, rewarming, and redecay.
- Li, C.-A. and Lee, H.-Y. (2024), [*Examining Forgetting in Continual Pre-training of Aligned Large Language Models*](https://arxiv.org/abs/2401.03129) — evidence on behavior loss in an aligned checkpoint.
- Parmar, J. et al. (2024), [*Reuse, Don’t Retrain: A Recipe for Continued Pretraining of Language Models*](https://arxiv.org/abs/2407.07263) — evidence for staged data-distribution choices.
- Que, H. et al. (2024), [*D-CPT Law: Domain-specific Continual Pre-Training Scaling Law for Large Language Models*](https://arxiv.org/abs/2406.01375) — domain-loss scaling and proxy-run mixture selection.
- Liu, Y. et al. (2024), [*OFA: A Framework of Initializing Unseen Subword Embeddings for Efficient Large-scale Multilingual Continued Pretraining*](https://arxiv.org/abs/2311.08849) — method for initializing new multilingual embeddings.
- Ng, R. et al. (2025), [*SEA-LION: Southeast Asian Languages in One Network*](https://arxiv.org/abs/2504.05747) — primary report for SEA-LION v3 data, schedule, tokenizer, and post-training choices.
- AI Singapore, [SEA-LION repository at the reviewed commit](https://github.com/aisingapore/sealion/tree/d75f7923db666f266e4dd95b49161a2a1a9a0e5c), [SEA-LION v1 3B](https://huggingface.co/aisingapore/SEA-LION-v1-3B), [Llama-SEA-LION v2 8B](https://huggingface.co/aisingapore/Llama-SEA-LION-v2-8B), [Gemma-SEA-LION v3 9B](https://huggingface.co/aisingapore/Gemma-SEA-LION-v3-9B), [Gemma-SEA-LION v4 27B](https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-27B), [Qwen-SEA-LION v4 32B IT](https://huggingface.co/aisingapore/Qwen-SEA-LION-v4-32B-IT), [Apertus-SEA-LION v4 8B IT](https://huggingface.co/aisingapore/Apertus-SEA-LION-v4-8B-IT), [Qwen-SEA-LION v4.5 27B IT](https://huggingface.co/aisingapore/Qwen-SEA-LION-v4.5-27B-IT), [Gemma-SEA-LION v4.5 E2B IT](https://huggingface.co/aisingapore/Gemma-SEA-LION-v4.5-E2B-IT), [Qwen-SEA-LION v4.5 27B IT SpecDecoder](https://huggingface.co/aisingapore/Qwen-SEA-LION-v4.5-27B-IT-SpecDecoder), and [SEA-LION-ModernBERT 600M](https://huggingface.co/aisingapore/SEA-LION-ModernBERT-600M) model cards — checked 2026-07-29 for release-specific claims.
- Patel, D. (2026), [*8 Predictions for the Era of Continual Learning*](https://www.dwarkesh.com/p/era-of-continual-learning) — strategic forecast about deployment-time learning, evaluation cadence, alignment, lock-in, and inference economics; used here as a hypothesis source, not an empirical training study.

## Change history

- **2026-08-10 — v1.1:** Distinguished deployment-time continual learning from CPT and added operating implications from Patel's *8 Predictions for the Era of Continual Learning*.
- **2026-07-29 — v1.0:** Initial reviewed version, checked against current public sources.
