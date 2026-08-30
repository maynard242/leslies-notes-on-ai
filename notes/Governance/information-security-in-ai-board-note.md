---
title: "Balancing Knowledge Sharing, Convenience, and Security"
description: "How boards and senior management can balance knowledge sharing, convenience, and security when AI accelerates both work and attack."
kind: "guide"
section: "Governance"
published: "2026-08-29"
updated: "2026-08-30"
version: "1.1"
status: "Reviewed"
topics:
  - information security
  - boards
  - oversight
  - risk management
  - AI agents
order: 3
---

# Balancing Knowledge Sharing, Convenience, and Security

**Some thoughts for board and senior management — August 2026**

> **Companion note:** [AI Governance: Five Questions for the Board](/notes/ai-governance-board-note) covers oversight of AI systems themselves. This note covers the information they touch: how data should move, how it leaks, and what the board must decide.

---

**Thesis:** Security should enable safe speed, not maximum restriction. Build a culture of trust, but verify. Trust the team to work and to report mistakes early. Verification is not a judgment about people, and it is not confined to systems: it applies to the whole setup (identities, systems, data flows, high-consequence human decisions, and AI claims) in proportion to harm. Friction should rise with sensitivity and consequence, not for every document, email, call, or AI query.

Trust and verification are not opposites, and they do not split neatly between people and machines. Culture is how the team works: hire good people, equip them, expect early reporting, and treat mistakes as lessons. Verification is how the organization keeps itself honest, and it covers everything: systems and data flows continuously, and human actions at the points of consequence, such as a payment, a bulk export, or an unusual request. Confirming a changed bank account through a second channel is not distrust of a colleague. It is the discipline that lets trust scale.

AI does not chiefly create a wholly new category of risk. It compresses the cost and time needed to run familiar attack steps at scale: reconnaissance, tailored phishing and impersonation, vulnerability research, basic malware generation, and finding value in stolen data. The UK National Cyber Security Centre (NCSC) assesses that AI will increase the frequency and intensity of cyber threats and spread intrusion capability more widely.[10]

## 1. Decisions reserved for the board

Most of this note is management's work. Five decisions are not.

1. **Risk appetite.** Approve a short statement of what the organization accepts and refuses. For example: we accept the residual risk of fast internal sharing and broad AI-assisted drafting; we do not accept unreviewed external sending by AI agents, unencrypted crown-jewel data, or single-person control over payments. Without an approved appetite, management calibrates friction alone and the board learns its own tolerance only after an incident.

2. **Crown jewels.** Approve the short list of data and systems whose loss would cause severe harm, and the named executive owner of each.

3. **Escalation thresholds.** Decide in advance which events reach the board and how fast: confirmed breach of regulated or crown-jewel data, ransomware, regulator contact, or an AI agent acting materially outside its scope.

4. **Investment.** Approve the security budget as an explicit trade-off (see section 10), not a line item that survives by inertia.

5. **Accountability.** Confirm a single accountable executive for information security, the board committee that owns oversight, and a reporting cadence (quarterly reporting, with immediate escalation per the thresholds above). Confirm that at least one director can interrogate management's answers, or commission the education to make it so. Anchor the program in recognized frameworks, such as the US National Institute of Standards and Technology's Cybersecurity Framework (NIST CSF 2.0), the NIST AI risk profile, and ISO/IEC 42001 (the international standard for AI management systems), so assurance can be benchmarked rather than asserted.[5][6][13]

## 2. Build a trusting and learning culture

A board should expect staff to see security as part of good work, not as an obstacle placed in their way. The practical test is whether someone can report a mistaken recipient, suspicious prompt, lost device, or misdirected file early, without fear of automatic blame. Early reporting contains harm and creates useful lessons.[1][2]

That does not mean culture can replace technical controls. People are busy, attackers are persistent, and ordinary work contains errors. Training, trusted reporting, and prompt feedback should sit beside secure defaults, access limits, and monitoring. The aim is a workforce that can move quickly, learn from what goes wrong, and ask for help before a small error becomes an incident.

## 3. Make it easy to share information safely

The secure route must also be the usable route. For every material AI tool, management should be able to answer five plain questions: What information can it see? Where can that information go? Who owns the decision to use it? Who can change its permissions? How long are its inputs, outputs, and logs kept?

In practice, this means keeping an inventory, naming an owner, limiting access, setting retention, and being able to switch the tool off or remove its access. Prompts and system instructions can guide a model, but they are not an access-control boundary. Secure defaults, clear labels, narrow AI connectors, and confirmation at consequential boundaries should be built into the workflow.[3][7]

One prerequisite is easy to skip. An AI inventory presumes a data inventory: the organization must know where its sensitive data lives before connecting tools that can read it. AI connectors amplify whatever access mess already exists. If the data estate is not mapped, map it first.

Use four simple defaults. Public or release-approved material is genuinely open. Internal routine material is broadly findable and shareable in approved tools. Restricted or sensitive material needs a clear purpose, named recipient, and approved secure channel. Crown-jewel or regulated material needs a named executive owner, phishing-resistant authentication (passkeys or hardware security keys, not codes sent by text, which AI-assisted phishing defeats), just-in-time access, and dual control for consequential external, bulk, or agent actions.[14]

## 4. Five common channels

Information does not move only through email. The board should require practical rules for the five channels staff and systems use every day; simple best practices for each follow.[9]

1. **Email.** Keep ordinary low-risk external mail fast. Flag unfamiliar external recipients. Ask the sender to check the attachment and send only what the recipient needs. Block automatic external forwarding by default. For sensitive material, use a secure link or managed workspace rather than an attachment that cannot be withdrawn.[8]

2. **Messaging, meetings, and phone.** Chat attachments, screen sharing, meeting recordings, and spoken instructions are all forms of sharing. Use approved channels when the discussion or record matters to the business. For an unusual request involving money, access, sensitive data, or a changed bank account, confirm through a known second channel. A convincing voice or message is not proof of identity.

3. **Files and collaboration workspaces.** Let staff find and share routine internal information in approved workspaces. For sensitive material, use named-recipient links or managed partner workspaces, with an owner and an expiry date. Do not rely on anonymous public links. Sharing must be easier through the approved workspace than by downloading a file and sending it elsewhere.

4. **APIs and software connectors.** A connection from one application to another (an application programming interface, or API) is also external sharing, even when no employee presses Send. Use approved integrations, narrow permissions, and read-only access by default. Know what the other service retains, whether it can pass information on, and how to revoke its access quickly. Give every material connector an owner.

5. **AI tools and agents.** Public AI tools should receive public information only. Enterprise tools are not automatically safe: confirm their retention, training, isolation, access, and incident terms. An agent may read or draft within a defined scope. External sending, publication, payments, deletion, permission changes, and bulk export need explicit human authority at the point of action.[9]

These rules are not a reason to stop sharing. They are a way to give people a safe route for each common task. NCSC guidance on data exfiltration similarly emphasizes balancing business delivery with prevention, monitoring, and audit.[9]

## 5. How information actually leaves

The channels above describe how work should flow. The board should also see the routes by which data actually leaves organizations, whether by mistake, by a compromised account, or by intent. This list draws on the MITRE ATT&CK (Adversarial Tactics, Techniques, and Common Knowledge) catalogue and NCSC insider guidance.[9][15]

1. Email to a wrong or personal address, the most common accidental route.
2. Uploads to personal cloud storage or file-transfer sites.
3. Unmanaged messaging apps carrying business attachments.
4. A compromised account exporting data through normal, approved channels.
5. Malware on a compromised device sending data to attacker infrastructure.
6. Misconfigured shares and anyone-with-the-link access left open.
7. Software connectors and APIs that retain data or pass it onward.
8. Sensitive material pasted into public AI tools, or an agent that combines broad read access with the ability to send externally.
9. Removable media, printing, and photographs of screens.
10. Departing or malicious insiders downloading in bulk before exit.

The pattern that matters: most of these are legitimate channels misused, not exotic hacking. Blocking channels outright pushes work underground; the defensible posture is approved routes for each task, plus monitoring that notices when a legitimate channel starts behaving illegitimately. That is the case for the next section.

## 6. Make monitoring dynamic

Fixed policies are necessary, but not sufficient. Risk changes with the data involved, its destination, the device, the identity, recent behavior, and the time of day. A routine file sent from a managed device to an established colleague may need little friction. The same file sent to an unfamiliar address after an unusual sign-in may need a pause.

Use AI defensively to bring together signals from email, identity systems, endpoints, file sharing, APIs, and agent activity. It can identify suspicious combinations and prioritize human investigation. As risk rises, the response should be proportionate: a warning, confirmation, temporary hold, human review, revocation, or containment. AI may help triage and explain. It must not independently decide high-consequence blocks, staff discipline, payments, or major access changes.

Monitoring should also measure the workarounds. Network and device telemetry can show how much traffic flows to consumer AI tools, personal email, and unsanctioned storage. That baseline is the honest indicator of whether the approved paths are usable, and whether they are winning.

Monitoring is not an annual compliance cycle. Test controls, learn from incidents and near misses, and update policies when evidence shows that a route is too weak or too hard to use. This is how defense can become more dynamic as attacks do.[6][10]

## 7. Make zero trust the default (it is not a statement about the team)

Zero trust is neither distrust of employees nor a product purchase. It is a discipline: network location, seniority, and account ownership do not by themselves justify access. Grant bounded access for a task, for a defined time, with least privilege and prompt revocation when the need ends.[4][5]

This matters especially for AI. An agent with access to a document store, source repository, finance workflow, or customer system may combine permissions that were granted separately. The question is not whether the agent sounds capable. It is what it can read, change, send, publish, delete, or pay for without another decision point.

The same principle helps staff. A time-limited grant for a defined task is easier to understand, approve, review, and remove than broad permanent access that nobody revisits.

## 8. Third parties and the AI supply chain

Much of the risk now arrives through vendors rather than the front door. Before a material vendor or AI service connects to company data, management should assess its security, and the contract should fix retention, use for training, breach notification timelines, audit rights, and exit. Concentration deserves board attention: dependence on a single cloud, model provider, or identity service is a resilience decision, not a procurement detail. For AI specifically, ask where the model and its training data come from, and confirm that any vendor's access can be revoked as quickly as an employee's.[3][7]

## 9. Trust, but verify the whole setup

Verification should follow consequence, wherever the consequence sits: a system, a data flow, a human decision, or an AI action. High-consequence AI outputs and actions need human review or another independent control. High-consequence human actions need the same discipline (a second channel, a second person, or dual control), and applying it is not surveillance of the people involved. Test after a material change to a model, data source, prompt, connector, or deployment path. Protect logs, which may contain sensitive content and the record of how an action occurred. Rehearse revocation and incident response before an urgent case makes improvisation attractive.[6]

One counterpoint matters. DMARC (Domain-based Message Authentication, Reporting and Conformance), TLS (Transport Layer Security), and data-loss-prevention tools are useful controls, but none proves a message is safe. An enterprise AI label does not prove appropriate data use. A human click does not prove that a decision was sound. Controls reduce risk. They do not erase judgment.

## 10. Prepare for the bad day

Detection without recovery is half a program. The board should confirm four things exist and are exercised, not merely documented.

**An incident response plan with named roles**, including legal counsel, communications, and the decision rights to disconnect systems or revoke access. Run a tabletop exercise at least annually, and include executives and the board in one scenario, because the hardest decisions in a real incident (pay or refuse ransom, disclose or wait, disconnect or observe) are theirs.

**Disclosure readiness.** Under Singapore's Personal Data Protection Act (PDPA), an organization must assess a suspected breach within 30 calendar days; a breach assessed as notifiable must be reported to the Personal Data Protection Commission (PDPC) as soon as practicable and no later than three calendar days, with affected individuals also notified where required. Sector regulators can impose shorter clocks.[16][17] The assessment itself takes preparation: know in advance who decides, on what evidence, and with which counsel. Boards are judged on disclosure handling at least as harshly as on the breach itself.

**Recovery.** Maintain offline or immutable backups of crown-jewel data, test restoration on a schedule, and set recovery-time objectives for the systems the business cannot operate without. Ransomware turns these from IT hygiene into a solvency question.

**Insurance clarity.** Know what the cyber policy covers and excludes, what it requires during an incident (many policies void coverage if their notification and forensics terms are ignored), and whether AI-related events are within scope.

Underneath all of this sit the unglamorous foundations: patched and current systems, phishing-resistant authentication, tested backups, and access removed promptly when people leave. The NCSC expects AI to accelerate exploitation of unpatched systems; the basics are the first casualty of treating security as an annual exercise.[10][14]

## 11. What this costs

Security spending competes with everything else the organization could do, and the board should see it framed that way. Management's investment case should show three numbers side by side: the cost of the proposed controls, a defensible estimate of the loss exposure they reduce, and the speed dividend of safe defaults (time not lost to workarounds, approvals, and cleanup). The board should also ask what was deferred to fund it, and what was declined. A security budget that never states its opportunity cost is not being governed; it is being tolerated.

## Questions the board should ask management

Each answer should come with a target range and a trend, not a snapshot. A metric without a threshold is an anecdote.

1. **Safe sharing by default:** Can staff share ordinary internal information quickly through approved tools, while protections rise clearly for sensitive data and high-consequence actions? Management should demonstrate use of approved channels, external near misses, exception turnaround, and whether routine work remains fast.

2. **Known and bounded AI use:** Can management show which AI tools and agents are connected to information or systems, what each can see and do, who owns it, and how access is removed? The board should expect a current inventory, named owners, access reviews, retention settings, and evidence that revocation works.

3. **Human authority at the edge:** Which actions remain human decisions, particularly external sending, publication, payments, deletion, permission changes, bulk export, and decisions affecting people? Management should show the approval boundary for each action and the share of high-risk actions reviewed before execution.

4. **Dynamic detection and response:** Can management detect changing risk across channels, get a human to a high-risk case quickly, contain it, learn, and update controls? The evidence should include time from anomaly to human decision, time to contain or revoke, false-positive and bypass rates, and lessons from incidents and exercises.

5. **Security that earns use:** Are the safe paths sufficiently fast and usable that staff do not resort to personal email, consumer AI, unsanctioned storage, or informal workarounds? Management should measure approved-tool adoption, stale access, exception use, and staff confidence in reporting mistakes.

6. **Ready for the bad day:** When did we last restore crown-jewel data from backup, run an incident exercise with executives present, and rehearse the disclosure decision? Management should show dates, findings, and what changed as a result.

The board's job is not to choose between security and speed. It is to insist that the organization earns both.

## Terms used in this note

- **Zero trust:** Do not grant access merely because a person, device, or system is inside the organization. Check the identity, context, and requested action, then give only the access needed for the task.[4]

- **Trust, but verify:** Trust people to work and report mistakes. Verify the whole setup (systems, data flows, high-consequence human actions, and AI claims) early enough to stop or contain harm. Verifying a consequential action is not surveillance of the person taking it.[6]

- **Phishing-resistant MFA (multi-factor authentication):** Sign-in that cannot be captured and replayed by a fake site or a persuasive caller, in practice passkeys or hardware security keys. Codes sent by text or generated by an app can be phished; these cannot.[14]

- **Prompt injection:** Instructions hidden in content an AI system reads (a web page, document, or email) that hijack the system into leaking data or misusing its permissions. The top-ranked risk in the Open Worldwide Application Security Project (OWASP) list for AI applications, and the core reason prompts are not an access-control boundary.[18]

- **DMARC:** An email-domain control. It tells receiving mail systems what to do when a message claiming to be from your domain fails sender checks. It helps reduce domain spoofing, but does not prove that an email is genuine or safe.[11]

- **TLS:** Encryption for the connection between email servers while a message travels over the internet. It protects the journey, not whether the recipient should receive the content, what they do after delivery, or whether the message is a fraud.[11]

- **STRIDE:** A design-review method for product and security teams, not a board operating principle. It asks whether someone could impersonate a user or service, alter data, deny an action, disclose information, disrupt a service, or gain excess privilege (spoofing, tampering, repudiation, information disclosure, denial of service, elevation of privilege). Use it when approving a material new AI system, connector, or data flow.[12]

## Sources

1. [NCSC cyber security culture principles, principle 1](https://www.ncsc.gov.uk/collection/cyber-security-culture-principles/principle-1) — UK government guidance; supports the reporting-culture argument.
2. [NCSC cyber security culture principles, principle 2](https://www.ncsc.gov.uk/collection/cyber-security-culture-principles/principle-2) — UK government guidance; supports culture plus controls.
3. [NCSC guidelines for secure AI system development: secure design](https://www.ncsc.gov.uk/collection/guidelines-secure-ai-system-development/guidelines/secure-design) — joint government guidance; supports AI tool design defaults.
4. [NIST SP 800-207, Zero Trust Architecture](https://csrc.nist.gov/pubs/sp/800/207/final) — US standard; supports the zero-trust definition and discipline.
5. [NIST Cybersecurity Framework (CSF) 2.0](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf) — US framework; supports governance anchoring and access principles.
6. [NIST AI 600-1, Generative AI Profile of the AI Risk Management Framework](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf) — US framework profile; supports verification and monitoring of AI systems.
7. [NCSC guidelines for secure AI system development: secure development](https://www.ncsc.gov.uk/collection/guidelines-secure-ai-system-development/guidelines/secure-development) — joint government guidance; supports supply-chain and development controls.
8. [CISA SCuBA Microsoft Exchange Online secure configuration baseline](https://www.cisa.gov/sites/default/files/2024-05/CISA%20SCuBA%20Microsoft%20Exchange%20Online%20SCB.pdf) — US government baseline; supports email defaults such as blocking automatic external forwarding.
9. [NCSC guidance on reducing data exfiltration by malicious insiders](https://www.ncsc.gov.uk/guidance/reducing-data-exfiltration-by-malicious-insiders) — UK government guidance; supports the channel rules and exfiltration routes.
10. [NCSC assessment: the impact of AI on the cyber threat to 2027](https://www.ncsc.gov.uk/report/impact-ai-cyber-threat-now-2027) — UK government threat assessment; supports the threat framing and the unpatched-systems point.
11. [NCSC email security and anti-spoofing collection](https://www.ncsc.gov.uk/collection/email-security-and-anti-spoofing) — UK government guidance; supports the DMARC and TLS definitions.
12. [Microsoft threat modeling tool threats (STRIDE)](https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats) — vendor documentation; supports the STRIDE definition.
13. [ISO/IEC 42001:2023, AI management systems](https://www.iso.org/standard/81230.html) — international standard; supports framework anchoring for AI governance.
14. [CISA fact sheet: implementing phishing-resistant MFA](https://www.cisa.gov/sites/default/files/publications/fact-sheet-implementing-phishing-resistant-mfa-508c.pdf) — US government guidance; supports the authentication recommendations.
15. [MITRE ATT&CK, Exfiltration tactic (TA0010)](https://attack.mitre.org/tactics/TA0010/) — adversary technique catalogue; supports the exfiltration-route list.
16. [PDPC: when an organisation is required to notify the PDPC](https://www.pdpc.gov.sg/required-to-notify-the-pdpc) — Singapore regulator page; supports the notification obligation.
17. [PDPC guide on managing and notifying data breaches under the PDPA (15 Mar 2021)](https://www.pdpc.gov.sg/-/media/Files/PDPC/PDF-Files/Other-Guides/Guide-on-Managing-and-Notifying-Data-Breaches-under-the-PDPA-15-Mar-2021.pdf) — Singapore regulator guide; supports the 30-day assessment and 3-calendar-day notification timelines (verified against the guide, 2026-08-29).
18. [OWASP Top 10 for Large Language Model Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/) — community security standard; supports the prompt-injection definition.

## Change history

- **2026-08-30 — v1.1:** Retitled to "Balancing Knowledge Sharing, Convenience, and Security". Reframed trust-but-verify holistically: culture for people, verification across the whole setup including high-consequence human actions. Removed the prediction on fully automated end-to-end attacks. Renamed sections 2, 3, 4, 7, and 9. Spelled out acronyms at first use.
- **2026-08-29 — v1.0:** Initial reviewed version.
