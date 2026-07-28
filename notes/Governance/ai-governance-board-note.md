---
title: "AI Governance: Five Questions for the Board"
description: "A practical board guide to oversight of material AI risk: inventory, ownership, appetite, monitoring, and proof."
kind: "guide"
section: "Governance"
published: "2026-07-28"
updated: "2026-07-28"
checked: "2026-07-28"
version: "2.4"
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

The law came first. The [EU AI Act](https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng), as amended by the [Digital Omnibus on AI](https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng), has staged obligations for providers and deployers. California's [SB 53](https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202520260SB53) requires covered frontier developers to publish and maintain a frontier AI framework; New York's [RAISE Act](https://www.nysenate.gov/legislation/bills/2025/S8828) — repealed and replaced by a chapter amendment signed March 2026 — requires covered frontier developers to publish safety protocols and report a critical safety incident within 72 hours of determination. The precise reach depends on definitions, amendments, and effective dates. The common board question is simpler: can the company show the framework it adopted, the evidence behind it, and what happened when the evidence changed?

Fiduciary doctrine came second. The Caremark line of Delaware cases is fact-specific, but it puts a premium on a board-level information and reporting system for mission-critical risk. In [*Marchand v. Barnhill*](https://law.justia.com/cases/delaware/supreme-court/2019/533-2018.html), the Delaware Supreme Court allowed a claim to proceed where the complaint supported an inference that no board-level monitoring or reporting system existed for the company's central food-safety risk. That does not mean every AI incident creates director liability. It does mean that where AI is material to operations, compliance, or safety, the board should be able to identify its oversight structure rather than rely on informal management reporting.

The technology came third, and it changed character. Earlier enterprise software largely executed decisions people had made. Current systems can shape decisions about customers, credit, hiring, and content—and, through autonomous agents, increasingly act in a company's name. The gap between what is deployed and what is overseen is the risk.

One frame organizes everything that follows. An organization using AI must be able to do three things: **make** claims about what its systems will and will not do, **keep** those claims in operation, and **prove** them to someone with no reason to take its word — a regulator, a counterparty, a court. Management owns the first two. The board's job is to confirm all three exist and connect. Most organizations make claims fluently, keep them unevenly, and cannot prove them at all. The law is aimed at the third.

Five questions test the three verbs. Asking them, understanding the answers, and recording the exchange creates a practical oversight record; it does not by itself establish satisfaction of any fiduciary, statutory, or regulatory duty. A board that cannot get crisp answers has found its work plan.

![Board AI governance framework: management makes and keeps claims; the board asks whether the organization can evidence them, with separate reporting for malfunction, misuse, and aggregate harm.](/illustrations/board-ai-governance-framework.webp)

*Figure — A practical reader aid. The five detailed questions below, their scope, and this note’s legal caveats control; the graphic is not a statement of generally applicable legal or fiduciary duties.*

---

## 1. Where is AI in use, and which uses matter?

The board cannot oversee what management has not mapped. The first artifact to request is an inventory: every AI system in use across the enterprise, including AI embedded in vendor products and the unofficial tools staff adopted without asking. Then a materiality cut — which uses touch customers, regulated decisions, safety, or public commitments.

Every serious framework in the world starts here, and for the same reason financial control starts with a ledger. Expect the register to be longer than anyone predicted; that discovery is the point. Expect the vendor column to be the least complete; that gap is where third-party risk lives.

Understand what the answer tells you. A management team that produces the inventory in a week has been governing. A team that needs a quarter has been deploying.

**Ask specifically:**

1. Does the inventory include AI embedded in vendor and SaaS products, not just systems built in-house?
2. Does it include the tools staff adopted without asking — the shadow AI no procurement process ever saw?
3. What independent source, business-unit attestation, or technical evidence was used to test the inventory's completeness?
4. Is there a gate that adds a new use to the inventory before launch, or only after someone asks?
5. Which uses touch hiring, credit, insurance, or other protected decisions?
6. Which uses face the customer or the public with no human in the loop?
7. Which uses sit inside safety-critical or regulated operations?
8. Which agents can commit the company — spend money, sign, communicate externally — without a person approving each action?
9. Who owns keeping the inventory current, and on what cycle?
10. What did management choose to leave off, and why?

## 2. Who answers for it — to management, and to us?

Somebody in management must own AI risk end to end, with a name, a mandate, and a reporting line this board can see. And somebody on this board must own the topic. Practice varies defensibly — full board for strategy, risk or audit committee for controls, a technology committee where AI is the business. What is not defensible is ambiguity.

Write the allocation into committee charters. Put AI on the agenda at a stated cadence. This is not ceremony. In litigation and regulatory review, the record of what the board asked, and when, is the evidence that oversight occurred. Minutes are the board's proof layer.

One demand belongs in the reporting structure from the start: AI risk is not one thing. Systems malfunction — bias, fabrication, quiet degradation. People misuse them — deliberately, adaptively. And systems working exactly as designed can produce harm in aggregate — to the workforce, the market, the franchise. Three failure types, three sets of controls, usually three different owners. A management report that blends them has not been thought through, and the board should say so.

**Ask specifically:**

1. Name the executive who owns AI risk end to end. Can they say no to a deployment, or only advise?
2. Which board committee owns this — is it in the charter, or assumed?
3. What is the standing cadence for AI risk reaching the board?
4. Does the report separate malfunction, misuse, and aggregate harm — or blend all three into one slide?
5. When a system crosses business units, who owns it — or does ownership diffuse at the boundary?
6. Can risk or compliance escalate a concern independent of the team that built or bought the system?
7. Is there an independent, appropriately resourced challenge and assurance function for material AI systems, with authority to challenge deployment?
8. When the builder and the risk owner disagree, who has the final call?
9. Has AI actually been on the agenda, or only mentioned in passing?
10. Do the minutes show what was asked and answered — or only that AI came up?

## 3. What have we decided our AI will not do?

This is the appetite question, and it belongs to the board, not the CIO. Which decisions may be automated, and which require a human accountable by name. Which uses the company will not pursue at any margin. What error rate is tolerable where.

Singapore's [Model AI Governance Framework for Agentic AI](https://www.imda.gov.sg/resources/press-releases-factsheets-and-speeches/press-releases/2026/new-model-ai-governance-framework-for-agentic-ai) applies the familiar principle to agents: humans remain accountable, and meaningful human control and oversight belong in the lifecycle. The board's contribution is deciding which humans, for what, in advance. An appetite statement written after the incident is a press release.

The economist's version of the same question: automation is a trade, not a gift. Every decision handed to a system saves cost and transfers a risk the company used to hold in a person's judgment. Price both sides before agreeing to the trade.

**Ask specifically:**

1. Which decisions may never be fully automated here, regardless of how well the model performs?
2. For material or consequential automated decisions, are accountable executive ownership and escalation authority documented?
3. What failure rate triggers suspension, and who has the authority to pull the switch?
4. Has the board approved an appetite statement, or has appetite simply become whatever management already built?
5. Does the statement distinguish AI that assists a decision from AI that replaces one?
6. What has the company turned down, and is that decision written anywhere?
7. What is the ceiling on what an agent can do unsupervised — spend, contract, speak for the company?
8. Can a customer or employee actually challenge an automated decision, and do they know how?
9. Has management identified material jurisdictional constraints that require changes to the board-approved appetite or controls, and how are those changes escalated to the board?
10. When did the board last revisit the statement, and what changed?

## 4. How would we know if it went wrong?

For material systems, management's assertions deserve the treatment financial assertions get: defined testing before deployment, monitoring in operation, incident thresholds with reporting clocks, periodic independent review. The [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework) and [ISO/IEC 42001](https://www.iso.org/standard/81230.html) are useful organizing references; neither certifies that a particular system is safe.

Two facts from the technical side belong in every director's head, because they change what assurance can honestly say.

First, testing an AI system establishes what it *can* do — never what it *cannot*. There is no test that proves absence of a behavior. When management says "the system cannot X," the accurate translation is "our testing did not surface X," and the board should hear it that way.

Second, some of these decisions do not reverse. A model released openly cannot be recalled. An agent's actions in the world cannot always be rolled back. Ordinary technology risk assumes a patch; parts of this one do not. Anything irreversible warrants board visibility before the fact, not a narrative after it.

Then the operational half: what incidents occurred last year, how were they detected, and who decided whether to report them externally? Reporting clocks differ by jurisdiction. For example, California's [SB 53](https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202520260SB53) requires reporting within 15 days of discovery (24 hours for imminent risk), while New York's amended [RAISE Act](https://www.nysenate.gov/legislation/bills/2025/S8828) requires reporting within 72 hours of determination — both apply to covered frontier developers. A statutory clock is an engineering requirement wearing legal clothing: detection and escalation must run faster than the deadline, and the board should ask whether they do.

**Ask specifically:**

1. What did pre-deployment testing check, against what pass criteria?
2. What runs in production monitoring, and how often — real time, daily, monthly sample?
3. What exactly counts as an incident that must be escalated?
4. Does the escalation clock beat the shortest applicable legal, regulatory, and contractual reporting deadline, as confirmed by counsel?
5. Who reviews the system independently — not the team that built it?
6. What was the last incident, and did the company catch it or did someone else?
7. For anything irreversible, does the board see it before deployment, or only after?
8. When management says the system "cannot" do something, is that a design guarantee or an absence of observed failures?
9. Is drift over time monitored, or only accuracy at launch?
10. Who can shut the system down immediately, and has that authority ever actually been tested?

## 5. What could we prove?

The closing question, and the one that compresses the other four. If a regulator, a plaintiff, or a major customer asked this company to evidence its AI governance tomorrow — the inventory, the ownership, the appetite statement, the test results, the incident record — what would we hand over, and how long would it take?

If the answer is "a well-organized file, within days," the board's task is maintenance. Anything else, and the gaps name themselves. This question needs no technical literacy at all, which is why it is the one every director can press to the end.

**Ask specifically:**

1. If a regulator asked for the inventory tomorrow, how long to produce it, and would it be complete?
2. Can the company produce the appetite statement and show the board approved it?
3. Can it produce actual test and monitoring results — not an assurance that testing happened?
4. Can it produce the incident log, including incidents assessed and not reported?
5. Can it trace who approved a given deployment, and when?
6. Does the evidence live in one place, or would someone have to reconstruct it from email and Slack?
7. Would the answer differ for a system built in-house versus one bought from a vendor?
8. Has anyone actually run the drill — assembled the file as if asked — or is this theory?
9. Who owns the file day to day: is it maintained, or built only under threat?
10. If it were handed over, would the gaps be visible before anyone had to explain them?

---

The temptation is to file AI governance under compliance and paper it, or under technology and delegate it. It is neither. It is the oldest discipline the board has — informed oversight of a material risk — applied to a technology that documents neglect faster than any before it.

The companies that come through the next few years well will not be the ones with the best models. They will be the ones whose boards can prove what they claimed.

---

## Sources and verification

Regulatory and source references were checked on 28 July 2026. This is a practical board guide, not legal advice; map obligations to the company’s jurisdictions, role, model, and use cases.

- **[EU AI Act, Regulation (EU) 2024/1689](https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng)** — primary law, in force. Supports the discussion of staged EU obligations, documentation, and duties for providers and deployers.
- **[Digital Omnibus on AI, Regulation (EU) 2026/1744](https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng)** — primary amending law. Check it with the consolidated AI Act text before relying on any implementation date.
- **[California SB 53, Transparency in Frontier Artificial Intelligence Act](https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202520260SB53)** — primary state-law text. Supports the framework, transparency, governance, and incident-reporting examples; scope is limited by the Act’s definitions.
- **[New York RAISE Act chapter amendment, S8828 (Chapter 96 of 2026)](https://www.nysenate.gov/legislation/bills/2025/S8828)** — signed 27 March 2026, effective 1 January 2027; repeals and replaces the original RAISE Act framework. Supports the scope, safety-protocol, and 72-hour incident-reporting examples; check the text and implementing materials for operational advice.
- **[*Marchand v. Barnhill*](https://law.justia.com/cases/delaware/supreme-court/2019/533-2018.html)** — Delaware Supreme Court opinion, hosted by a legal publisher. Illustrates the mission-critical-risk reporting and monitoring question in Caremark oversight litigation; it is not an AI-specific ruling.
- **[NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)** and **[ISO/IEC 42001](https://www.iso.org/standard/81230.html)** — voluntary framework and management-system standard. Useful organizing references, not proof that an individual model or deployment is safe.
- **[Singapore Model AI Governance Framework for Agentic AI](https://www.imda.gov.sg/resources/press-releases-factsheets-and-speeches/press-releases/2026/new-model-ai-governance-framework-for-agentic-ai)** — official guidance. Supports the accountability and meaningful-human-control discussion for agentic systems; it is guidance, not generally binding law.

## Change history

- **2026-07-28 — v2.4:** Replaced the stale New York RAISE Act citation (pre-amendment S6953B/A6453B) with the enacted chapter amendment, S8828 (Chapter 96 of 2026): signed 27 March 2026, effective 1 January 2027, 72-hour critical-incident clock. Confirmed no Delaware court has yet adjudicated an AI-specific Caremark oversight claim; the note's existing hedging on *Marchand* holds.
- **2026-07-28 — v2.3:** Replaced the board-governance overview illustration. The source-check date remains unchanged because this is a presentation change, not a source recheck.
- **2026-07-28 — v2.2:** Added the board-governance illustration. The source-check date remains unchanged because this is a presentation change, not a source recheck.
- **2026-07-28 — v2.1:** Refined board prompts on accountable ownership, jurisdictional constraints, and reporting deadlines after independent governance review.
- **2026-07-28 — v2.0:** Added ten specific questions under each of the five sections, so a director can turn the general question into an actual line of inquiry.
- **2026-07-28 — v1.1:** Rechecked regulatory and framework sources; added direct claim-adjacent citations, a formal source record, and clarified the legal limits of the guide.
- **2026-07-28 — v1.0:** Initial reviewed version.
