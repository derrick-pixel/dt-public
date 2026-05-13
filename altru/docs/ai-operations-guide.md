# Altru — AI Operations Guide
**For: Solo Operator (Derrick Teo) · Last updated: 13 May 2026**

This guide explains how to run Altru as a one-person organisation using AI agents to handle the routine admin, compliance, and communication tasks that would otherwise require a full team.

---

## Overview: What the AI Does vs. What You Do

Altru's architecture is designed so that **you only do things that require human judgement or legal authority**. Everything routine — scanning transactions, drafting invoices, monitoring for regulatory changes, screening donors — is done by AI and queued for your review.

| Done by AI (Claude) | Done by You (Operator) |
|---|---|
| Weekly transaction compliance scan | Review AI report + action any flags |
| Monthly invoice drafting | Review draft → send to charity |
| MAS sanctions list refresh | Review if any new matches flagged |
| Regulatory update scanning | Review updates → engage lawyer if needed |
| Charity onboarding email drafting | Review draft → send to charity |
| Support response drafting | Review draft → send from your email |
| Data breach assessment | Review assessment → decide on PDPC notification |
| DSR deadline tracking | Action each DSR (access, deletion, etc.) |
| Daily reconciliation report | Review discrepancies → resolve with HitPay |

---

## 1. Setting Up AI Operations

### Step 1: Get a Claude API Key
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Set it as a Worker secret:
```bash
wrangler secret put CLAUDE_API_KEY
```

### Step 2: Enable AI Ops
Update `wrangler.jsonc`:
```jsonc
"AI_OPS_ENABLED": "true"
```

### Step 3: Set your notification email
```bash
wrangler secret put OPERATOR_NOTIFY_EMAIL
# Enter: your@email.com
```

### Step 4: Configure the MAS sanctions list URL
```bash
wrangler secret put SANCTIONS_LIST_URL
# Enter the URL to the MAS designated-persons list
# Find at: mas.gov.sg → Regulation → AML/CFT → Designated Persons
```

### Step 5: Deploy
```bash
npm run deploy
```

From this point, all AI cron jobs run automatically on schedule. You receive email notifications for each AI task awaiting your review.

---

## 2. Your Daily Routine (15 minutes)

Every morning, check the admin dashboard at `altru.asia/admin/`.

### Check the AI task queue
Go to **Admin → AI Tasks** or call `GET /api/admin/ai-tasks?status=awaiting_review`

For each task:
- Read the AI output
- If it looks correct: click **Approve** (or `POST /api/admin/ai-tasks/:id/approve`)
- If something needs action: note it in the task and action it externally

### Check DSR deadlines
Go to **Admin → Data Requests**
- Any with fewer than 3 days to deadline need immediate attention
- The daily cron will have emailed you about these overnight

### Check for new regulatory updates
Go to **Admin → Regulatory Updates**
- "HIGH" impact items need reading today
- "MEDIUM" can wait for weekly review
- Contact your lawyer for anything requiring legal interpretation

---

## 3. Weekly Routine (30 minutes, every Monday)

The **weekly AI compliance review** runs automatically at 18:00 SGT every Monday. You'll receive an email by 18:30.

**Your Monday review checklist:**
- [ ] Read the compliance review email from `noreply@altru.asia`
- [ ] If GREEN signal: no action needed, approve the task
- [ ] If AMBER signal: action the specific flags identified
- [ ] If RED signal: pause disbursements, contact lawyer immediately
- [ ] Review any new sanctions flags from the weekly period
- [ ] Review any disputed weddings

---

## 4. Monthly Routine (1 hour, 1st of each month)

### Invoice Review (1st of month, ~15 mins)
The AI drafts monthly invoices for all charity partners overnight on the 1st.

1. Check email for "Monthly Invoice Draft" notification
2. Go to Admin → AI Tasks → find the invoice_draft task
3. Review the AI-drafted invoices for accuracy:
   - Verify disbursement amounts match your records
   - Verify 5% fee calculation is correct
   - Verify charity details (name, UEN, finance email)
4. Approve the task
5. Send the invoices from your email client (copy-paste from AI output)
6. CC the charity's finance_email

### SOA Review (if applicable)
If a fundraising appeal has ended in the past month:
- Trigger SOA draft from Admin → AI Tasks → New Task → SOA Draft
- Review the AI output
- Submit to Commissioner of Charities via Charity Portal within 60 days

### Regulatory check
- Review any new regulatory_updates flagged in the past month
- If IRAS/COC/MAS have published relevant updates, share with your lawyer for advice

---

## 5. AI-Powered Workflows in Detail

### 5.1 Charity Onboarding (when adding a new charity partner)
When a new charity expresses interest:

1. Collect from the charity:
   - Charity name, UEN, IPC number
   - Finance contact email
   - PayNow UEN (for disbursements)
   - IPC status expiry date

2. Trigger onboarding email draft via Admin:
   ```
   POST /api/admin/charity-onboard
   { charity_id, charity_name, charity_uen, ipc_no, finance_email }
   ```

3. AI drafts a professional onboarding email with:
   - Platform explanation
   - PFA checklist
   - Timeline to go-live

4. Review in Admin → AI Tasks
5. Send from your email client

6. Once the PFA is signed, upload the PDF to R2 and update `pfa_agreements` in D1:
   ```sql
   UPDATE pfa_agreements SET status = 'signed', signed_at = unixepoch('now'), document_r2_key = 'pfas/charity-name-2026.pdf' WHERE charity_id = '...';
   ```

### 5.2 Support Response Workflow
When a donor or couple emails you:

1. Go to `altru.asia/admin/#support-draft` (or call the API directly)
2. Paste the email subject and body
3. AI drafts a response in 10-15 seconds
4. Review and personalise if needed
5. Send from your own email client

**Never auto-send AI support responses.** Always read and approve first.

### 5.3 Data Breach Response
If you suspect a data breach (e.g., unauthorised access to D1, compromised API key):

**Immediate steps (first 30 minutes):**
1. Isolate the breach: rotate compromised secrets via `wrangler secret put`
2. Enable maintenance mode (add a `MAINTENANCE=true` env var and return 503)
3. Document the incident

**PDPA compliance (within 3 calendar days of determining breach is notifiable):**
1. Go to Admin → Breach Assessment
2. Describe the incident, affected data types, estimated count
3. AI will assess notifiability under PDPA in ~30 seconds
4. If notifiable: file with PDPC at [pdpc.gov.sg/report-data-breach](https://www.pdpc.gov.sg/report-data-breach)
5. Notify affected individuals as soon as reasonably practicable

**Never delay the breach assessment.** The 3-calendar-day clock starts from when you determine it's notifiable, not from discovery — but PDPC expects assessment to happen quickly.

---

## 6. Compliance Calendar (Annual)

| Month | Task | Owner |
|---|---|---|
| January | Annual IPC status verification for all charity partners | You + AI |
| February | PDPA programme annual review | DPO (you) |
| March | AML/CFT programme review | You + lawyer |
| April | Annual insurance renewal check (PI + cyber liability) | You |
| May | ACRA annual return (7 months after FY end) | Company secretary |
| June | Review IRAS 250% deduction — any IRAS updates? | You |
| August | Key rotation: NRIC_ENCRYPTION_KEY and SESSION_HMAC_SECRET | You (tech) |
| October | Annual PDPA tabletop exercise (data breach simulation) | You + AI |
| December | Monitor: 250% deduction extension beyond Dec 2026 | You |
| December | PSA licence status review | You + lawyer |

---

## 7. Limits of AI — What You Must Do Yourself

The AI agents support your work but **cannot replace professional judgement** in these areas:

**Always involve a lawyer for:**
- Any decision to rely on a PSA exemption (get this in writing)
- Reviewing PFA agreements before signing
- Any MAS Notice PSN01 compliance interpretation
- Any PDPC enforcement correspondence
- Any dispute involving a charity partner

**Always handle yourself (not AI):**
- Filing with PDPC for data breach notification
- Signing PFA agreements with charities
- Filing fundraising permit applications with COC
- Communicating with IRAS about tax receipt mechanics
- Approving disbursements above S$5,000
- Any STR (Suspicious Transaction Report) filing with STRO

**Never approve an AI task without reading it.** The AI can make mistakes, hallucinate regulatory requirements, or produce incorrect financial calculations. You are legally responsible for everything Altru does.

---

## 8. Cost Estimates for AI Operations

Running all AI operations at typical Altru volume (Year 1):

| Task | Model | Est. tokens/run | Frequency | Est. cost/month |
|---|---|---|---|---|
| Weekly compliance review | Sonnet | ~3,000 | 4×/month | ~S$0.90 |
| Monthly invoice drafts | Haiku | ~2,000 | 1×/month | ~S$0.05 |
| Regulatory update scans | Haiku | ~800 × 4 sources | 1×/month | ~S$0.05 |
| Support drafts | Haiku | ~600 | ~5×/month | ~S$0.05 |
| Misc (sanctions summaries, onboarding) | Haiku | ~500 | ~2×/month | ~S$0.02 |
| **Total** | | | | **~S$1.10/month** |

This is essentially free at Altru's launch volume. Costs scale only with usage.

---

## 9. Escalation Contacts

| Issue | Who to Contact |
|---|---|
| PSA / payment law | Singapore payments counsel (brief: `/docs/payments-lawyer-brief.md`) |
| Charities Act / COC | Singapore charity law counsel |
| IRAS tax receipt | IRAS directly: `/docs/iras-clarification-letter.md` |
| PDPA / data breach | PDPC: pdpc.gov.sg · DPO: dpo@altru.asia |
| Sanctions match | AML lawyer + STRO (Suspicious Transaction Reporting Office) |
| HitPay issues | HitPay merchant support + your payments lawyer |
| ACRA / company filings | Company secretary (Sleek or Osome) |

---

*This guide is a living document. Update it whenever the compliance landscape changes or new workflows are added.*
