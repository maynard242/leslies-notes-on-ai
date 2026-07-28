---
title: "AI Governance: Five Questions for the Board"
description: "A practical board guide to oversight of material AI risk: inventory, ownership, appetite, monitoring, and proof."
kind: "guide"
section: "Governance"
published: "2026-07-28"
updated: "2026-07-28"
checked: "2026-07-28"
version: "1.1"
status: "Maintained"
topics:
  - AI governance
  - boards
  - oversight
  - risk management
  - assurance
order: 1
---

# AI Governance: Five Questions for the Board

**Board note — July 2026**

---

AI is now board business. Not because the technology is new — boards have absorbed new technology before — but because three things arrived at once, and each of them points at the boardroom.

The law came first. The [EU AI Act](https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng), as amended by the [Digital Omnibus on AI](https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng), has staged obligations for providers and deployers. California's [SB 53](https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202520260SB53) requires covered frontier developers to publish and maintain a frontier AI framework; New York's [RAISE Act](https://www.nysenate.gov/legislation/bills/2025/S6953/amendment/B) requires covered developers to publish safety protocols and report specified incidents. The precise reach depends on definitions, amendments, and effective dates. The common board question is simpler: can the company show the framework it adopted, the evidence behind it, and what happened when the evidence changed?

Fiduciary doctrine came second. The Caremark line of Delaware cases is fact-specific, but it puts a premium on a board-level information and reporting system for mission-critical risk. In [*Marchand v. Barnhill*](https://law.justia.com/cases/delaware/supreme-court/2019/533-2018.html), the Delaware Supreme Court allowed a claim to proceed where the complaint supported an inference that no board-level monitoring or reporting system existed for the company's central food-safety risk. That does not mean every AI incident creates director liability. It does mean that where AI is material to operations, compliance, or safety, the board should be able to identify its oversight structure rather than rely on informal management reporting.

The technology came third, and it changed character. Earlier enterprise software largely executed decisions people had made. Current systems can shape decisions about customers, credit, hiring, and content—and, through autonomous agents, increasingly act in a company's name. The gap between what is deployed and what is overseen is the risk.

One frame organizes everything that follows. An organization using AI must be able to do three things: **make** claims about what its systems will and will not do, **keep** those claims in operation, and **prove** them to someone with no reason to take its word — a regulator, a counterparty, a court. Management owns the first two. The board's job is to confirm all three exist and connect. Most organizations make claims fluently, keep them unevenly, and cannot prove them at all. The law is aimed at the third.

Five questions test the three verbs. Asking them, understanding the answers, and recording the exchange creates a practical oversight record; it does not by itself establish satisfaction of any fiduciary, statutory, or regulatory duty. A board that cannot get crisp answers has found its work plan.

---

## 1. Where is AI in use, and which uses matter?

The board cannot oversee what management has not mapped. The first artifact to request is an inventory: every AI system in use across the enterprise, including AI embedded in vendor products and the unofficial tools staff adopted without asking. Then a materiality cut — which uses touch customers, regulated decisions, safety, or public commitments.

Every serious framework in the world starts here, and for the same reason financial control starts with a ledger. Expect the register to be longer than anyone predicted; that discovery is the point. Expect the vendor column to be the least complete; that gap is where third-party risk lives.

Understand what the answer tells you. A management team that produces the inventory in a week has been governing. A team that needs a quarter has been deploying.

## 2. Who answers for it — to management, and to us?

Somebody in management must own AI risk end to end, with a name, a mandate, and a reporting line this board can see. And somebody on this board must own the topic. Practice varies defensibly — full board for strategy, risk or audit committee for controls, a technology committee where AI is the business. What is not defensible is ambiguity.

Write the allocation into committee charters. Put AI on the agenda at a stated cadence. This is not ceremony. In litigation and regulatory review, the record of what the board asked, and when, is the evidence that oversight occurred. Minutes are the board's proof layer.

One demand belongs in the reporting structure from the start: AI risk is not one thing. Systems malfunction — bias, fabrication, quiet degradation. People misuse them — deliberately, adaptively. And systems working exactly as designed can produce harm in aggregate — to the workforce, the market, the franchise. Three failure types, three sets of controls, usually three different owners. A management report that blends them has not been thought through, and the board should say so.

## 3. What have we decided our AI will not do?

This is the appetite question, and it belongs to the board, not the CIO. Which decisions may be automated, and which require a human accountable by name. Which uses the company will not pursue at any margin. What error rate is tolerable where.

Singapore's [Model AI Governance Framework for Agentic AI](https://www.imda.gov.sg/resources/press-releases-factsheets-and-speeches/press-releases/2026/new-model-ai-governance-framework-for-agentic-ai) applies the familiar principle to agents: humans remain accountable, and meaningful human control and oversight belong in the lifecycle. The board's contribution is deciding which humans, for what, in advance. An appetite statement written after the incident is a press release.

The economist's version of the same question: automation is a trade, not a gift. Every decision handed to a system saves cost and transfers a risk the company used to hold in a person's judgment. Price both sides before agreeing to the trade.

## 4. How would we know if it went wrong?

For material systems, management's assertions deserve the treatment financial assertions get: defined testing before deployment, monitoring in operation, incident thresholds with reporting clocks, periodic independent review. The [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework) and [ISO/IEC 42001](https://www.iso.org/standard/81230.html) are useful organizing references; neither certifies that a particular system is safe.

Two facts from the technical side belong in every director's head, because they change what assurance can honestly say.

First, testing an AI system establishes what it *can* do — never what it *cannot*. There is no test that proves absence of a behavior. When management says "the system cannot X," the accurate translation is "our testing did not surface X," and the board should hear it that way.

Second, some of these decisions do not reverse. A model released openly cannot be recalled. An agent's actions in the world cannot always be rolled back. Ordinary technology risk assumes a patch; parts of this one do not. Anything irreversible warrants board visibility before the fact, not a narrative after it.

Then the operational half: what incidents occurred last year, how were they detected, and who decided whether to report them externally? Reporting clocks differ by jurisdiction. For example, California's [SB 53](https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202520260SB53) and New York's [RAISE Act](https://www.nysenate.gov/legislation/bills/2025/S6953/amendment/B) include incident-reporting requirements for covered frontier developers. A statutory clock is an engineering requirement wearing legal clothing: detection and escalation must run faster than the deadline, and the board should ask whether they do.

## 5. What could we prove?

The closing question, and the one that compresses the other four. If a regulator, a plaintiff, or a major customer asked this company to evidence its AI governance tomorrow — the inventory, the ownership, the appetite statement, the test results, the incident record — what would we hand over, and how long would it take?

If the answer is "a well-organized file, within days," the board's task is maintenance. Anything else, and the gaps name themselves. This question needs no technical literacy at all, which is why it is the one every director can press to the end.

---

The temptation is to file AI governance under compliance and paper it, or under technology and delegate it. It is neither. It is the oldest discipline the board has — informed oversight of a material risk — applied to a technology that documents neglect faster than any before it.

The companies that come through the next few years well will not be the ones with the best models. They will be the ones whose boards can prove what they claimed.

---

## Sources and verification

Regulatory and source references were checked on 28 July 2026. This is a practical board guide, not legal advice; map obligations to the company’s jurisdictions, role, model, and use cases.

- **[EU AI Act, Regulation (EU) 2024/1689](https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng)** — primary law, in force. Supports the discussion of staged EU obligations, documentation, and duties for providers and deployers.
- **[Digital Omnibus on AI, Regulation (EU) 2026/1744](https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng)** — primary amending law. Check it with the consolidated AI Act text before relying on any implementation date.
- **[California SB 53, Transparency in Frontier Artificial Intelligence Act](https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202520260SB53)** — primary state-law text. Supports the framework, transparency, governance, and incident-reporting examples; scope is limited by the Act’s definitions.
- **[New York RAISE Act, S6953B/A6453B](https://www.nysenate.gov/legislation/bills/2025/S6953/amendment/B)** — signed state-law text. Supports the scope, safety-protocol, and incident-reporting examples; check the text and implementing materials for operational advice.
- **[*Marchand v. Barnhill*](https://law.justia.com/cases/delaware/supreme-court/2019/533-2018.html)** — Delaware Supreme Court opinion, hosted by a legal publisher. Illustrates the mission-critical-risk reporting and monitoring question in Caremark oversight litigation; it is not an AI-specific ruling.
- **[NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)** and **[ISO/IEC 42001](https://www.iso.org/standard/81230.html)** — voluntary framework and management-system standard. Useful organizing references, not proof that an individual model or deployment is safe.
- **[Singapore Model AI Governance Framework for Agentic AI](https://www.imda.gov.sg/resources/press-releases-factsheets-and-speeches/press-releases/2026/new-model-ai-governance-framework-for-agentic-ai)** — official guidance. Supports the accountability and meaningful-human-control discussion for agentic systems; it is guidance, not generally binding law.

## Change history

- **2026-07-28 — v1.1:** Rechecked regulatory and framework sources; added direct claim-adjacent citations, a formal source record, and clarified the legal limits of the guide.
- **2026-07-28 — v1.0:** Initial reviewed version.
