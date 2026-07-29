# Topic Vocabulary

`topics` are reader-facing retrieval terms. They support library search and future related-note links; they are not a second section hierarchy.

## Rules

- Prefer an existing term when it means the same thing.
- Use short, specific noun phrases: `AI governance`, `risk management`, `evaluation`, `AI agents`.
- Use the same capitalization and spelling in every note.
- Put the broader concept first. Prefer `AI governance` to `governance of AI`; prefer `AI agents` to `agentic systems` when the note is about the system rather than a single model.
- Add a new topic only when a reader would plausibly search for it across more than one note.
- Do not repeat the section or `kind` unless it improves retrieval.
- Treat `Misc` as a temporary holding section, not a permanent catch-all. Reclassify a note when a clearer section exists; propose a new section only after a recurring, distinct retrieval need appears.

## Current preferred terms

| Area | Preferred terms | Avoid splitting into synonyms |
| --- | --- | --- |
| Governance | `AI governance`, `boards`, `oversight`, `risk management`, `assurance` | `board governance`, `AI oversight` unless the distinction matters |
| Agents | `AI agents`, `agent harnesses`, `tool use`, `evaluation`, `safety` | `agent systems`, `agentic systems` for the same concept |
| Training | `pretraining`, `continued pretraining`, `mid-training`, `tokenization`, `token efficiency`, `multilingual models` | `continual pre-training`, `tokenizers` when the same concept is intended |
| Post-training | `post-training`, `alignment`, `fine-tuning`, `evaluation`, `safety` | `alignment training`, `post training` |
| Regional AI | `Southeast Asia`, `SEA-LION`, `SEA-HELM`, `cultural evaluation` | broad `culture` or `regional models` when a specific term applies |
| Cross-cutting | `AI adoption`, `workflow design` | `AI implementation`, `agent workflow` when the distinction does not matter |

This is editorial guidance, not a validator enum. If a genuinely new term is needed, add it here when it first becomes reusable.
