import type { Env } from '../types';
import { generateId } from '../lib/id';
import { nowSeconds } from '../lib/time';

// ── AI Operations Service ─────────────────────────────────────────────────
//
// Wraps Anthropic Claude API for automated compliance and admin tasks.
// Designed for a 1-person operation where AI handles routine admin:
//
//   • Weekly compliance review of all transactions
//   • Monthly invoice + SOA drafting
//   • Daily sanctions list refresh summaries
//   • Regulatory change monitoring (MAS / IRAS / COC / PDPC)
//   • Donor/couple support response drafting
//   • Data breach assessment
//   • Charity onboarding PFA checklist generation
//
// OPERATOR OVERSIGHT: All AI outputs are stored in ai_tasks with status
// 'awaiting_review'. The operator reviews and approves before any external
// action (sending emails, filing reports). Nothing is auto-actioned externally.
//
// Model selection:
//   • claude-haiku-4-5      — routine tasks (invoice drafts, summaries)
//   • claude-sonnet-4-6     — complex analysis (compliance review, breach assessment)

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const HAIKU   = 'claude-haiku-4-5';
const SONNET  = 'claude-sonnet-4-6';

type AiTaskType =
  | 'compliance_review'
  | 'invoice_draft'
  | 'soa_draft'
  | 'sanctions_refresh'
  | 'regulatory_update_scan'
  | 'reconciliation_report'
  | 'support_draft'
  | 'charity_onboarding'
  | 'breach_assessment';

interface AiTaskResult {
  taskId: string;
  output: string;
  model: string;
  tokensUsed: number;
}

// ── Core Claude call ───────────────────────────────────────────────────────
async function callClaude(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userMessage: string,
  maxTokens = 2048
): Promise<{ content: string; tokensUsed: number }> {
  const res = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error ${res.status}: ${err}`);
  }

  const data = await res.json() as {
    content: Array<{ type: string; text: string }>;
    usage: { input_tokens: number; output_tokens: number };
  };

  const content = data.content.find(c => c.type === 'text')?.text ?? '';
  const tokensUsed = (data.usage.input_tokens ?? 0) + (data.usage.output_tokens ?? 0);
  return { content, tokensUsed };
}

// ── Create an AI task record ───────────────────────────────────────────────
async function createTask(
  env: Env,
  taskType: AiTaskType,
  input: object
): Promise<string> {
  const id = generateId();
  await env.DB.prepare(
    `INSERT INTO ai_tasks (id, ts, task_type, status, input_json, created_at)
     VALUES (?, ?, ?, 'running', ?, ?)`
  ).bind(id, nowSeconds(), taskType, JSON.stringify(input), nowSeconds()).run();
  return id;
}

async function completeTask(
  env: Env,
  taskId: string,
  output: string,
  model: string,
  tokensUsed: number
): Promise<void> {
  await env.DB.prepare(
    `UPDATE ai_tasks
     SET status = 'awaiting_review', output_json = ?, model_used = ?,
         tokens_used = ?, completed_at = ?
     WHERE id = ?`
  ).bind(JSON.stringify({ output }), model, tokensUsed, nowSeconds(), taskId).run();
}

async function failTask(env: Env, taskId: string, error: string): Promise<void> {
  await env.DB.prepare(
    `UPDATE ai_tasks SET status = 'failed', output_json = ?, completed_at = ? WHERE id = ?`
  ).bind(JSON.stringify({ error }), nowSeconds(), taskId).run();
}

// ── Notify operator of new AI task ────────────────────────────────────────
async function notifyOperator(
  env: Env,
  taskType: string,
  taskId: string,
  summary: string
): Promise<void> {
  if (!env.OPERATOR_NOTIFY_EMAIL || !env.RESEND_API_KEY) return;
  const reviewUrl = `${env.PUBLIC_BASE_URL}/admin/#ai-tasks/${taskId}`;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Altru AI Ops <noreply@altru.asia>',
      to: env.OPERATOR_NOTIFY_EMAIL,
      subject: `[Altru AI] ${taskType} — awaiting your review`,
      text: `A new AI task is ready for your review.\n\nTask: ${taskType}\nTask ID: ${taskId}\n\n${summary}\n\nReview at: ${reviewUrl}\n\n— Altru AI Ops`,
      html: `<p>A new AI task is ready for your review.</p><p><strong>Task:</strong> ${taskType}<br><strong>Task ID:</strong> ${taskId}</p><p>${summary.replace(/\n/g, '<br>')}</p><p><a href="${reviewUrl}">Review and approve →</a></p><p style="color:#999">— Altru AI Ops</p>`,
    }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC TASK FUNCTIONS
// Each function: creates task → calls Claude → stores output → notifies
// ═══════════════════════════════════════════════════════════════════════════

// ── 1. Weekly Compliance Review ────────────────────────────────────────────
// Reviews all transactions from the past 7 days for AML/compliance signals.
export async function runWeeklyComplianceReview(env: Env): Promise<AiTaskResult> {
  if (env.AI_OPS_ENABLED !== 'true') throw new Error('AI_OPS_ENABLED is false');

  // Gather data context
  const [gifts, sanctions, disputes] = await Promise.all([
    env.DB.prepare(`
      SELECT id, gift_amount_cents, state, guest_name, wedding_id, created_at
      FROM gifts WHERE created_at > unixepoch('now','-7 days') ORDER BY gift_amount_cents DESC LIMIT 50
    `).all(),
    env.DB.prepare(`
      SELECT s.*, c.display_name FROM sanctions_checks s
      LEFT JOIN couples c ON c.id = s.entity_id
      WHERE s.checked_at > unixepoch('now','-7 days') AND s.result != 'pass'
    `).all(),
    env.DB.prepare(`
      SELECT id, slug, status FROM weddings WHERE status = 'disputed' LIMIT 20
    `).all(),
  ]);

  const taskId = await createTask(env, 'compliance_review', {
    period: '7 days',
    gift_count: gifts.results.length,
    sanctions_flags: sanctions.results.length,
  });

  const systemPrompt = `You are the compliance officer for Altru Asia Pte Ltd, a Singapore wedding charitable gifting platform. 
You help a sole operator run the platform's AML/CFT and regulatory compliance under MAS Notice PSN01.
Your role: review transaction data and flag any concerns clearly and concisely.
Always structure your output with: SUMMARY, FLAGS (if any), RECOMMENDED ACTIONS, CLEARANCES.
Be direct and practical — the operator acts on your output.`;

  const userMessage = `Weekly compliance review for the 7-day period ending ${new Date().toISOString().slice(0, 10)}.

GIFTS (last 7 days, highest value first):
${JSON.stringify(gifts.results.slice(0, 20), null, 2)}

SANCTIONS FLAGS (non-pass results):
${JSON.stringify(sanctions.results, null, 2)}

DISPUTED WEDDINGS:
${JSON.stringify(disputes.results, null, 2)}

Please produce a compliance review covering:
1. Any unusual transaction patterns (high value, velocity, geographic clustering)
2. Any sanctions flags requiring operator action
3. Any disputed weddings requiring resolution
4. Overall AML/CFT signal: GREEN / AMBER / RED
5. Specific recommended actions for the operator`;

  try {
    const { content, tokensUsed } = await callClaude(
      env.CLAUDE_API_KEY, SONNET, systemPrompt, userMessage, 1500
    );
    await completeTask(env, taskId, content, SONNET, tokensUsed);
    await notifyOperator(env, 'Weekly Compliance Review', taskId,
      content.split('\n').slice(0, 5).join('\n'));
    return { taskId, output: content, model: SONNET, tokensUsed };
  } catch (e) {
    await failTask(env, taskId, String(e));
    throw e;
  }
}

// ── 2. Monthly Invoice Draft ───────────────────────────────────────────────
// Drafts the monthly fee invoice to each charity. Operator approves before sending.
export async function draftMonthlyInvoices(env: Env, periodMonth: string): Promise<AiTaskResult> {
  if (env.AI_OPS_ENABLED !== 'true') throw new Error('AI_OPS_ENABLED is false');

  const charities = await env.DB.prepare(
    `SELECT c.id, c.name, c.uen, c.finance_email,
            SUM(d.amount_cents) as total_disbursed,
            COUNT(d.id) as disbursement_count
     FROM charities c
     JOIN disbursements d ON d.charity_id = c.id
     WHERE d.status = 'confirmed'
       AND strftime('%Y-%m', datetime(d.confirmed_at,'unixepoch')) = ?
     GROUP BY c.id`
  ).bind(periodMonth).all();

  const taskId = await createTask(env, 'invoice_draft', { period: periodMonth, charity_count: charities.results.length });

  const feeBps = parseInt(env.PLATFORM_FEE_BPS ?? '500', 10);
  const feeRate = (feeBps / 10000 * 100).toFixed(1);

  const systemPrompt = `You are the finance administrator for Altru Asia Pte Ltd (UEN: [UEN]).
You draft monthly platform fee invoices to IPC charity partners.
Altru charges a ${feeRate}% platform fee on funds successfully disbursed.
Format each invoice as a professional plain-text invoice ready to send by email.
Include: Invoice number, date, period, itemised amounts, payment instructions (PayNow to Altru UEN), payment terms (14 days).`;

  const userMessage = `Draft monthly fee invoices for period: ${periodMonth}

Disbursement data by charity:
${JSON.stringify(charities.results, null, 2)}

For each charity, calculate:
- Gross disbursed (as provided)
- Altru platform fee = gross × ${feeRate}%
- Net to charity = gross − fee (already disbursed; fee is owed to Altru separately)

Draft one invoice per charity. Include a summary covering all charities at the end.`;

  try {
    const { content, tokensUsed } = await callClaude(
      env.CLAUDE_API_KEY, HAIKU, systemPrompt, userMessage, 2000
    );
    await completeTask(env, taskId, content, HAIKU, tokensUsed);
    await notifyOperator(env, `Monthly Invoice Draft (${periodMonth})`, taskId,
      `${charities.results.length} charity invoice(s) drafted. Review before sending.`);
    return { taskId, output: content, model: HAIKU, tokensUsed };
  } catch (e) {
    await failTask(env, taskId, String(e));
    throw e;
  }
}

// ── 3. Regulatory Update Scan ──────────────────────────────────────────────
// Summarises recent regulatory updates from MAS/IRAS/COC sources.
// Input: raw text fetched from regulatory websites by the cron job.
export async function summariseRegulatoryUpdate(
  env: Env,
  source: string,
  url: string,
  rawText: string
): Promise<AiTaskResult> {
  if (env.AI_OPS_ENABLED !== 'true') throw new Error('AI_OPS_ENABLED is false');

  const taskId = await createTask(env, 'regulatory_update_scan', { source, url });

  const systemPrompt = `You are the compliance officer for Altru Asia Pte Ltd, a Singapore wedding charitable gifting platform.
You monitor regulatory websites (MAS, IRAS, COC, PDPC, ACRA) for changes relevant to the business.
Altru operates as: (a) a payment service provider holding donor funds for up to 14 days, (b) a commercial fund-raiser under the Charities Act, (c) an IPC donation platform qualifying for 250% IRAS tax deduction.
When summarising regulatory updates, always assess: (1) Does this affect Altru? (2) What action is required? (3) What is the urgency?`;

  const userMessage = `Source: ${source}
URL: ${url}
Date: ${new Date().toISOString().slice(0, 10)}

Raw content (truncated to 3000 chars):
${rawText.slice(0, 3000)}

Please:
1. Summarise what has changed or been announced (2-3 sentences)
2. Assess relevance to Altru (HIGH / MEDIUM / LOW / NOT RELEVANT)
3. If relevant, specify exactly what Altru must do and by when
4. Flag if legal counsel needs to be consulted`;

  try {
    const { content, tokensUsed } = await callClaude(
      env.CLAUDE_API_KEY, HAIKU, systemPrompt, userMessage, 800
    );

    // Determine impact from AI response
    const impact = content.toLowerCase().includes('high') ? 'high'
      : content.toLowerCase().includes('medium') ? 'medium'
      : content.toLowerCase().includes('not relevant') ? 'informational'
      : 'low';

    // Store in regulatory_updates
    const updateId = generateId();
    await env.DB.prepare(
      `INSERT INTO regulatory_updates
         (id, detected_at, source, url, summary, impact, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'new', ?)`
    ).bind(updateId, nowSeconds(), source, url, content.slice(0, 500), impact, nowSeconds()).run();

    await completeTask(env, taskId, content, HAIKU, tokensUsed);

    if (impact === 'high' || impact === 'medium') {
      await notifyOperator(env, `Regulatory Update: ${source}`, taskId,
        `Impact: ${impact.toUpperCase()}\n\n${content.slice(0, 300)}`);
    }

    return { taskId, output: content, model: HAIKU, tokensUsed };
  } catch (e) {
    await failTask(env, taskId, String(e));
    throw e;
  }
}

// ── 4. Draft Charity Onboarding Checklist ─────────────────────────────────
// Generates a tailored PFA checklist and onboarding email for a new charity.
export async function draftCharityOnboarding(
  env: Env,
  charityId: string,
  charityName: string,
  charityUen: string,
  ipcNo: string,
  financeEmail: string
): Promise<AiTaskResult> {
  if (env.AI_OPS_ENABLED !== 'true') throw new Error('AI_OPS_ENABLED is false');

  const taskId = await createTask(env, 'charity_onboarding',
    { charityId, charityName, charityUen, ipcNo });

  const systemPrompt = `You are the partnerships manager at Altru Asia Pte Ltd.
You handle onboarding of new IPC charity partners onto the Altru wedding gifting platform.
Altru is a commercial fund-raiser under the Charities Act. Before any donations can be processed,
a signed Professional Fund-raising Agreement (PFA) must be in place.
You write clear, professional emails and checklists for charity finance/compliance teams.`;

  const userMessage = `Draft an onboarding email and checklist for a new charity partner:

Charity: ${charityName}
UEN: ${charityUen}
IPC Number: ${ipcNo}
Finance email: ${financeEmail}

The email should:
1. Introduce Altru and explain the platform (wedding guests donate via PayNow, couple chooses charity, 95% to charity, 5% fee to Altru)
2. Explain the legal framework (Altru is a commercial fund-raiser; PFA required before go-live)
3. Provide a numbered onboarding checklist: IPC status verification, PFA signing, PayNow UEN confirmation, finance contact confirmation, PDPA data sharing consent, donor tax receipt process (NRIC transmission)
4. State the expected timeline to go-live (10-14 business days)
5. Provide our contact details (dpo@altru.asia for data questions, operator email for commercial)

Be warm but professional. Keep it under 400 words.`;

  try {
    const { content, tokensUsed } = await callClaude(
      env.CLAUDE_API_KEY, HAIKU, systemPrompt, userMessage, 1000
    );
    await completeTask(env, taskId, content, HAIKU, tokensUsed);
    await notifyOperator(env, `Charity Onboarding: ${charityName}`, taskId,
      `Onboarding email drafted for ${charityName} (${charityUen}). Review before sending to ${financeEmail}.`);
    return { taskId, output: content, model: HAIKU, tokensUsed };
  } catch (e) {
    await failTask(env, taskId, String(e));
    throw e;
  }
}

// ── 5. Data Breach Assessment ──────────────────────────────────────────────
// PDPA requires notification to PDPC within 3 calendar days of determining
// a breach is notifiable. This helps the operator make that determination.
export async function assessDataBreach(
  env: Env,
  incidentDescription: string,
  affectedDataTypes: string[],
  estimatedAffectedCount: number
): Promise<AiTaskResult> {
  if (env.AI_OPS_ENABLED !== 'true') throw new Error('AI_OPS_ENABLED is false');

  const taskId = await createTask(env, 'breach_assessment', {
    affectedDataTypes, estimatedAffectedCount,
  });

  const systemPrompt = `You are the Data Protection Officer (DPO) advisor for Altru Asia Pte Ltd.
Altru collects: names, emails, mobile numbers, NRICs (encrypted), PayNow references, IP addresses.
Singapore PDPA (amended 2021) requires notification to PDPC within 3 calendar days if a breach:
  (a) is likely to result in significant harm to individuals, OR
  (b) affects 500 or more individuals.
Significant harm includes: bodily harm, humiliation, damage to reputation, financial loss, identity theft, discrimination, injury to feelings.
You must provide a clear, actionable assessment that the DPO can use to decide on notification obligations.`;

  const userMessage = `DATA BREACH INCIDENT ASSESSMENT REQUEST

Incident description: ${incidentDescription}

Affected data types: ${affectedDataTypes.join(', ')}
Estimated number of individuals affected: ${estimatedAffectedCount}
Date/time detected: ${new Date().toISOString()}

Please assess:
1. IS THIS A NOTIFIABLE BREACH? (Yes / No / Uncertain — explain)
2. SIGNIFICANT HARM ASSESSMENT: for each affected data type, what harm could result?
3. PDPC NOTIFICATION REQUIRED? (Yes/No — trigger: significant harm OR >= 500 individuals)
4. AFFECTED INDIVIDUALS NOTIFICATION REQUIRED? (Yes/No — when?)
5. RECOMMENDED IMMEDIATE ACTIONS (containment, evidence preservation, escalation)
6. DEADLINE: if notification required, what is the 3-calendar-day deadline?

Be precise. This assessment may be used as evidence of due diligence.`;

  try {
    const { content, tokensUsed } = await callClaude(
      env.CLAUDE_API_KEY, SONNET, systemPrompt, userMessage, 1200
    );
    await completeTask(env, taskId, content, SONNET, tokensUsed);
    // Breach assessments always notify operator immediately
    await notifyOperator(env, '⚠️ DATA BREACH ASSESSMENT', taskId,
      `URGENT: Breach assessment completed. ${estimatedAffectedCount} individuals potentially affected. Review immediately.`);
    return { taskId, output: content, model: SONNET, tokensUsed };
  } catch (e) {
    await failTask(env, taskId, String(e));
    throw e;
  }
}

// ── 6. Support Response Draft ──────────────────────────────────────────────
// Drafts a response to a donor or couple inquiry. Operator reviews before sending.
export async function draftSupportResponse(
  env: Env,
  inquiryType: 'donor' | 'couple' | 'charity' | 'general',
  subject: string,
  messageBody: string,
  senderEmail: string
): Promise<AiTaskResult> {
  if (env.AI_OPS_ENABLED !== 'true') throw new Error('AI_OPS_ENABLED is false');

  const taskId = await createTask(env, 'support_draft', { inquiryType, subject, senderEmail });

  const systemPrompt = `You are the customer support representative for Altru Asia Pte Ltd, a Singapore wedding charitable gifting platform.
Altru enables wedding guests to send ang bao (red packets) where part goes to an IPC charity in the couple's name.
Key facts to know: 14-day authorisation window, PayNow only, 250% IRAS tax deduction for couples, 5% platform fee paid by charity.
Tone: warm, helpful, professional. Keep responses concise (under 200 words unless complexity requires more).
Never promise outcomes you cannot guarantee. For legal/tax questions, recommend the sender consult their own advisor.
For data-related requests, always direct to dpo@altru.asia.`;

  const userMessage = `Draft a support response to the following inquiry:

From: ${senderEmail}
Inquiry type: ${inquiryType}
Subject: ${subject}

Message:
${messageBody}

Draft a response that:
1. Acknowledges their query warmly
2. Answers clearly and accurately based on how Altru works
3. Provides next steps if action is required
4. Ends with offer to help further

Output the draft email response only (no commentary).`;

  try {
    const { content, tokensUsed } = await callClaude(
      env.CLAUDE_API_KEY, HAIKU, systemPrompt, userMessage, 600
    );
    await completeTask(env, taskId, content, HAIKU, tokensUsed);
    await notifyOperator(env, `Support Draft: ${subject}`, taskId,
      `Response drafted for ${senderEmail}. Review and send from your email client.`);
    return { taskId, output: content, model: HAIKU, tokensUsed };
  } catch (e) {
    await failTask(env, taskId, String(e));
    throw e;
  }
}
