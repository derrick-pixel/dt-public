# Altru · PDPA Programme & Breach Response Runbook

**Status:** Internal · **Owner:** Group Data Protection Officer · **Last reviewed:** 11 May 2026

Single internal document covering Altru Asia Pte Ltd's PDPA programme (the standing policy) and the breach-response runbook (the on-incident playbook). Both are required to discharge the obligations of the Personal Data Protection Act 2012 (PDPA) and any Professional Fundraiser Agreement we sign with a partner charity.

---

## Part A · PDPA Programme

### A1 · Data Protection Officer
- **Role-holder:** designated DPO at the parent-group level (see group HR records for current name and contact).
- **Working email:** `dpo@altru.asia` (Cloudflare Email Routing → group DPO inbox).
- **Responsibilities:** as set out in PDPA s.11(3), including being the contact point for access/correction requests, breach notifications to PDPC, and joint-response coordination with partner charities.
- **Review cadence:** the DPO reviews this programme annually, with an interim review on any (a) regulatory change, (b) material change to data flows, or (c) breach.

### A2 · Data inventory
The full data inventory by individual category and purpose is published in the public Privacy Notice (altru.asia/privacy.html, Section 2). The internal view adds the system of record and retention class for each field.

| Field | Source | System of record | Retention class |
|---|---|---|---|
| Guest name, mobile | Donor form | D1 `gifts` table | "Operational" — 14 days post-state-resolution |
| Guest NRIC (optional, IRAS only) | Donor form | D1 `tax_receipts` table, encrypted at column level | "Tax record" — 7 years |
| Guest gift amount, txn ref | HitPay webhook | D1 `gifts` + `payments` | "Tax record" — 7 years |
| Couple name, NRIC | Couple onboarding | D1 `couples`, encrypted at column level | "Tax record" — 7 years |
| Couple email, mobile | Couple onboarding | D1 `couples` | "Operational" — 7 years (linked to tax record) |
| Couple session token | Magic-link auth | Workers KV | "Session" — 30 days from last use |
| Magic-link OTP | Magic-link auth | Workers KV | "Ephemeral" — 15 minutes |
| Charity rep contact | Charity onboarding form | D1 `charity_contacts` | "Operational" — duration of partnership + 5 years |
| Audit log entries | All state transitions | D1 `audit_log` (append-only) | "Audit" — 5 years from end of FY (immutable) |

### A3 · Lawful basis
Consent under the PDPA, with explicit purpose statement at the point of collection. No deemed consent is relied upon.

### A4 · Cross-border transfers
None expected in steady-state operation. Cloudflare D1 is provisioned with a Singapore region setting. HitPay processes within Singapore. If a future vendor introduces a cross-border flow, an updated Transfer Limitation Obligation assessment is required *before* go-live, including contractual safeguards equivalent to the PDPA standard of protection.

### A5 · Access and correction
- Requests routed via `dpo@altru.asia`.
- Response SLA: acknowledgement within 5 working days; substantive response within 30 calendar days.
- Reasonable-fee policy: no fee for first request per year per individual; subsequent or out-of-scope requests may attract a quoted administrative fee.
- All requests and responses logged in the `dsar_log` table.

### A6 · Retention enforcement
- A daily Workers Cron job runs `retention.deleteExpiredOperational()` to delete operational data past its retention class.
- A monthly Workers Cron job runs `retention.archiveTaxRecords()` to move tax-record data into the cold archive after the 7-year retention boundary.
- The `audit_log` table is append-only and cannot be deleted within its 5-year retention window.

### A7 · Protection (s.24)
- TLS 1.3 in transit; AES-256 at rest.
- Column-level encryption for NRIC fields using a Cloudflare-managed key, rotated annually.
- Principle of least privilege. Production access requires MFA and is logged.
- Quarterly third-party penetration testing.
- Continuous secret scanning and dependency monitoring in CI.

### A8 · Accountability (s.11–12)
- Annual PDPA review log maintained by the DPO.
- All personnel with production access complete PDPA training annually.
- Confidentiality and IP-assignment clauses in every employment and contractor agreement.
- Annual tabletop exercise of the breach response runbook (Part B).

---

## Part B · Breach Response Runbook

This runbook governs any suspected or confirmed personal-data breach. It is invoked the moment a breach is suspected, not after assessment is complete.

### B0 · Definitions
- **"Breach"** — any unauthorised access, acquisition, use, disclosure, loss, or destruction of personal data, including any "data breach" as defined in the PDPA.
- **"Notifiable breach"** — a breach that, per PDPC's notification thresholds, (a) results in or is likely to result in significant harm to any individual, or (b) is of significant scale (≥ 500 affected individuals).

### B1 · Step 1 — Containment (first hour)
Within 60 minutes of suspicion or detection:
1. The discoverer alerts the DPO and the founder simultaneously via Slack DM and SMS (see contact card below).
2. The DPO opens an incident in the `incidents/` shared folder, naming the incident `INC-YYYY-MMDD-<short>` and pinning the channel.
3. The on-call engineer (or founder, at this scale) **isolates** the affected component — revoke compromised credentials, rotate keys, sever inbound traffic if appropriate. Do not delete forensic evidence.
4. Stop further data exposure. *Do not* attempt remediation that destroys evidence (e.g., wiping logs).

### B2 · Step 2 — Assessment (first 24–72 hours)
The DPO leads, with engineering support:
1. Determine the scope: what data, how many records, how many individuals.
2. Determine the cause: classify as (a) external attack, (b) insider error, (c) vendor failure, (d) other.
3. Determine the harm vector: identity, financial, reputational, regulatory.
4. Determine notifiability per PDPA thresholds.
5. Open a JIRA-equivalent ticket per affected partner-charity if any partner-charity-owned data is implicated.

The PDPA permits up to 30 days for assessment but Altru's working target is 72 hours to a notifiability call.

### B3 · Step 3 — Notification
Triggered on a confirmed notifiable breach:
- **PDPC:** within 3 calendar days of the notifiability assessment. Submit via the PDPC Data Breach Notification portal. Use the prepared template (`/incidents/templates/pdpc-notification.md`).
- **Affected individuals:** as soon as practicable after PDPC notification, where required by PDPC. Use plain-language email + (where contact details available) SMS. The template covers: what happened, what data is affected, what we are doing, what they can do, and our DPO contact.
- **Partner charities (where the breach touches partner-charity-owned data):** within 72 hours of notifiability assessment, per PFA Appendix D. The named partner-charity DPO is the recipient.
- **Founder + group leadership:** immediate, regardless of notifiability.

### B4 · Step 4 — Remediation
- Patch the underlying cause.
- Validate via post-incident penetration test or code review of the affected surface.
- Update the audit-log retention if needed.
- Update the incident record with closure evidence.

### B5 · Step 5 — Post-incident review
Within 14 days of remediation:
- Blameless post-mortem with the DPO and engineering.
- Update this runbook with lessons learned.
- Brief the partner charity DPO on findings and changes if their data was affected.
- File the post-mortem in `/incidents/post-mortems/INC-YYYY-MMDD-<short>.md`.

### B6 · Contact card (for the first hour)
- **DPO:** `dpo@altru.asia` · [group DPO mobile — confidential, kept in 1Password vault `altru-dpo-mobile`]
- **Founder (Derrick):** `derrick@elitez.asia` · [mobile — same vault]
- **PDPC duty officer:** `+65 6377 3131` (general line) or via [PDPC Breach Notification portal](https://www.pdpc.gov.sg/notifyus)
- **HitPay support:** `support@hit-pay.com` (escalation to compliance for any payment-related incident)
- **External counsel:** [to be appointed; placeholder for retained Singapore counsel]

### B7 · Tabletop exercise
Run annually:
- Scenario: simulated SQL injection extracting 200 couple records.
- Participants: DPO, founder, on-call engineer.
- Output: timed walk-through with action items captured in the post-mortems folder.

---

## Part C · Appendix — Quick reference

### Notifiable breach thresholds (PDPA Part VIA)
A breach is notifiable if **either**:
- It results in, or is likely to result in, significant harm to any affected individual; **or**
- It is of a significant scale (≥ 500 affected individuals).

If unsure, treat as notifiable and let PDPC's response settle the question.

### PDPC contact
- Portal: <https://www.pdpc.gov.sg>
- Notification portal: <https://www.pdpc.gov.sg/notifyus>
- General line: +65 6377 3131

### Statutory references
- PDPA 2012: <https://sso.agc.gov.sg/Act/PDPA2012>
- PDPC guidelines: <https://www.pdpc.gov.sg/Guidelines-and-Consultation>
- Charities Act 1994: <https://sso.agc.gov.sg/Act/CA1994>

---

*This document is reviewed annually, or on any breach, regulatory change, or material data-flow change. The next scheduled review is 11 May 2027.*
