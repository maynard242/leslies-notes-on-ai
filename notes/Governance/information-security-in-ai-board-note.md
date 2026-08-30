---
title: "Sharing, Convenience, and Safety in the Age of AI"
description: "A board framework for sharing information quickly while controlling data, systems, and AI agents that act on the organization’s behalf."
kind: "guide"
section: "Governance"
published: "2026-08-29"
updated: "2026-08-30"
version: "2.1"
status: "Reviewed"
topics:
  - information security
  - boards
  - oversight
  - risk management
  - AI agents
order: 3
---

# Sharing, Convenience, and Safety in the Age of AI

**A board and senior-management guide, August 2026**

> **Companion note:** [AI Governance: Five Questions for the Board](/notes/ai-governance-board-note) covers oversight of AI systems themselves. This note covers the information, identities, systems, and actions those systems can touch.

**Thesis:** Security should enable safe speed, not maximum restriction. Trust people to work and report mistakes early. Verify the systems, data flows, identities, and consequential actions around them. Friction should rise with the sensitivity of the information and the consequence of the action, not for every document, email, call, or AI query.

AI does not replace the foundations of information security. It makes familiar failures faster, cheaper, and easier to scale. It improves reconnaissance, impersonation, phishing, vulnerability discovery, and basic malware generation. It also gives ordinary software a new ability to read, decide, and act across systems. The control problem is therefore larger than model quality. It is about the authority that surrounds the model.[13]

## 1. What the board must decide

Management runs the security program. The board should make five decisions that management cannot settle alone.

1. **Risk appetite.** Approve what the organization accepts and what it refuses. It may accept broad AI-assisted drafting on internal routine material. It should not accept unreviewed external sending by agents, unencrypted crown-jewel data, or one person controlling a material payment.
2. **Crown jewels.** Approve the short list of data, services, and business processes whose loss, alteration, or unavailability would cause serious harm. Name an executive owner for each.
3. **Authority boundaries.** Decide which actions are never autonomous and which require a specific human approval: external sending, publication, payments, deletion, permission changes, bulk export, commitments to customers or partners, and decisions affecting people. For a material action, approval must bind one identified principal, payload, destination, value, and expiry. It cannot be reused for a different action.
4. **Escalation and investment.** Set the events that reach the board and how quickly: a material breach, ransomware, regulator contact, a material AI-system failure, or an agent acting outside its approved scope. Fund the controls needed to stay within the appetite, with clear trade-offs rather than an inherited line item.
5. **Accountability.** Confirm one executive accountable for information security, the board committee responsible for oversight, and a reporting cadence. Anchor the program in established frameworks, including NIST Cybersecurity Framework 2.0, NIST AI Risk Management Framework, and ISO/IEC 42001, so assurance can be tested rather than asserted.[2][3][15]

A board need not design the controls. It must be able to ask whether they work, whether the safe route is usable, and whether management can stop and explain a consequential action.

## 2. Build a culture that reports early

A security program fails when people hide small mistakes until they become large ones. Staff should be able to report a mistaken recipient, suspicious request, lost device, misdirected file, or unsafe AI output without automatic blame. Early reporting contains harm and produces useful lessons.[1]

Culture does not replace controls. People are busy and attackers are persistent. Training, clear reporting, and prompt feedback must sit beside secure defaults, access limits, and monitoring. The test is simple: can people do ordinary work quickly through an approved path, and can they ask for help before a small error becomes an incident?

Treat security as a service to the organization. If the approved way to share, search, or draft is unusable, staff will find another way. Workarounds are not merely a disciplinary problem. They are evidence that the control has missed the job it was meant to support.

## 3. Make safe sharing the normal route

An AI inventory begins with a data inventory. Before connecting an AI tool to documents, email, source code, finance workflows, or customer systems, management must know where sensitive information lives and who owns it. An AI connector amplifies whatever access mess already exists.

Use four simple defaults:

- **Public or release-approved material** is genuinely open.
- **Routine internal material** is broadly findable and shareable in approved tools.
- **Restricted or sensitive material** needs a clear purpose, named recipient, and approved channel.
- **Crown-jewel or regulated material** needs a named owner, phishing-resistant authentication, time-limited access, and dual control for consequential external, bulk, or agent actions.[6]

For every material AI tool or connector, management should answer five questions: What information can it see? Where can that information go? Who owns the decision to use it? Who can change its permissions? How long are its inputs, outputs, and logs kept?

The same questions apply to everyday channels. Email, messaging, meetings, files, APIs, and AI tools all move information. For ordinary work, keep the approved route fast. For sensitive material, use managed workspaces or named-recipient links rather than attachments or anonymous public links. Confirm unusual requests for money, access, sensitive data, or changed bank accounts through a known second channel. A convincing voice or message is not proof of identity.

The board should also expect management to monitor the routes data actually takes. Common failures include a wrong or personal address, personal storage, unmanaged messaging, misconfigured shares, compromised accounts using legitimate channels, connectors with excessive access, and sensitive material pasted into public AI tools. The answer is not to block every route. It is to provide an approved route for each real task, then notice when ordinary channels begin behaving unusually.[7]

## 4. Secure AI by design, not by warning label

A prompt can guide a model. It cannot enforce authorization. An enterprise AI label does not prove that retention, training use, isolation, access, or incident terms are appropriate. The control must sit in the surrounding system: the identity, the data policy, the API, the destination, and the approval point.[4][10]

Require secure defaults before a material AI system is deployed. Use approved data sources, narrow connectors, least-privilege access, clear retention rules, and protected logs. Build in a way to remove access or switch the system off. Test after a material change to the model, prompt, retrieval source, connector, tool, or deployment path.[14]

For a material new AI system, threat-model the actual data flow and action flow. Ask what an attacker could impersonate, alter, disclose, disrupt, or use to gain greater privilege. This is not a board exercise in technical vocabulary. It is how management checks that a useful system has not become an uncontrolled route to information or authority.

## 5. Make zero trust the default

Zero trust is not distrust of employees. It is the discipline that network location, seniority, and account ownership do not by themselves justify access. Grant only the access needed for a defined task, for a defined time, and remove it promptly when the task ends.[5]

This is more important when AI is involved. A model can combine permissions that were granted separately to read a document store, search a repository, create a ticket, and send a message. The question is not whether the system sounds capable. It is what it can read, change, send, publish, delete, or pay for without another decision point.

The useful design is staged autonomy. Start with read-only retrieval and drafting. Move to bounded internal actions after testing. Treat external or irreversible actions as a separate class. A higher-risk system needs more than a stronger instruction. It needs narrower permissions, stronger authentication, confirmed destinations, rate and value limits, and human authority at the point of action.

## 6. Control AI agents at the point of action

An AI agent is not just a model that writes text. It is a model connected to information, tools, credentials, and sometimes other agents. Its risk comes from the combination. The important question is not whether the model can be told to behave well. It is what the surrounding system will allow it to do when it is wrong, manipulated, or faced with hostile content.

**Treat untrusted content as data, not instructions.** An agent can read instructions hidden in an email, web page, document, support ticket, tool response, or retrieved file. Those instructions may try to redirect the agent, expose data, or trigger a tool. This is direct or indirect prompt injection. It cannot be solved by a stronger system prompt alone. Every consequential tool call should be checked against the approved task, the requesting identity, the data involved, and the destination.[9][10][11]

**Give the agent a bounded identity.** Default to read-only access. Give each agent or agent function its own credentials, with only the tools and data needed for one defined task. Do not give a drafting agent the authority of a finance approver, administrator, or data-export service. An agent should not inherit a person's broad account permissions merely because it acts for that person.[8]

**Control tools, connectors, and delegation.** Before an agent can search a file store, send an email, create a ticket, call an external service, change a record, execute code, or invoke another agent, management should be able to name the owner, permitted purpose, data scope, and removal path. External tools, retrieval sources, and connectors are routes through which instructions, data, and authority travel. If one agent asks another to act, the second must receive a bounded task and must not gain broader permissions through the handoff. Preserve the initiating human principal and authenticated delegation chain. The organization should be able to reconstruct who requested the action, who took it, what information was passed, and which control allowed it.[8][9][11]

**Bound execution.** Limit where an agent can send information, which systems it can reach, how much it can export, how long it can run, and how much it can spend or change. Enforce material external egress through deterministic, fail-closed policy controls, not a model instruction. Use approved destinations for material data. Require specific, informed, recorded human approval for external sending, publication, payments, deletion, permission changes, bulk export, commitments, and decisions affecting people. Bind that approval to the exact transaction and reject replay. A vague warning and a reflexive click are not meaningful oversight.

**Protect working context and memory.** Retrieved documents, long-term memory, prompts, tool descriptions, and logs can be altered or polluted. Do not assume that information already inside an agent's context is trustworthy. Keep sensitive information out of shared memory where possible; separate memory by task and user; control who can write to it; and review unexpected changes to prompts, tool definitions, and agent instructions. Record provenance for persistent memory, and promote material entries only through defined validation and ownership gates. Persistent context needs the same ownership and access discipline as any other information store.[4][9][11]

**Keep evidence and rehearse the stop path.** Logs should show what the agent read, which tool it called, what it attempted to send or change, which identity and permission it used, what control allowed or blocked it, and the exact approval used. Protect those logs because they may contain sensitive information. Management must be able to disable the agent, revoke its credentials, disconnect its tools, quarantine questionable memory, preserve evidence, and notify affected system owners without waiting for a vendor or engineering team to improvise. Stopping an agent does not undo completed external effects. The recovery plan must include compensation: reversing a change where possible, correcting recipients, containing data, and notifying affected owners. Test both the stop and compensation paths after material changes and in an agent-specific incident exercise.[4][8]

## 7. Detect changing risk and learn from it

Fixed policies are necessary but not sufficient. Risk changes with the data, destination, device, identity, recent behavior, and time. A routine file sent from a managed device to an established colleague may need little friction. The same file sent to an unfamiliar address after an unusual sign-in may need a pause.

Use monitoring to bring together signals from identity, endpoints, email, file sharing, APIs, and agent activity. It can identify suspicious combinations and help humans prioritize investigation. As risk rises, the response should be proportionate: a warning, confirmation, temporary hold, human review, revocation, or containment. AI may help triage and explain. It should not independently decide staff discipline, material access changes, payments, or other high-consequence outcomes.

Monitor workarounds as seriously as alerts. Measure traffic to consumer AI tools, personal email, and unsanctioned storage; stale access; exception turnaround; false positives; and time from anomaly to human decision. Those measures show whether the secure route is working in real life.

## 8. Treat third parties as part of the system

Much of the risk arrives through vendors, model providers, tool servers, retrieval sources, and identity services. Before a material third party connects to company data or authority, assess its security and the contract terms for retention, training use, onward sharing, breach notification, audit, and exit.

For agents, extend this review to every external component: model, tool, connector, memory store, prompt or skill package, and downstream agent. Keep an inventory and owner. Apply secure-development and supply-chain discipline to AI artifacts as well as conventional code: establish provenance, review material updates, manage vulnerabilities, and prove that access can be revoked.[4][8][16] The May 2026 Five Eyes guidance takes a deliberately conservative position on agentic services. A risk-tiered approach is defensible only where management can show that the control boundary, evidence, and recovery path match the authority granted. Concentration in a cloud provider, model provider, identity service, or agent platform is a resilience decision, not a procurement detail.

## 9. Prepare for the bad day

Detection without recovery is half a program. The board should confirm that four capabilities exist and are exercised.

**Incident response.** Maintain named roles, including legal counsel, communications, security, and business owners, with authority to disconnect systems and revoke access. Run a tabletop exercise at least annually. Include executives and the board in one scenario. Add an AI-agent scenario that tests prompt injection, inappropriate tool use, evidence preservation, containment, and recovery.

**Disclosure readiness.** Under Singapore's Personal Data Protection Act, an organization must assess a suspected breach within 30 calendar days. A breach is notifiable where it is likely to result in significant harm to affected individuals or is of significant scale. A notifiable breach must be reported to the Personal Data Protection Commission as soon as practicable and no later than three calendar days, with affected individuals notified where required. Sector regulators can impose shorter clocks.[12] Know in advance who decides, on what evidence, and with which counsel.

**Recovery.** Maintain offline or immutable backups of crown-jewel data. Test restoration and set recovery-time objectives for systems the business cannot operate without. For agents, include rollback or replacement of compromised prompts, tool definitions, memory, configuration, and credentials.

**Foundations.** Patch systems, use phishing-resistant authentication, protect secrets, and remove access promptly when people or agents no longer need it. AI may change the speed of attacks. It does not make these controls optional.[6][13]

## Questions the board should ask management

Each answer should include a target range and trend, not a snapshot. A metric without a threshold is an anecdote.

1. Can staff share routine internal information quickly in approved tools, while protections rise clearly for sensitive data and high-consequence actions?
2. Can management show the current inventory of AI tools, agents, connectors, and material third-party components, with named owners, data scope, authority, retention, and tested revocation?
3. Which actions remain human decisions? For each, is approval specific, informed, recorded, and enforced at the point of action?
4. Can management demonstrate that every agent has a separate bounded identity, preserved initiating principal, least-privilege tools, fail-closed egress, transaction-bound approvals, execution limits, and logs sufficient to reconstruct a material action?
5. Has management tested direct and indirect prompt injection, poisoned context or memory, tool misuse, and unauthorized delegation before an agent moves into a higher-autonomy role?
6. Can management detect changing risk across channels, get a human to a high-risk case quickly, contain it, learn, and update the control?
7. Are safe paths sufficiently fast that staff do not resort to consumer AI, personal email, unsanctioned storage, or informal workarounds?
8. When did management last restore crown-jewel data, rehearse an incident with executives, and run an agent-specific stop, revoke, and recovery exercise?

The board's job is not to choose between security and speed. It is to insist that the organization earns both.

## Sources

1. [NCSC cyber security culture principles, principle 1](https://www.ncsc.gov.uk/collection/cyber-security-culture-principles/principle-1) and [principle 2](https://www.ncsc.gov.uk/collection/cyber-security-culture-principles/principle-2) - UK government guidance; supports a reporting culture alongside technical controls.
2. [NIST Cybersecurity Framework 2.0](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf) - US framework; supports risk-based governance and cybersecurity outcomes.
3. [NIST AI Risk Management Framework 1.0](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-ai-rmf-10) - US framework; supports AI risk governance across the lifecycle.
4. [NIST AI 600-1, Generative AI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf) - NIST profile for managing risks unique to or exacerbated by generative AI.
5. [NIST SP 800-207, Zero Trust Architecture](https://csrc.nist.gov/pubs/sp/800/207/final) - US standard; supports least privilege and contextual access.
6. [CISA fact sheet: implementing phishing-resistant MFA](https://www.cisa.gov/sites/default/files/publications/fact-sheet-implementing-phishing-resistant-mfa-508c.pdf) - US government guidance; supports phishing-resistant authentication.
7. [NCSC guidance on reducing data exfiltration by malicious insiders](https://www.ncsc.gov.uk/guidance/reducing-data-exfiltration-by-malicious-insiders) - UK government guidance; supports usable controls, monitoring, and data-exfiltration risks.
8. [CISA, Careful Adoption of Agentic AI Services](https://www.cisa.gov/resources-tools/resources/careful-adoption-agentic-ai-services) (May 2026) - joint guidance for secure design, deployment, operation, and governance of agentic AI.
9. [MITRE ATLAS v2026.07](https://atlas.mitre.org/) - adversarial tactics and techniques against AI-enabled systems, including agents, prompt injection, tools, and context.
10. [OWASP GenAI LLM Top 10 2026](https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/) - current community security guide for LLM applications.
11. [OWASP Top 10 for Agentic Applications for 2026](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/) - community guide for agent goal hijack, tool misuse, memory and context poisoning, supply chain, inter-agent communication, cascading failures, and human-agent trust.
12. [PDPC guide on managing and notifying data breaches under the PDPA](https://www.pdpc.gov.sg/-/media/Files/PDPC/PDF-Files/Other-Guides/Guide-on-Managing-and-Notifying-Data-Breaches-under-the-PDPA-15-Mar-2021.pdf) - Singapore regulator guide; supports the 30-day assessment and three-calendar-day notification timelines.
13. [NCSC assessment: the impact of AI on the cyber threat to 2027](https://www.ncsc.gov.uk/report/impact-ai-cyber-threat-now-2027) - UK government threat assessment; supports the threat framing.
14. [NCSC guidelines for secure AI system development: secure design](https://www.ncsc.gov.uk/collection/guidelines-secure-ai-system-development/guidelines/secure-design) - joint government guidance; supports secure AI design and lifecycle controls.
15. [ISO/IEC 42001:2023, AI management systems](https://www.iso.org/standard/81230.html) - international standard; supports AI-management-system governance and accountability.
16. [NIST SP 800-218A, Secure Software Development Practices for Generative AI and Dual-Use Foundation Models](https://csrc.nist.gov/pubs/sp/800/218/a/ipd) - NIST guidance extending the Secure Software Development Framework to generative-AI artifacts and their supply chains.

## Change history

- **2026-08-30 - v2.1:** Retitled to "Sharing, Convenience, and Safety in the Age of AI." Added transaction-bound approvals, authenticated delegation chains, fail-closed egress, memory provenance and promotion gates, AI supply-chain discipline, and recovery that compensates for completed external effects. Clarified the conservative Five Eyes position, breach triggers, and source versioning.
- **2026-08-30 - v2.0:** Rebuilt as a shorter board framework around safe sharing, secure design, zero trust, and verification. Added agent-specific controls for untrusted context, delegated authority, bounded tool use, memory, evidence, and recovery. Updated the AI-security source base with 2026 CISA, MITRE ATLAS, and OWASP guidance.
- **2026-08-30 - v1.1:** Retitled to "Balancing Knowledge Sharing, Convenience, and Security" and reframed trust and verification across people, systems, data flows, and consequential actions.
- **2026-08-29 - v1.0:** Initial reviewed version.
