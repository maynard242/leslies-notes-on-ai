---
title: "SEA-Pile and the Training of SEA-LION"
description: "How SEA-LION moved from scratch pretraining to continued pretraining and distillation, and what SEA-Pile reveals about regional training data."
kind: "reference"
section: "Training"
topics:
  - "SEA-LION"
  - "SEA-Pile"
  - "multilingual models"
  - "pretraining"
  - "Southeast Asia"
published: "2026-08-05"
updated: "2026-08-05"
checked: "2026-08-05"
version: "1.0"
status: "Reviewed"
order: 4
---

# SEA-Pile and the Training of SEA-LION

The core challenge in building a Southeast Asian language model is not the Transformer architecture. It is the data system: deciding which text adds regional capability and which merely adds volume.

SEA-LION — *Southeast Asian Languages In One Network* — began as an attempt to train open models for a region poorly represented in mainstream large language models. Its development has since moved through several distinct stages: pretraining from scratch, continued pretraining on stronger base models, larger and more deliberate multilingual mixtures, multi-stage post-training, and, most recently, distillation into smaller or faster models.

The common thread is data. SEA-Pile supplied much of the regional pretraining material. But SEA-Pile is not a single frozen object, and it is not the whole training set. It has changed in scope, source format, filters, language coverage, token accounting and release status. Later SEA-LION models also mixed it with English, Chinese, code, curated corpora, licensed news, synthetic low-resource data and instruction data.

This distinction matters. A corpus is an inventory of possible training material. A training mixture is a sampling policy over that inventory. Tokens consumed by a model are a third quantity. Public releases can be partial. Token counts change with the tokenizer. If these numbers are collapsed into one headline figure, the technical story becomes misleading.

This note reconstructs that story from the public SEA-LION paper, dataset cards, model cards and code repository. The public artifacts establish the release history; the engineering guidance is my reading of what those artifacts imply.

## The short version

SEA-LION changed strategy as the open-model ecosystem improved. V1 trained regional foundation models with a custom tokenizer and a roughly 980 billion-token constructed mixture.[4]

V2 and v3 instead adapted strong open models through continued pretraining.[5][6][7]

The Gemma and Qwen text branches carried that strategy into v4.[8][9]

V3.5 put more weight on reasoning post-training.[19][20]

V4.5 emphasized teacher distillation, model merging and deployment efficiency.[10][11]

SEA-Pile changed too. V1 names the full mixture used for the scratch-trained models, although the public repository carries only its cleaned mC4 portion. V2 is a later Common Crawl corpus whose initial public release contains roughly 122 billion tokens and is explicitly partial. Neither number is interchangeable with a model’s sampled training mixture.[2][3]

The strategic shift is from “Can we train a regional foundation model?” to “How do we adapt strong foundations with the right regional data, then make them useful, measurable and deployable?”

## SEA-LION is a family, not one model

A useful way to read the releases is as a sequence of engineering choices.

| Generation | Main training approach | Publicly reported scale | What changed |
|---|---|---:|---|
| SEA-LION v1 | Pretraining from scratch; MPT-style 3B and 7B decoder models | About 980B-token published mixture | Regional corpus construction, 256K vocabulary, open scratch training [2][4] |
| SEA-LION v2 | Continued pretraining of Llama 3 8B Instruct | 48B tokens | Reuse general capability; concentrate scarce compute on five languages [5] |
| SEA-LION v3 | Continued pretraining of Gemma 2 9B and Llama 3.1 8B and 70B | 200B tokens per branch | Broader language coverage, stronger base models, larger instruction mixtures [1][22] |
| SEA-LION v3.5 | Reasoning-focused post-training of SEA-LION v3 models at 8B and 70B | 30M-instruction pool; final stage included 1.5M distilled reasoning traces | Hybrid reasoning, thinking toggle, larger synthetic and regional instruction set [19][20][23] |
| SEA-LION v4 text branches | Continued pretraining plus multi-stage post-training | Gemma 27B: 500B tokens sampled from a 1T pool; Qwen 32B: 100B tokens | Larger data pool, more explicit source mixing, RL and alignment stages [8][9] |
| SEA-LION v4.5 | Post-training, distillation and model merging | Gemma card: about 8.54M instruction-text pairs; Qwen consumed count not disclosed | Smaller/faster regional models, tool use and deployment efficiency [10][11][12] |

V4 is a suite, not one uniform recipe. The Gemma 27B and Qwen 32B text branches received continued pretraining; Apertus and the vision-language branches followed different adaptation paths.[21]

These are not directly controlled experiments. The base architectures, tokenizers, context lengths, data mixtures, post-training methods and evaluations all changed. A higher version number therefore does not isolate the effect of SEA-Pile or any single recipe. It records the evolution of the whole system.

That is also why “training SEA-LION” cannot be reduced to one configuration file. It includes at least six connected systems:

- acquisition and provenance;
- text extraction and normalization;
- language identification and quality filtering;
- deduplication, mixture design and tokenization;
- distributed pretraining or continued pretraining;
- post-training and regional evaluation.

A weakness in any one of them can dominate the final result.

## SEA-Pile v1: scale first, then compensate for scarcity

SEA-Pile v1 grew around the multilingual C4, or mC4, portion of Common Crawl. mC4 was created as the multilingual training corpus for mT5.[15] The public SEA-Pile repository contains the cleaned mC4 portion and links to the other source datasets rather than republishing every component.[2]

The published v1 mixture is instructive:

| Component | Tokens after sampling | Share of published mix |
|---|---:|---:|
| RefinedWeb English | 571.3B | 58.20% |
| mC4 Chinese | 91.2B | 9.29% |
| Nine non-English/Chinese regional-language rows | about 128.0B | about 13.0% |
| Code from The Stack | about 139.3B | about 14.2% |
| StackExchange and arXiv | 51.8B | 5.28% |

The subtotal above combines Indonesian, Malay, Filipino, Burmese, Vietnamese, Thai, Lao, Khmer and Tamil rows in the card. It is calculated from rounded published values and describes language rows, not the geographic provenance of the documents.[2]

Three design choices stand out.

### 1. The mixture preserved a large English backbone

More than half of the published v1 mix was English RefinedWeb. My reading is that the large English share was intended to preserve broad coverage while regional data remained scarce, although the public artifacts do not isolate the capability contributed by that source.

The trade-off is dilution. Every English token is one less opportunity to learn Thai syntax, Malay register, Tamil morphology or Burmese orthography at a fixed compute budget. The question is therefore not whether English should be present. It is how much English is needed to retain general capability without crowding out the target languages.

### 2. Low-resource languages were repeated

The card gives both “unique tokens” and a multiplier. Indonesian, Malay, Filipino, Burmese, Lao, Khmer and Tamil were multiplied four times; Thai was multiplied twice across its mC4 and WangChanBERTa sources. Vietnamese and Chinese were not repeated.[2]

Oversampling changes exposure, not diversity. Repeating 270 million Lao tokens four times creates roughly 1.1 billion training-token exposures, but the model is still seeing variants of the same 270 million tokens. This can help a language influence gradient updates, yet it also increases the risk of memorization and source-specific bias.

A good mixture therefore needs two ledgers:

- **inventory:** how much distinct, deduplicated material exists;
- **exposure:** how many times each source will be sampled during training.

Without both, a large token number can hide a small information base.

### 3. SEA-Pile was broader than regional prose

Code, Markdown, arXiv and StackExchange were material parts of the mix. They added technical and structured text, but the public artifacts do not isolate the capability gained from each source. They also make the label “SEA-Pile” easy to misread. It was not simply a pile of Southeast Asian web pages. It was a foundation-model mixture with regional data deliberately amplified inside a much larger base.[2]

The v1 card notes several limitations. Harmful or biased material may remain; the public repository contains the mC4 extract plus links to other components; and downstream users must review the licenses of the individual sources.[2] Malformed and redundant documents remain plausible corpus-pipeline risks, but the card does not report a measured residual rate.

Those caveats are not footnotes. They are central properties of the corpus.

## SEA-Pile v2: from WET text to WARC-based reconstruction

SEA-Pile v2 was a new acquisition and processing effort, not merely an append to v1. The public card describes 24 Common Crawl snapshots from `CC-MAIN-2020-45` through `CC-MAIN-2024-18`, spanning October 2020 to April 2024.[3]

The source-format change matters. Common Crawl publishes WARC files containing the raw crawl records, alongside WET files containing extracted plaintext and WAT files containing metadata.[17] Starting from WARC gives the pipeline more control over HTML extraction and page structure, but it also increases engineering cost. Boilerplate, navigation, malformed markup and encoding failures must be handled locally rather than inherited from a shared plaintext conversion.

The public SEA-Pile v2 card reports 120 billion tokens, counted with the Gemma 3 tokenizer:

| Language | Tokens | Share |
|---|---:|---:|
| Vietnamese | 51.4B | 42.13% |
| Indonesian | 41.9B | 34.34% |
| Tamil | 9.3B | 7.62% |
| Malay | 9.3B | 7.62% |
| Thai | 6.5B | 5.33% |
| Tagalog | 2.2B | 1.80% |
| Khmer | 0.6B | 0.49% |
| Lao | 0.6B | 0.49% |
| Burmese | 0.2B | 0.16% |

The rounded language rows sum to 122 billion tokens, while the card separately states 120 billion. The difference may be rounding, but the card does not explain it.[3]

The distribution is extremely uneven. Vietnamese and Indonesian together account for more than three quarters of the released tokens. The three smallest languages together contribute about 1.4 billion tokens, or a little over one per cent. Equal country representation is not the same as equal data availability.[3]

The card describes four main processing ideas:

1. extraction from the 24 WARC snapshots;
2. deduplication within each snapshot following CCNet;
3. heuristic quality filters;
4. perplexity scoring informed by Sailor and RedPajama-V2, developed with native-speaker input.[3]

CCNet provides the underlying pattern: identify the language, normalize and deduplicate at line or paragraph level, then use a language model’s perplexity as a coarse quality signal.[14] Sailor applies related ideas to Southeast Asian continued pretraining, where filters and sampling must be adapted to the languages rather than copied from English.[16] RedPajama-V2 records a broad set of quality signals so that dataset builders can choose thresholds instead of accepting one universal definition of “clean.”[18]

The practical gain in SEA-Pile v2 was not only fresher text, but greater control over extraction, filtering and regional quality decisions.

There is one documentation point worth making explicit. The public SEA-Pile v2 card calls the released dataset a 120 billion-token **portion** and says expansion is planned.[3] The Qwen SEA-LION v4 card later refers to a “SEA-Pile v2 pretraining corpus of over one trillion tokens” across seven languages.[9] These figures should not be equated. It is plausible, but not publicly demonstrated, that the public release is a subset or version of that larger internal pool. Dataset names are useful labels, but reproducibility requires a snapshot, tokenizer, filters and manifest.

## What a SEA-Pile pipeline actually has to do

A corpus pipeline can be summarized in one line:

```text
crawl -> extract -> normalize -> identify language -> filter -> deduplicate -> score -> mix -> tokenize -> pack
```

Each arrow hides a failure mode.

### Crawl selection and provenance

A crawl snapshot is not a neutral sample of a language community. It reflects what was online, reachable, linked, crawlable and not blocked at that time. News sites and content farms may dominate. Social conversation may be absent or locked inside platforms. Government and educational pages may use formal registers that do not resemble everyday speech. Minority-language communities may publish through PDFs, images or messaging apps that a web crawl barely sees.

Provenance should therefore survive processing. At minimum, each document needs a source snapshot, URL or domain hash, retrieval time, language decision, filter decisions and license or policy metadata where available. If the final dataset stores only text, later questions about removal, contamination or domain imbalance become much harder to answer.

### HTML extraction

Raw WARC processing gives control but not truth. A page contains menus, cookie notices, related links, repeated headers, timestamps, captions and fragments from other languages. A text extractor can preserve too much boilerplate or delete the main article. The same rule behaves differently on a Thai news site, an Indonesian forum and a Khmer government page.

This is why extraction quality should be measured by language and domain, not only by aggregate document count. Native readers should inspect random samples of accepted and rejected pages. A false-positive rate that looks small globally can erase much of a low-resource language.

### Unicode and normalization

Southeast Asian scripts expose normalization bugs quickly. Visually similar text may have different Unicode sequences. Combining marks can be reordered. Zero-width characters, legacy fonts, mojibake and OCR artifacts can produce text that looks readable in one renderer but tokenizes badly. Latin-script languages bring their own issues: nonstandard spelling, missing diacritics, borrowed English words and informal abbreviations are often genuine language use rather than noise.

Normalization must be conservative. Over-normalization can flatten distinctions, erase dialect or turn valid code-switching into synthetic monolingual text. Under-normalization fragments the same word into many surface forms and harms deduplication.

### Language identification

Language identification is a routing decision with compounding effects. A page classified as Indonesian enters one set of filters, sampling weights and evaluations; the same page classified as Malay enters another. Closely related languages, short text, names, numbers and code-switching all make document-level labels brittle.

A single ISO label also hides variation. “Filipino” and “Tagalog” are often used interchangeably in dataset tables even though the sociolinguistic categories are not identical. Indonesian and Malay share much vocabulary. Javanese may appear in Latin or Javanese script. Thai text may contain English product names. Tamil in Singapore or Malaysia can differ in domain and usage from a corpus dominated by India or Sri Lanka.

The practical answer is not one perfect classifier. It is layered evidence: script checks, document- and paragraph-level language scores, confidence thresholds, code-switch labels, domain cues and human audits. Ambiguous material should be marked, not forced into certainty.

### Deduplication

Deduplication is needed for compute efficiency, privacy and evaluation integrity, but “duplicate” has several meanings:

- exact duplicate documents across snapshots;
- near-duplicate news syndication;
- repeated site templates;
- copied paragraphs inside otherwise different pages;
- translated or transliterated duplicates;
- benchmark questions reposted on the web.

SEA-Pile v2 reports deduplication within each snapshot.[3] That is valuable, but it does not by itself establish global deduplication across all snapshots, sources or later instruction sets. A production pipeline should track exact and near duplicates across the complete mixture and should run benchmark-contamination checks separately. Repetition may also be intentional: legal forms, prayers, song lyrics and news wire text are valid cultural artifacts. Removing every repeated passage can distort the corpus; retaining all of them lets a few sources dominate.

### Quality scoring

Perplexity is useful because fluent in-language text tends to look less surprising to a suitable reference model. But it is not an objective measure of social value. A reference model trained on formal news may assign high perplexity to slang, dialect, youth speech, creative spelling or mixed-language conversation. The filter can then reproduce the reference model’s preferences.

Heuristics have similar politics. Ratios of punctuation, digits, repeated lines or short sentences can catch garbage, yet recipes tuned for English may reject Thai text without spaces or compact dialogue. Native-speaker collaboration, as described for SEA-Pile v2, is therefore part of the technical method, not an optional review step.[3]

The correct question is not “Is this document clean?” It is “Clean for which training purpose, language, register and risk tolerance?”

## From corpus to training mixture

Even a perfectly cleaned corpus does not determine what a model learns. The mixture does.

Suppose the inventory contains 50 billion Vietnamese tokens and 500 million Burmese tokens. Sampling them in proportion to inventory gives Vietnamese one hundred times as many updates. Sampling them equally repeats the Burmese material until memorization becomes a serious risk. The mixture designer must choose a point between those extremes.

A common abstraction is temperature sampling:

```text
p(language i) = n_i^alpha / sum_j(n_j^alpha)
```

Here `n_i` is the amount of data for language `i`. With `alpha = 1`, sampling follows the raw distribution. Lowering `alpha` flattens the distribution and gives smaller languages more exposure. Fixed multipliers, used in the SEA-Pile v1 mixture and the SEA-LION v2 training recipe, are a simpler version of the same idea.[2][5]

There is no universally correct value. The choice depends on:

- unique-token inventory;
- target-language priorities;
- tokenizer efficiency;
- similarity between languages;
- base-model competence before adaptation;
- observed validation loss and downstream results;
- tolerance for forgetting and memorization.

The mixture must also reserve capacity for English, code and general knowledge. SEA-LION v3 is a clear example. Its published 200 billion-token mix allocated 20% to code and 25% to English. Chinese, Vietnamese and Indonesian each received 13%; Thai received 10%; Filipino-Malay-Tamil and Khmer-Lao-Burmese groupings received 3% each.[6][7]

SEA-LION v4’s Gemma branch used a larger 500 billion-token sample: 10% code, 40% English, 9% Chinese, 8.5% each for Vietnamese, Indonesian and Thai, and 15.5% for the six-language group of Tagalog, Tamil, Malay, Khmer, Lao and Burmese. Sources included SEA-Pile v1 and v2, FineWeb2, non-Common-Crawl material, WangChanBERTa, Dolma and a 0.5% synthetic component for Khmer.[8]

These tables show why corpus size alone is not a model recipe. The same SEA-Pile can produce different models under different source weights, tokenizers and training durations.

## Architecture and optimization: what changed across releases

### V1: scratch pretraining and a regional tokenizer

SEA-LION v1 used MPT-style decoder-only architectures at 3B and 7B parameters, a 2,048-token sequence length and a custom 256,000-token SentencePiece BPE vocabulary trained for the target languages.[4]

A large regional vocabulary can reduce fragmentation. If Thai, Khmer or Tamil text is split into fewer tokens, a fixed context window carries more linguistic content and training becomes more compute-efficient. The cost is a larger embedding and output layer, plus the need to train every part of the model from random initialization.

Scratch pretraining also gives architectural and tokenizer control, but it requires much more compute because the model must relearn general capabilities already present in strong open checkpoints.

### V2: continued pretraining as an efficiency decision

SEA-LION v2 started from Llama 3 8B Instruct, retained its tokenizer and continued training on 48 billion tokens. The published configuration used bfloat16, decoupled AdamW, a weight-stable-decay schedule, a `1e-5` learning rate and global batch size 512. The run used 64 H100 80GB GPUs for about two days.[5]

This is the central appeal of continued pretraining: regional data updates an existing representation instead of building one from zero. It also creates a new risk. A learning rate or mixture that adapts aggressively can damage English, reasoning, instruction following or safety behaviour inherited from the base model.

Starting from an *instruct* model makes this more delicate. Plain next-token pretraining can move the model away from the behavioural alignment of the starting checkpoint. Later instruction tuning must restore or improve it. That is one reason pretraining and post-training cannot be planned independently.

The companion [continued-pretraining note](/notes/continued-pretraining-mid-training) covers learning-rate transitions, replay, forgetting and post-training repair in more depth.

### V3: larger mixtures and inherited tokenizers

SEA-LION v3 included Gemma 2 9B and Llama 3.1 8B and 70B branches, each reported as using a 200 billion-token continued-pretraining mixture.[1][22]

All three retained the upstream vocabulary.[6][7][22]

The paper’s analysis of the 8B and 9B branches also reports BPE-Dropout during continued pretraining.[1]

The current repository cards report 64 H100 GPUs over ten days for Gemma 9B and 64 H200 GPUs over 136 hours for Llama 8B.[6][7]

The paper instead reports eight AWS `p5.48xlarge` nodes and approximately ten and six days respectively, so the public hardware records do not fully agree.[1] The 70B card describes a separate two-stage run using 64 H200s for 200 hours followed by 128 H100s for 495 hours.[22]

The public artifacts also conflict on v3 post-training volume. The paper says the 8B and 9B branches used the same roughly 9.45 million Stage-1 and 7.30 million Stage-2 instruction datasets. The current Gemma card instead reports about 500,000 English plus one million regional pairs, while the Llama 8B card reports 12.3 million English plus 4.5 million regional pairs. These figures should not be presented as one consistent paper finding.[1][6][7]

### V3.5: reasoning became a post-training problem

SEA-LION v3.5 did not report another SEA-Pile continued-pretraining run. It started from the SEA-LION v3 8B and 70B models and concentrated on post-training for reasoning. The model cards describe multi-stage supervised tuning in English and five regional languages, a final stage with 1.5 million DeepSeek-R1-derived reasoning traces, and an expanded pool of 30 million instructions assembled from open data, synthetic generations, rewrites and handwritten Southeast Asian material.[19][20][23]

The interesting design choice was the hybrid mode. Reasoning and non-reasoning examples were trained together, and the chat template exposed a switch between detailed thinking and ordinary responses. That made reasoning a controllable interaction property rather than a permanent output style.

V3.5 also marks a data-governance inflection point. Because the cards include synthetic generations and 1.5 million teacher-distilled traces but do not disclose source proportions, provenance should include the teacher model, generation prompt, decoding settings, language transformation and rewrite path. The question is no longer only whether the crawl contained enough Tamil or Thai. It is whether the reasoning traces teach sound methods in those languages rather than fluent imitations of one teacher.

### V4 and v4.5: a data factory, not one training run

### V4: corpus experiments become part of the model design

SEA-LION v4’s Gemma card says the 500 billion-token mixture was selected from a one-trillion-token pool through experiments. It also records the tokenizer used for counting, the 8K training sequence length, data cutoffs and source-level allocations.[8]

That is a better unit of documentation than “trained on Southeast Asian data.” It lets readers ask whether a gain came from more regional web text, stronger English educational data, code, non-crawl sources, synthetic augmentation or simply more tokens.

The post-training recipe also became more complex: instruction fine-tuning, model merging, online reinforcement learning for instruction following and mathematics, and on-policy alignment. The published cards mention SEA-Instruct, Infinity-Instruct, OpenMath-Instruct 2, Nemotron RL data and DeepMath data.[8][9]

Each stage solves a different problem. Continued pretraining improves language modelling and regional knowledge. Supervised fine-tuning teaches response formats and tasks. Preference or reinforcement learning shapes behaviour. Model merging combines checkpoints without another full training run. Evaluating only the final model cannot cleanly attribute the contribution of each stage.

### V4.5: distillation and deployment

The v4.5 cards describe post-training on SEA-Instruct-2602. The Qwen 27B model is distilled from a much larger Qwen teacher and then merged.[11] The Gemma card reports distillation from a 31B teacher into a small effective-parameter model, but is internally inconsistent about E2B versus E4B lineage and whether model merging was actually used.[10]

SEA-Instruct-2602 is itself a data pipeline. Its card says open-source prompts and synthetic prompts are paired with synthetic responses. `Qwen/Qwen3-235B-A22B` tags prompts, Qwen3-32B generates responses and DeepSeek-V3.1 revises them. The public filtered release keeps prompts marked excellent, coherent and natural and records fields for language, register, domain, task, complexity, cultural knowledge, sensitivity and whether a prompt was translated from English.[12]

The pinned README metadata lists 7,196,718 public examples across Burmese, Filipino, Indonesian, Malay, Tamil, Thai and Vietnamese.[12] Separately, the Gemma v4.5 card reports approximately 8.54 million training pairs and mentions tool-calling data, without reconciling the 1,343,282-example difference.[10] The Qwen card does not publish a corresponding consumed count.[11]

Distillation changes the data question. The student is learning not only from prompts but from the teacher’s output distribution. Teacher errors, cultural defaults and language imbalance can be inherited at scale. Revision and filtering help, but synthetic fluency is not proof of local correctness.

## The hard problems that remain

**Engineering judgment:** The causal interpretations and recommendations in this section are my synthesis, not findings established by any single SEA-LION artifact.

### 1. Scarcity is about domains, not only token counts

A language may have billions of web tokens and still lack medical dialogue, legal guidance, classroom explanations, informal conversation or writing from minority communities. SEA-Pile v2 establishes severe volume imbalance for Burmese, Khmer and Lao, but its public card does not report domain or register coverage; token totals cannot establish domain adequacy.[3]

Start by naming the missing domain and register. Then acquire, license, translate or generate data for that gap. “More Lao” is not a sufficiently precise data requirement.

### 2. Closely related languages and code-switching break neat labels

Indonesian and Malay share vocabulary. Filipino conversation includes English. Singapore text can switch among English, Mandarin, Malay and Tamil in one exchange. A document-level classifier may label the dominant language correctly while discarding the very code-switching behaviour users expect the model to handle. Sailor reports that confidence-based fastText filtering removed genuine Singlish and Manglish, which is a concrete example of this failure mode.[16]

Training records should allow mixed and uncertain labels. Evaluation should include code-switching explicitly. Otherwise a cleaner monolingual corpus can make a less useful regional assistant.

### 3. Token counts are tokenizer-dependent

SEA-Pile v2 reports counts with the Gemma 3 tokenizer.[3] SEA-LION v2 reports counts with the Llama 3 tokenizer.[5]

V3 uses either the Gemma 2 or Llama 3.1 tokenizer.[6][7] V1 used its own 256K vocabulary.[4]

Those numbers are not directly comparable measures of text. One tokenizer may represent the same Thai sentence in far fewer tokens than another. A language that tokenizes inefficiently pays twice: it consumes more sequence positions and more compute per semantic unit.

For cross-model reporting, publish bytes, characters or documents alongside tokenizer-specific token counts. For mixture design, measure fertility — tokens per word, character or byte — by language and register.

The [multilingual-tokenizer note](/notes/multilingual-tokenizers) gives a fuller measurement and migration framework.

### 4. Repetition can masquerade as representation

Oversampling is often used when one language has little data, but repeated data is not new knowledge. A useful training ledger should report unique tokens, sampling multipliers, expected epochs and near-duplicate rates. The v1 card’s separation of unique and total tokens is therefore more informative than a single total.[2]

A low-resource language should also receive stronger memorization tests. Deduplication research shows that repeated training examples increase memorized emission and that deduplicating the corpus reduces it.[24]

### 5. Filtering systems encode a language hierarchy

Quality filters are trained or tuned on some notion of good text. If that notion comes from English news and Wikipedia, the pipeline will favour formal, edited prose and reject dialect, slang, transliteration and oral styles. If human review covers only the largest languages, smaller languages inherit thresholds that may not fit them.

Audit each language-domain pair separately. Sample both accepted and rejected documents. Record reviewers’ reasons. Measure disagreement. Change thresholds only with evidence. Native speakers should help set and revise thresholds, not only review them after the fact.

### 6. Synthetic data solves coverage and creates dependence

Synthetic data can add rare tasks, standardized instruction formats and low-resource-language examples quickly. SEA-LION v4 used a small synthetic component for Khmer, and SEA-Instruct-2602 uses synthetic prompts, responses and revision at much larger scale.[8][12]

The gains come with three risks:

- **teacher bias:** the generator’s cultural and linguistic defaults become the student’s data;
- **translationese:** translated prompts can be grammatical but unlike native requests, a concern also reflected in SEA-HELM’s localization method.[13]
- **output homogenization:** many outputs can inherit one model’s rhythm, structure and stock phrases.

Mitigation needs more than automatic quality scores. Keep provenance for the teacher, prompt, decoding settings and revision model. Compare synthetic and native distributions. Have native speakers test idiom, politeness, register, cultural assumptions and factual claims. Use synthetic data to fill specified gaps, not to make a token counter look balanced.

### 7. Licensing is a chain, not a label

The v1 repository links multiple datasets with their own terms and states that downstream users should follow the original licenses.[2]

SEA-Pile v2 and SEA-Instruct-2602 use ODC-By 1.0.[3][12][25]

Representative SEA-LION model cards use different model licenses.[4][8][10]

ODC-By governs database rights and explicitly notes that rights in individual contents may differ.[25] Model builders therefore need source manifests, permission records, takedown processes and a way to remove data from future versions. “Publicly accessible” and “permitted for model training and redistribution” are different claims.

### 8. PII, toxicity and cultural harm survive filters

SEA-Pile v2 explicitly warns that undesirable content and personally identifiable information may pass through.[3] This is expected: detectors are imperfect, context changes meaning and low-resource languages often have weaker moderation tooling.

Filtering also involves trade-offs. Removing every document that contains identity terms can erase discussion by affected communities. Retaining raw abuse can teach harmful associations. The solution is a documented risk policy, language-specific tests, protected evaluation sets and downstream safety work. Representative SEA-LION cards say the released models have not been aligned for safety; regional language ability should not be mistaken for deployment readiness.[6][8][10]

### 9. Evaluation can be contaminated or culturally thin

If benchmark items appeared in crawl data or instruction mixtures, scores can reward memorization.[24] If a benchmark was machine-translated from English, it may test translationese rather than native competence.[13]

The original SEA-HELM paper improves the situation by combining classic NLP tasks, instruction following, chat, linguistic diagnostics, culture and safety across Filipino, Indonesian, Tamil, Thai and Vietnamese. It also uses native speakers to localize tasks and notes that no single score establishes suitability for the region.[13] The live suite has since expanded; the [SEA-HELM evaluation note](/notes/sea-helm-multilingual-cultural-evaluation) records its current scope and versioning.

Even so, five languages represent only part of Southeast Asia’s linguistic diversity. Scores should be disaggregated by language and task, reported with variance, and paired with human error analysis. A model that improves average translation while regressing Tamil pragmatics has not simply “improved.”

### 10. Reproducibility requires more than releasing weights

A reproducible training release needs:

- exact source and crawl manifests;
- immutable dataset snapshots;
- extraction and normalization versions;
- language-ID models and thresholds;
- deduplication scope and hash method;
- quality features and acceptance thresholds;
- tokenizer version used for counting;
- mixture weights and random seeds;
- tokens actually consumed, not only corpus capacity;
- optimizer, scheduler, batch and sequence settings;
- checkpoint and failure logs;
- post-training datasets and stage order;
- evaluation versions and contamination checks.

SEA-LION’s public artifacts provide many of these pieces, but they are spread across dataset cards, model cards, a paper and the repository. “SEA-Pile v2” can refer to a public dataset release or to a larger later training pool.[3][9]

The paper and repository cards describe v3 hardware differently.[1][6][7]

Instruction-pair totals also vary by artifact.[10][12] A machine-readable training manifest would make these relationships easier to audit.

Even detailed tables need reconciliation. The Gemma v4 card reports a 500 billion-token mixture, but its displayed source rows sum to about 486.5 billion; the Chinese subrows account for 31.5 billion of a stated 45 billion. This does not invalidate the run, but it leaves 13.5 billion tokens without a displayed source allocation.[8]

### 11. Distributed training turns data mistakes into expensive failures

At 64 GPUs, a blocked dataloader, corrupt shard or unstable loss can waste significant money before anyone diagnoses it. Multilingual mixture bugs are especially quiet. The job may run normally while one language is missing, over-repeated or tokenized with the wrong template.

Preflight tests should therefore verify shard counts, language proportions and example hashes. Live telemetry should track loss by source or language where possible, token throughput, skipped batches, gradient norms and checkpoint health. Small mixture ablations are cheaper than discovering after 200 billion tokens that a quality filter removed the wrong data.

## A concrete end-to-end training plan

The safest way to build the next SEA-LION is as a sequence of gates. Each gate should be cheap enough to fail before the next one becomes expensive.

### Gate 1: define the target before collecting data

Choose the languages, variants, domains and intended deployments. Decide whether the goal is a general regional model, a small on-device assistant, a translation model or a tool-using model. Set minimum coverage for each language-domain pair and name the gaps that synthetic data may fill. Define legal and safety exclusions at the same time.

The output is a data specification, not a crawl command. It should include measurement units beyond tokens: unique documents, characters or bytes, domains, dates, registers, code-switching rates and provenance coverage.

### Gate 2: build and audit the unique inventory

Ingest each source into a common schema. Preserve raw references and transformations. Run extraction, Unicode checks, language identification, exact and near deduplication, quality features, PII and safety scans. Do not drop rejected documents immediately; retain sampled rejection sets so native reviewers can estimate false positives.

Before tokenization, publish an internal inventory report by language and source. A corpus that misses its coverage targets should return to acquisition. It should not be “fixed” quietly through oversampling.

### Gate 3: test mixture and tokenizer behaviour on small runs

Tokenize representative samples with the candidate base model. Measure fertility, truncated-document rates and packed-sequence waste for every language. Construct several mixtures rather than one: proportional sampling, moderately flattened sampling and an aggressive low-resource variant.

Run short continued-pretraining experiments from the same checkpoint and seed family. Track validation loss by language and domain, plus a small set of general-capability and memorization probes. The winning mixture is not the one with the lowest global loss. It is the one that moves the target languages without unacceptable regression or repetition.

For a new tokenizer or scratch model, the gate is stricter. Vocabulary allocation, embedding cost and downstream compatibility must justify relearning the foundation.

V1 made that trade to gain a 256K regional vocabulary.[4]

V2 and v3 chose the base model’s tokenizer and spent compute on adaptation instead.[5][6][7]

### Gate 4: ramp continued pretraining with explicit stop rules

Start with a learning-rate range test and a short full-pipeline run. Verify that checkpoints resume, dataloader state is deterministic enough for recovery and the observed source proportions match the manifest. Then ramp hardware and sequence length.

Checkpoints should be evaluated during training, not only at the end. Stop or change the mix if target-language gains flatten, general capability falls beyond the agreed bound, or memorization rises sharply. A precommitted stop rule protects the project from the sunk-cost argument that another few billion tokens will surely repair the curve.

### Gate 5: rebuild behaviour deliberately

Continued pretraining produces a better regional language model, not automatically a better assistant. Supervised instruction tuning should cover native prompts, code-switching, cultural knowledge, tool use and safety-sensitive situations. Synthetic examples should carry generator and revision provenance. Native examples should be tracked separately so their effect can be measured.

Preference optimization or online reinforcement learning should be added only where an evaluation shows a behavioural gap. Each stage needs a frozen pre-stage checkpoint and its own evaluation. Otherwise model merging, instruction tuning and RL become one opaque bundle.

### Gate 6: release a model-data-evaluation bundle

The release unit should contain weights, tokenizer, immutable training manifest, dataset cards, model card, evaluation code, disaggregated results and known limitations. It should state which data is public, gated, linked rather than redistributed, synthetic, licensed directly or unavailable.

Finally, keep a correction path open. Users and communities need a way to report memorized personal data, mistranslation, harmful associations and provenance disputes. A regional model earns trust by showing how those reports change the next dataset and checkpoint.

## Recommended default

For the next regional model, define language and domain targets before collecting data. Report unique inventory, constructed mixture size and consumed tokens separately. Give native speakers authority over labels, filters, synthetic data and evaluation. Use continued pretraining only where small experiments show a gain worth the regression risk. Release the model with a traceable training manifest and a correction path.

SEA-LION’s central lesson is not that Southeast Asia needs a bigger pile of text. It is that the region’s languages, cultures and risks must remain visible from crawl to checkpoint.

## Sources

[1] https://aclanthology.org/2025.ijcnlp-long.30/ — Ng, R. et al. (2025), *SEA-LION: Southeast Asian Languages in One Network*; primary paper for v3 data mixtures, optimization, post-training and evaluation.
[2] https://huggingface.co/datasets/aisingapore/SEA-PILE-v1/blob/a98d31495e0bf411e4142afb705cd0dd5b4b0074/README.md — AI Singapore’s SEA-Pile v1 dataset card at the reviewed revision; source composition, unique-token counts, sampling multipliers, release scope and limitations.
[3] https://huggingface.co/datasets/aisingapore/SEA-PILE-v2/blob/561cda5efecc51f0c0e921a5a6931ba2a5767c6c/README.md — AI Singapore’s SEA-Pile v2 dataset card at the reviewed revision; crawl range, processing method, language totals, license and limitations.
[4] https://github.com/aisingapore/sealion/blob/0a83be10549b718c904302568c4113551a959278/models/sea-lion-v1/sea-lion-v1.md — SEA-LION v1 documentation at repository commit `0a83be1`; architecture, context length, tokenizer and training-data account.
[5] https://github.com/aisingapore/sealion/blob/0a83be10549b718c904302568c4113551a959278/models/sea-lion-v2/sea-lion-v2.md — SEA-LION v2 documentation; starting checkpoint, 48B-token mixture, optimizer and hardware.
[6] https://github.com/aisingapore/sealion/blob/0a83be10549b718c904302568c4113551a959278/models/sea-lion-v3/gemma-sea-lion-v3-9B.md — Gemma SEA-LION v3 9B documentation; mixture, hardware, tokenizer and post-training account.
[7] https://github.com/aisingapore/sealion/blob/0a83be10549b718c904302568c4113551a959278/models/sea-lion-v3/llama-sea-lion-v3-8B.md — Llama SEA-LION v3 8B documentation; mixture, hardware, tokenizer and post-training account.
[8] https://github.com/aisingapore/sealion/blob/0a83be10549b718c904302568c4113551a959278/models/sea-lion-v4/gemma-sea-lion-v4-27B.md — Gemma SEA-LION v4 27B documentation; one-trillion-token pool, 500B-token sample, source allocation and post-training stages.
[9] https://github.com/aisingapore/sealion/blob/0a83be10549b718c904302568c4113551a959278/models/sea-lion-v4/qwen-sea-lion-v4-32B.md — Qwen SEA-LION v4 32B documentation; 100B-token run, larger internal SEA-Pile v2 reference and post-training stages.
[10] https://github.com/aisingapore/sealion/blob/0a83be10549b718c904302568c4113551a959278/models/sea-lion-v4.5/gemma-sea-lion-v4.5.md — Gemma SEA-LION v4.5 documentation; teacher distillation and reported 8.54M-pair training set, with lineage and method inconsistencies discussed in the note.
[11] https://github.com/aisingapore/sealion/blob/0a83be10549b718c904302568c4113551a959278/models/sea-lion-v4.5/qwen-sea-lion-v4.5.md — Qwen SEA-LION v4.5 documentation; teacher-student distillation, model merging and tool-use specialization.
[12] https://huggingface.co/datasets/aisingapore/SEA-Instruct-2602/blob/db7ffdd92ce4e1740de14206da72b6f799790a07/README.md — SEA-Instruct-2602 dataset card at the reviewed revision; prompt tagging, response generation, revision, fields, language counts and license.
[13] https://aclanthology.org/2025.findings-acl.636/ — Ng, R. et al. (2025), *SEA-HELM: Southeast Asian Holistic Evaluation of Language Models*; original evaluation scope, localization practice and cultural diagnostics.
[14] https://aclanthology.org/2020.lrec-1.494/ — Wenzek, G. et al. (2020), *CCNet: Extracting High Quality Monolingual Datasets from Web Crawl Data*; language identification, normalization, deduplication and perplexity filtering.
[15] https://aclanthology.org/2021.naacl-main.41/ — Xue, L. et al. (2021), *mT5: A Massively Multilingual Pre-trained Text-to-Text Transformer*; mC4 construction and multilingual sampling context.
[16] https://aclanthology.org/2024.emnlp-demo.45/ — Dou, L. et al. (2024), *Sailor: Open Language Models for South-East Asia*; regional filtering, code-switching and continued-pretraining mixture design.
[17] https://commoncrawl.org/get-started — Common Crawl’s official description of WARC, WAT and WET crawl products.
[18] https://doi.org/10.52202/079017-3697 — Weber, M. et al. (2024), *RedPajama: An Open Dataset for Training Large Language Models*; quality-signal and web-corpus documentation.
[19] https://github.com/aisingapore/sealion/blob/0a83be10549b718c904302568c4113551a959278/models/sea-lion-v3.5/sea-lion-v3.5.md — SEA-LION v3.5 family overview.
[20] https://github.com/aisingapore/sealion/blob/0a83be10549b718c904302568c4113551a959278/models/sea-lion-v3.5/llama-sea-lion-v3.5-8B.md — Llama SEA-LION v3.5 8B instruction pool, reasoning traces and thinking toggle.
[21] https://github.com/aisingapore/sealion/blob/0a83be10549b718c904302568c4113551a959278/models/sea-lion-v4/sea-lion-v4.md — SEA-LION v4 family overview covering the text, multimodal and Apertus branches.
[22] https://github.com/aisingapore/sealion/blob/0a83be10549b718c904302568c4113551a959278/models/sea-lion-v3/llama-sea-lion-v3-70B.md — Llama SEA-LION v3 70B mixture, tokenizer, optimizer and two-stage hardware run.
[23] https://github.com/aisingapore/sealion/blob/0a83be10549b718c904302568c4113551a959278/models/sea-lion-v3.5/llama-sea-lion-v3.5-70B.md — Llama SEA-LION v3.5 70B instruction pool, reasoning traces and thinking toggle.
[24] https://aclanthology.org/2022.acl-long.577/ — Lee, K. et al. (2022), *Deduplicating Training Data Makes Language Models Better*; duplication, memorized emission and benchmark overlap.
[25] https://opendatacommons.org/licenses/by/1-0/ — Open Data Commons Attribution License v1.0; database rights and the distinction between database and content rights.

## Change history

- **2026-08-05 — v1.0:** Initial reviewed version, checked against current public sources and pinned repository revisions.
