---
title: "Multilingual Tokenizers: Designing the Model's Text Interface"
description: "How to choose and evaluate a multilingual tokenizer, using Southeast Asian scripts, token efficiency, and SEA-LION as the test case."
kind: "reference"
section: "Training"
topics:
  - "tokenization"
  - "multilingual models"
  - "Southeast Asia"
  - "token efficiency"
published: "2026-07-29"
updated: "2026-07-29"
checked: "2026-07-29"
version: "1.0"
status: "Reviewed"
order: 1
---

# Multilingual Tokenizers: Designing the Model's Text Interface

The tokenizer is usually treated as a preprocessing utility. That is a mistake.

A tokenizer decides how raw text becomes the sequence that a language model can see. In doing so, it allocates four scarce resources:

1. **Vocabulary capacity** — which character sequences get dedicated embeddings.
2. **Context capacity** — how much human text fits inside a fixed token window.
3. **Training compute** — how many prediction steps are spent representing the same content.
4. **Statistical support** — which meanings and morphemes are learned as stable units, and which are reconstructed from fragments.

These decisions are less visible in English and especially consequential in a region as linguistically varied as Southeast Asia. Thai, Lao, Khmer, and Burmese commonly omit spaces between words. Vietnamese uses spaces, but often between syllables rather than the semantic units an English-oriented pre-tokenizer expects. Indonesian and Malay use productive affixation and reduplication. Filipino and other Philippine languages combine rich morphology with extensive English code-switching. Tamil uses another script and another morphological system. Real users mix languages, romanizations, emojis, product names, URLs, numerals, and local spellings in the same message.

A multilingual model can technically accept all of this if it has byte or character fallback. That is not the same as representing it well.

> **Short version:** a multilingual tokenizer is a learned compression policy. If it compresses one language poorly, users of that language pay in latency, money, usable context, and often model quality.

## 1. What the tokenizer actually does

A modern tokenizer is usually a pipeline, not one algorithm:

```text
raw Unicode text
  -> normalization
  -> optional pre-tokenization
  -> subword segmentation
  -> token IDs
  -> model embeddings
```

The stages matter separately.

### 1.1 Normalisation

Normalisation may standardise Unicode forms, whitespace, control characters, quotes, or compatibility characters. It can reduce meaningless variation, but it can also erase distinctions. The safest policy depends on the languages and applications.

Unicode deserves particular care in Southeast Asia. Vietnamese letters may contain a base letter, a vowel diacritic, and a tone mark. Visually identical text can arrive in precomposed or decomposed form. Thai and other Brahmic-derived scripts use combining marks whose order and rendering can be tricky. Burmese text has also lived through incompatible legacy encodings. A model trained on several representations of what humans perceive as the same string wastes vocabulary and data.

The goal is not to normalize aggressively. It is to define a reversible or at least linguistically defensible canonical form, test it against native text, and record the policy.

### 1.2 Pre-tokenization

A pre-tokenizer splits text into candidate regions before subword learning. Whitespace and punctuation rules work reasonably well for English. They can hard-code the wrong ontology elsewhere.

Thai, Khmer, Lao, and Burmese often write phrases without spaces between every word. Splitting only on whitespace leaves long spans for the subword algorithm. Calling an external word segmenter first may help, but then the language model inherits the segmenter’s errors and domain assumptions. Vietnamese presents the reverse trap: spaces are common, but an orthographic “word” can contain several space-separated syllables. Treating each space as a hard boundary can prevent useful multi-syllable lexical units from becoming tokens.

This is one reason [SentencePiece](https://arxiv.org/abs/1808.06226) was important. Kudo and Richardson designed it to train directly from raw sentences, treating whitespace as a normal symbol rather than requiring language-specific word segmentation. It does not solve every script issue, but it removes an English-specific prerequisite.

### 1.3 Subword model

The subword model builds a finite vocabulary and maps text to tokens from it.

**Byte-pair encoding (BPE)** starts from small units and repeatedly merges the most frequent adjacent pair. The method came from compression and was adapted to open-vocabulary neural machine translation by [Sennrich, Haddow, and Birch](https://aclanthology.org/P16-1162/). Given a fixed training corpus, vocabulary size, and merge procedure, standard BPE produces one deterministic segmentation.

**Unigram tokenization** starts from a large candidate vocabulary and removes tokens to maximize the likelihood of the corpus under a probabilistic segmentation model. Kudo’s [subword regularization and unigram language-model work](https://aclanthology.org/P18-1007/) also made it practical to sample alternative segmentations during training.

**WordPiece** is closely related to subword methods but chooses vocabulary additions according to a likelihood or score rather than raw pair frequency. Implementations differ, so the label alone does not fully specify behavior.

**Byte-level BPE** or a byte fallback guarantees that arbitrary input can be encoded. That is an excellent safety property. But it can conceal poor coverage: a rare script may be represented as several byte tokens per character while English words remain single tokens.

**Character and byte tokenizers** avoid unknown characters altogether and use small vocabularies, but they create longer sequences. That shifts work from the embedding table into the transformer. Newer architectures can make byte-level modeling competitive, but the basic trade-off remains.

### 1.4 Special tokens and chat templates

The vocabulary also includes control symbols: beginning and end markers, padding, separators, tool-call markers, multimodal placeholders, and role delimiters. These are part of the model contract. Changing them without updating the template and training data can silently break instruction following.

A tokenizer is therefore coupled to the embedding matrix, language-model head, data pipeline, checkpoints, serving stack, and chat format. Replacing one after pretraining is not like replacing a parser library.

## 2. Token efficiency is a systems property

There is no single perfect measure of tokenization quality. Compression is necessary, but not sufficient.

Let a tokenizer $T$ map a text $x$ to a token sequence. The basic sequence length is:

$$
L_T(x) = |T(x)|.
$$

From this we can calculate several useful measures.

### 2.1 Fertility

**Fertility** is commonly the average number of subword pieces aligned to tokenized words. After declaring a word-segmentation policy $W(D)$, calculate:

$$
F_T(D) = \frac{\sum_{w \in W(D)} \text{pieces}_T(w)}{|W(D)|}.
$$

Lower fertility means fewer pieces per word. State how punctuation, whitespace, and special tokens are handled. The measure is intuitive for languages with stable whitespace-delimited words. It is less reliable for Thai or Khmer unless the denominator comes from a trusted segmenter; otherwise it embeds the segmentation assumption under test.

[Rust and colleagues](https://arxiv.org/abs/2012.15613) compared multilingual and monolingual BERT tokenizers and found that tokenizer quality—measured with fertility and the proportion of words split into continued subwords—correlated substantially with downstream performance. The finding is important, but it is not a universal law. Tokenizer quality interacts with data, model size, vocabulary, and training objective.

### 2.2 Characters, bytes, and grapheme clusters per token

For cross-script comparison, use more than words:

$$
C_T(D) = \frac{\text{Unicode characters in }D}{\text{tokens in }T(D)}
$$

and

$$
B_T(D) = \frac{\text{UTF-8 bytes in }D}{\text{tokens in }T(D)}.
$$

Characters per token is easy to explain but treats combining marks as characters. Bytes per token is not script-neutral: it confounds tokenizer segmentation with UTF-8 encoding width. A high value may partly reflect multi-byte code points even when grapheme-level efficiency is poor, so report it alongside graphemes per token and parallel-text token premiums. Grapheme clusters—the units users perceive as characters—can be more meaningful, though Unicode grapheme segmentation is itself technical.

A good tokenizer report publishes several denominators rather than choosing the one that flatters the model.

### 2.3 Token premium and parity

For parallel or closely matched content in languages $a$ and $b$, define a token premium:

$$
P_{a:b} = \frac{|T(x_a)|}{|T(x_b)|}.
$$

If the same message takes 300 tokens in one language and 150 in another, the first language pays a $2\times$ token premium. The [study by Petrov and colleagues](https://arxiv.org/abs/2305.15425) showed large cross-language disparities in commercial and open tokenizers, linking them to user-facing cost and service quality. Their exact ratios depend on the tokenizer and corpus, but the broader point is durable: per-token pricing is not language-neutral when tokenization is not language-neutral.

Parallel text is useful, but translation length is not inherently equal. A language may express the same meaning with more characters or words. Treat parity as a diagnostic, not proof of discrimination by itself.

### 2.4 Unknown and fallback rates

Measure:

- unknown-token rate;
- proportion of characters represented through byte fallback;
- average bytes used per grapheme;
- proportion of common words fragmented into single-character or single-byte tokens;
- round-trip failures, where decoding the encoded sequence does not reproduce the intended text.

A zero unknown-token rate can coexist with terrible efficiency. Byte fallback makes “can encode” a very low bar.

### 2.5 Context and compute consequences

Suppose a model has an 8,192-token context window. If one language takes twice as many tokens to express comparable content, it effectively gets about half the usable textual context. Conversation history is truncated earlier. Retrieval systems can include fewer passages. Long forms, regulations, and contracts fit less often.

During inference, each extra token requires another autoregressive decoding step. The key-value cache also grows with sequence length. Prefill attention can scale quadratically with sequence length in a straightforward implementation, although FlashAttention, sparse attention, sliding windows, and other techniques change the realized cost. Decode cost is not simply quadratic, but longer prompts and outputs still consume memory bandwidth and time.

During training, a fixed token budget does not imply a fixed amount of human language. Poorly tokenised languages contribute less semantic content per token. A “100-billion-token multilingual corpus” may therefore allocate much less text to one language than raw token percentages suggest.

This is why [Schmidt and colleagues](https://arxiv.org/abs/2402.18376) argue that tokenization should not be evaluated as compression alone. A tokenizer can compress a corpus well yet choose units that are poor for learning. [Qtok](https://arxiv.org/abs/2410.12989) similarly looks beyond a single intrinsic statistic, auditing tokenizers across language coverage, token completeness, and cross-language token distribution — still intrinsic measures, not a downstream-performance test. The practical lesson is modest: use compression metrics, but validate them against models and tasks.

## 3. Why Southeast Asia is a hard tokenizer test

“Southeast Asian languages” is not one tokenizer category. It is a stress test for almost every simplifying assumption.

### 3.1 Scripts without consistent word spaces

Thai, Khmer, Lao, and Burmese commonly run words together inside phrases or sentences. Their scripts are not interchangeable: they differ in orthographic structure, combining marks, consonant stacks, vowel placement, and segmentation conventions. Wikipedia’s script summaries are useful orientation—[Thai](https://en.wikipedia.org/wiki/Thai_script), [Khmer](https://en.wikipedia.org/wiki/Khmer_script), [Lao](https://en.wikipedia.org/wiki/Lao_script), and [Burmese](https://en.wikipedia.org/wiki/Burmese_alphabet)—but tokenizer design should be validated with native speakers and language-specific resources.

Two failure modes follow:

- A whitespace pre-tokenizer creates very long chunks and learns accidental substrings from whatever corpus is largest.
- A mandatory external segmenter creates clean-looking units but locks in errors, especially for names, slang, code-switching, and specialized domains.

Raw-text subword training is a useful default. It should be tested against language-aware alternatives rather than assumed superior.

### 3.2 Vietnamese: spaces are not English spaces

Vietnamese uses a Latin-derived alphabet with extensive diacritics. Spaces often separate syllables, while lexical words can be multisyllabic. A tokenizer that forbids merges across spaces may over-fragment common concepts. Unicode normalization also matters because tones and vowel marks can appear in different code-point compositions.

The corpus must retain diacritics. Stripping them to simplify training destroys distinctions and produces a model that fails on normal writing.

### 3.3 Malay and Indonesian: familiar script, different structure

Latin script can create false confidence. Malay and Indonesian use productive prefixes, suffixes, circumfixes, compounding, and reduplication. A vocabulary trained mostly on English may split common affixed forms inefficiently or memorize whole high-frequency forms without learning reusable morphemes.

The right answer is not necessarily a linguistic morpheme tokenizer. Subword models optimize a statistical objective, and morphological analyzes can be contested. But the evaluation set should include affix families, reduplication, names, loanwords, formal writing, and conversational spelling.

### 3.4 Filipino and code-switching

Filipino/Tagalog is morphologically rich, and everyday text often mixes Filipino and English. Similar mixing occurs across Singapore, Malaysia, Indonesia, and other multilingual communities. Code-switching is not noise to be filtered out. It is a normal register.

A tokenizer trained on clean monolingual corpora may behave badly at the switch boundary, around contractions, or on borrowed words whose spelling has been localized. Test complete messages, not only isolated sentences by language.

### 3.5 Tamil and other scripts in the region

Tamil is used in Singapore and Malaysia as well as South Asia. A regional tokenizer that optimizes only for national majority languages can still fail important communities. The same applies to Javanese, Sundanese, Cebuano, Ilocano, and many other languages and dialects with substantial speaker populations but much smaller clean web corpora.

This is a distribution problem as much as an algorithm problem. If a language contributes little training text, frequency-based vocabulary learning will allocate it few useful tokens unless sampling or quotas compensate.

### 3.6 Romanisation, transliteration, and legacy encoding

Users may write Burmese, Thai, Khmer, or other languages in Latin script. Names can appear in several transliterations. Burmese corpora may contain both Unicode and legacy-encoded text. Social text contains creative spellings, emoji, hashtags, and inconsistent spacing.

Over-cleaning can delete the evidence of real usage. Under-cleaning can teach the tokenizer duplicate representations. The right pipeline separates canonicalization, recoverable repair, and domain-preserving variation.

## 4. Vocabulary allocation is the hidden multilingual policy

A fixed vocabulary creates competition. If English dominates the tokenizer-training corpus, frequent English substrings win merges. Low-resource languages remain closer to characters or bytes.

Four knobs matter:

1. **Corpus composition.** Which languages, domains, and registers are present?
2. **Sampling.** Are languages sampled in proportion to raw data, uniformly, or with temperature smoothing?
3. **Vocabulary size.** How much embedding capacity is available?
4. **Algorithm and constraints.** Can merges cross spaces? Is byte fallback enabled? Are scripts or languages guaranteed minimum representation?

Raw proportional sampling usually reproduces internet inequality. Uniform sampling can overfit tiny duplicated corpora and spend too much vocabulary on idiosyncratic text. Temperature sampling offers a middle ground:

$$
p_l = \frac{n_l^\alpha}{\sum_j n_j^\alpha}, \qquad 0 < \alpha < 1,
$$

where $n_l$ is the amount of data for language $l$. Lower $\alpha$ upweights smaller languages. This is not a moral constant; it is a design parameter to tune with held-out efficiency and downstream evaluation.

A larger vocabulary usually shortens sequences but enlarges the input embedding and output projection. With untied embeddings, the parameter cost can be roughly $2Vd$ for vocabulary size $V$ and hidden dimension $d$; with tied weights it is roughly $Vd$. Large vocabularies also reduce how often rare tokens are updated. The optimal point depends on model size, memory, serving hardware, and language mix.

## 5. A practical multilingual tokenizer workflow

### Step 1: define the unit of success

Write down the target languages, scripts, domains, and deployment constraints. Include code-switching and user-generated text if the product will see them. Decide what must be reversible and which normalizations are acceptable.

Do not use “supports 20 languages” as the requirement. Support has levels: encodable, efficient, intelligible, task-capable, culturally appropriate.

### Step 2: build a tokenizer corpus, not a pretraining dump

The ideal tokenizer corpus is representative and diverse, but it does not need to contain every pretraining token. Deduplicate aggressively enough that copied pages do not dominate merges. Balance language, domain, and register. Preserve a separate natural-frequency evaluation sample so that balanced training does not hide production costs.

Keep source provenance and licenses. Tokenizer training can leak strings into a distributable vocabulary, including names, secrets, or offensive fragments.

### Step 3: compare normalization and pre-tokenization policies

For every script:

- test NFC and, where justified, other normalization forms;
- measure changed and deleted code points;
- run round-trip tests;
- inspect combining marks and grapheme clusters;
- compare raw SentencePiece-style training with language-aware segmentation;
- evaluate URLs, code, numerals, emoji, names, and mixed-language messages.

Use native-speaker review for a sample of frequent and pathological segmentations. Intrinsic metrics will not tell you that a split is offensive, misleading, or unnatural.

### Step 4: train a small design grid

Compare at least:

- BPE and unigram;
- several vocabulary sizes;
- two or three language-sampling temperatures;
- byte fallback on and off, if the stack permits;
- hard whitespace boundaries versus whitespace-as-symbol;
- deterministic segmentation versus subword regularization.

Do not launch a full model run for every point. First eliminate clearly poor tokenizers with intrinsic tests, then use small proxy models to test whether the remaining differences survive training.

### Step 5: publish a tokenizer scorecard

At minimum, report per language and domain:

| Measure | What it reveals | Main caveat |
|---|---|---|
| Tokens per sentence | Direct context and cost burden | Sentences differ in length |
| Fertility | Fragmentation per word | Word segmentation is language-dependent |
| Characters/graphemes per token | Script-level compression | Grapheme tooling varies |
| Bytes per token | Byte-level efficiency | UTF-8 length differs by script |
| Byte-fallback share | Hidden poor coverage | Depends on implementation |
| Unknown rate | Encodability failure | Often zero with fallback |
| Round-trip accuracy | Data integrity | Does not measure useful units |
| Parallel-text token premium | Relative user burden | Translation is not length-neutral |
| Embedding parameters | Model capacity cost | Tied and untied heads differ |
| Proxy-model loss and tasks | Learning usefulness | More expensive and setup-dependent |

Report medians and tails, not only means. A tokenizer that is efficient on news but terrible on chat, names, or minority scripts will look acceptable in an aggregate.

### Step 6: inspect the vocabulary

List:

- the most frequent tokens by language and script;
- tokens seen only a few times;
- suspicious personal data or boilerplate;
- malformed Unicode;
- script-crossing tokens;
- whitespace and punctuation variants;
- common words split into bytes;
- tokens that decode to replacement characters.

Vocabulary inspection is cheap. Discovering a bad tokenizer after a trillion-token training run is not.

## 6. SEA-LION as a useful case study

SEA-LION illustrates two legitimate strategies.

The original SEA-LION models were trained from scratch. Both v1 models used a custom 256,000-token `SEABPETokenizer`, trained with SentencePiece BPE on 20 million lines sampled from the SEA-LION corpus. A large vocabulary was intended to reduce fragmentation across a diverse regional corpus, but it also consumed substantial embedding and output capacity. See the [SEA-LION v1 model card](https://huggingface.co/aisingapore/SEA-LION-v1-3B).

Later SEA-LION generations started from strong existing models. The [SEA-LION v3 paper](https://arxiv.org/abs/2504.05747) describes continued pretraining of Llama-3.1-8B-Instruct and Gemma-2-9B checkpoints; the respective model cards confirm each kept its base model's tokenizer untouched. The team used [BPE-Dropout](https://aclanthology.org/2020.acl-main.170/) during continued pretraining: instead of always taking the deterministic BPE path, merge operations are randomly dropped so the model sees alternative, usually finer-grained segmentations. This gives the model more than one compositional path through the same text without changing token IDs or embedding shapes.

That choice avoids tokenizer surgery. It also accepts the base tokenizer’s inherited allocation. The trade-off is often sensible: preserving compatibility with a strong checkpoint may be worth more than achieving the best possible regional compression.

The [Gemma-SEA-LION v4 model card](https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-27B) reports a 500-billion-token continued-pretraining run across Southeast Asian languages, English, Chinese, and code, on a Gemma 3 base whose 262,144-token vocabulary already differs from v3's Gemma 2 base at 256,000. The [Qwen-SEA-LION v4 card](https://huggingface.co/aisingapore/Qwen-SEA-LION-v4-32B-IT) reports a third path, on Qwen3-32B, and a fourth lineage, [Apertus-SEA-LION v4](https://huggingface.co/aisingapore/Apertus-SEA-LION-v4-8B-IT), continues pretraining from Swiss AI's Apertus-8B-Instruct-2509 — so "two legitimate strategies" is, by v4, closer to one strategy running four inherited tokenizers concurrently. By v4.5, the [Qwen-SEA-LION model card](https://huggingface.co/aisingapore/Qwen-SEA-LION-v4.5-27B-IT) emphasizes post-training, distillation, reasoning, and deployment rather than claiming a new regional tokenizer — but the base underneath that post-training moved to Qwen3.6-27B, and its vocabulary grew from 151,936 to 248,320 tokens as a side effect of that move, not a design choice.

This evolution makes the core decision clear:

- **Training from scratch:** design the tokenizer and model together.
- **Continued pretraining:** preserve the base tokenizer unless measured inefficiency is severe enough to justify vocabulary extension and embedding work.

The clearest evidence of that inheritance is the vocabulary-size sequence itself: 256,000 (v1, custom-built) → 256,000 (v3, inherited from Gemma 2) → 151,936 (v4, inherited from Qwen3) → 248,320 (v4.5, inherited from Qwen3.6) → 262,144 (the parallel Gemma-3 line). Exactly one of those numbers was a deliberate design decision. The rest arrived as a side effect of whichever base model a given release happened to build on — a different failure mode from the mid-CPT vocabulary extension this section is mostly about, and one worth watching for on its own terms: switching base lineage replaces a tokenizer wholesale without anyone performing tokenizer surgery.

If vocabulary extension is necessary, new embeddings must be initialized and trained. Random initialization is simple but creates a cold region in the embedding space. [OFA](https://arxiv.org/abs/2311.08849) is one example of research that initializes unseen multilingual subwords using information from aligned multilingual vectors and factorises the embedding parameters. Other methods average or compose existing subword embeddings. None makes the change free: the model, output head, checkpoint format, quantization, and serving stack must all agree on the new vocabulary.

## 7. A tokenizer review checklist

### “It has byte fallback, so every language is supported”

Byte fallback proves encodability, not efficiency or capability. Publish the fallback rate and token premium.

### “SentencePiece and BPE are different algorithms”

They are not competitors. SentencePiece is a training library and serialization format; BPE and unigram are subword algorithms it can implement either of. A release note describing a move "from a SentencePiece tokenizer to BPE" almost always means something else changed — usually the base model, and the vocabulary and pre-tokenization scheme came along with it. Verify the actual tokenizer file or config before repeating a vendor's framing of what changed; a switch in base-model lineage can look like a tokenizer upgrade when it is really a tokenizer replacement nobody chose on its own terms.

### “Lower fertility means a better model”

Lower fertility can come from memorising long strings, increasing vocabulary excessively, or choosing units that do not help learning. Pair intrinsic measures with proxy-model loss and downstream tasks.

### “One sentence per language is enough”

Tokenizer failures live in the tails: names, dialects, spelling variation, code-switching, social text, numerals, OCR, and malformed Unicode. Use stratified corpora and percentile reporting.

### “A language detector can balance the corpus”

Language identification is least reliable for short, mixed, and low-resource text—the cases where balancing matters most. Keep confidence scores, permit mixed labels, and audit samples.

### “We can change the tokenizer later”

You can, but it is a model migration. Budget for embedding initialization, continued training, regression tests, quantization compatibility, and deployment updates.

### “English parity is the goal”

Exact parity may be linguistically impossible and can encourage gaming the denominator. The practical goal is to remove avoidable premiums while preserving model quality and data integrity.

## 8. A token-count skeleton

The following sketch compares token counts without pretending to solve language-specific word segmentation:

```python
from collections import defaultdict
from statistics import median


def score(tokenizer, rows):
    # rows: iterable of {"language": str, "text": str}
    by_language = defaultdict(list)

    for row in rows:
        text = row["text"]
        ids = tokenizer.encode(text, add_special_tokens=False)
        tokens = len(ids)
        if tokens == 0:
            continue

        by_language[row["language"]].append({
            "tokens": tokens,
            "characters": len(text),
            "bytes": len(text.encode("utf-8")),
        })

    report = {}
    for language, items in by_language.items():
        total_tokens = sum(x["tokens"] for x in items)
        report[language] = {
            "examples": len(items),
            "median_tokens": median(x["tokens"] for x in items),
            "corpus_chars_per_token": sum(x["characters"] for x in items) / total_tokens,
            "corpus_bytes_per_token": sum(x["bytes"] for x in items) / total_tokens,
        }
    return report
```

A production harness should add grapheme counting, parallel-text IDs, domain slices, special-token accounting, byte-fallback detection, confidence intervals, and round-trip assertions. It should pin the tokenizer revision. “The Qwen tokenizer” is not a reproducible identifier without a model and commit.

## 9. Recommended default

For a new Southeast Asian foundation model, train several tokenizer candidates on a deliberately balanced regional corpus, retain byte fallback, and select with a combination of per-language compression, native-speaker inspection, and small-model experiments. Treat the vocabulary budget as part of the architecture search.

For [continued pretraining](/notes/continued-pretraining-mid-training) of a strong open model, begin by keeping its tokenizer. Measure token premiums on the actual target languages and applications. If the cost is tolerable, compatibility wins. If it is not, compare vocabulary extension against segmentation regularization such as BPE-Dropout, and require a full migration plan before adding tokens.

For deployment, publish per-language token-efficiency tables next to accuracy. Users pay for tokens and live inside token windows. A benchmark that hides this burden is incomplete.

The principle is simple: **do not ask whether a tokenizer supports a language. Ask how much representation, context, compute, and learning capacity that language receives.**

## Sources

### Primary and technical sources

- Kudo, T. and Richardson, J. (2018), [*SentencePiece: A simple and language independent subword tokenizer and detokenizer for Neural Text Processing*](https://arxiv.org/abs/1808.06226) — primary paper for raw-text, language-independent tokenization.
- Sennrich, R., Haddow, B., and Birch, A. (2016), [*Neural Machine Translation of Rare Words with Subword Units*](https://aclanthology.org/P16-1162/) — primary paper adapting BPE to open-vocabulary neural text models.
- Provilkov, I., Emelianenko, D., and Voita, E. (2020), [*BPE-Dropout: Simple and Effective Subword Regularization*](https://aclanthology.org/2020.acl-main.170/) — primary source for stochastic BPE merge dropout.
- Kudo, T. (2018), [*Subword Regularization: Improving Neural Network Translation Models with Multiple Subword Candidates*](https://aclanthology.org/P18-1007/) — primary source for unigram segmentation and subword regularization.
- Rust, P. et al. (2021), [*How Good is Your Tokenizer? On the Monolingual Performance of Multilingual Language Models*](https://arxiv.org/abs/2012.15613) — empirical evidence relating fertility and split rates to downstream results.
- Petrov, A. et al. (2023), [*Language Model Tokenizers Introduce Unfairness Between Languages*](https://arxiv.org/abs/2305.15425) — empirical evidence for language-dependent token premiums and user cost.
- Schmidt, C. W. et al. (2024), [*Tokenization Is More Than Compression*](https://arxiv.org/abs/2402.18376) — evidence that compression alone does not predict learned-model quality.
- Liu, Y. et al. (2024), [*OFA: A Framework of Initializing Unseen Subword Embeddings for Efficient Large-scale Multilingual Continued Pretraining*](https://arxiv.org/abs/2311.08849) — primary method for initializing added multilingual vocabulary.
- Chelombitko, I. et al. (2024), [*Qtok: A Comprehensive Framework for Evaluating Multilingual Tokenizer Quality in Large Language Models*](https://arxiv.org/abs/2410.12989) — multilingual intrinsic-evaluation framework.
- Ng, R. et al. (2025), [*SEA-LION: Southeast Asian Languages in One Network*](https://arxiv.org/abs/2504.05747) — primary technical report for SEA-LION v3 tokenizer and CPT choices.
- AI Singapore, [SEA-LION v1 3B model card](https://huggingface.co/aisingapore/SEA-LION-v1-3B), [Gemma-SEA-LION v3 model card](https://huggingface.co/aisingapore/Gemma-SEA-LION-v3-9B), [Gemma-SEA-LION v4 model card](https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-27B), [Qwen-SEA-LION v4 32B IT model card](https://huggingface.co/aisingapore/Qwen-SEA-LION-v4-32B-IT), [Apertus-SEA-LION v4 8B IT model card](https://huggingface.co/aisingapore/Apertus-SEA-LION-v4-8B-IT), and [Qwen-SEA-LION v4.5 model card](https://huggingface.co/aisingapore/Qwen-SEA-LION-v4.5-27B-IT) — checked 2026-07-29 for release-specific tokenizer and training details.

### Orientation sources

- Wikipedia, [Byte-pair encoding](https://en.wikipedia.org/wiki/Byte-pair_encoding), [Thai script](https://en.wikipedia.org/wiki/Thai_script), [Khmer script](https://en.wikipedia.org/wiki/Khmer_script), [Lao script](https://en.wikipedia.org/wiki/Lao_script), [Burmese alphabet](https://en.wikipedia.org/wiki/Burmese_alphabet), [Vietnamese alphabet](https://en.wikipedia.org/wiki/Vietnamese_alphabet), and [Tamil script](https://en.wikipedia.org/wiki/Tamil_script). These were used for script orientation, not as the authority for model-design claims.

## Change history

- **2026-07-29 — v1.0:** Initial reviewed version, checked against current public sources.
