import type { Env } from './types';
import { postCreateWedding, getWeddingBySlug } from './routes/wedding';
import { postMagicLinkRequest, getMagicLinkVerify } from './routes/auth';
import {
  getMe,
  postVerifyMobileRequest,
  postVerifyMobileConfirm,
  postSetNric,
  postCharitySelection,
  postAddPartner,
  getCharityList,
} from './routes/couple';
import {
  postDataSubjectRequest,
  postSupportRequest,
  getComplianceStatus,
  getAiTasks,
  approveAiTask,
  postBreachAssessment,
} from './routes/compliance';
import { postCreateGift, getGiftPublic, getRefundLink } from './routes/gift';
import { postHitpayWebhook } from './routes/hitpay';

type Handler = (req: Request, env: Env, ctx: ExecutionContext) => Promise<Response>;

interface Route {
  method: string;
  pattern: RegExp;
  handler: Handler;
}

const ROUTES: Route[] = [
  // Auth
  { method: 'POST', pattern: /^\/api\/auth\/magic-link\/request$/, handler: postMagicLinkRequest },
  { method: 'GET',  pattern: /^\/api\/auth\/magic-link\/verify$/,  handler: getMagicLinkVerify },

  // Wedding
  { method: 'POST', pattern: /^\/api\/wedding\/create$/,                  handler: postCreateWedding },
  { method: 'GET',  pattern: /^\/api\/wedding\/by-slug\/[a-z0-9-]+$/,     handler: getWeddingBySlug },

  // Gifts (public)
  { method: 'POST', pattern: /^\/api\/gift\/create$/,                     handler: postCreateGift },
  { method: 'GET',  pattern: /^\/api\/gift\/[^/]+$/,                      handler: getGiftPublic },
  { method: 'GET',  pattern: /^\/api\/gift\/[^/]+\/refund-link\/[a-f0-9]+$/, handler: getRefundLink },

  // HitPay webhook
  { method: 'POST', pattern: /^\/api\/hitpay\/webhook$/,                  handler: postHitpayWebhook },

  // Couple (session-authed)
  { method: 'GET',  pattern: /^\/api\/couple\/me$/,                       handler: getMe },
  { method: 'POST', pattern: /^\/api\/couple\/verify-mobile\/request$/,   handler: postVerifyMobileRequest },
  { method: 'POST', pattern: /^\/api\/couple\/verify-mobile\/confirm$/,   handler: postVerifyMobileConfirm },
  { method: 'POST', pattern: /^\/api\/couple\/set-nric$/,                 handler: postSetNric },
  { method: 'POST', pattern: /^\/api\/couple\/charity-selection$/,        handler: postCharitySelection },
  { method: 'POST', pattern: /^\/api\/couple\/add-partner$/,              handler: postAddPartner },

  // Charity (public)
  { method: 'GET',  pattern: /^\/api\/charity\/list$/, handler: getCharityList },

  // Compliance (public — PDPA, contact form, status)
  { method: 'POST', pattern: /^\/api\/compliance\/dsr$/,     handler: postDataSubjectRequest },
  { method: 'POST', pattern: /^\/api\/compliance\/support$/, handler: postSupportRequest },
  { method: 'GET',  pattern: /^\/api\/compliance\/status$/,  handler: getComplianceStatus },

  // Admin compliance (Cloudflare Access protects /api/admin/* at the edge)
  { method: 'GET',  pattern: /^\/api\/admin\/ai-tasks$/,                       handler: getAiTasks },
  { method: 'POST', pattern: /^\/api\/admin\/ai-tasks\/[^/]+\/approve$/,       handler: approveAiTask },
  { method: 'POST', pattern: /^\/api\/admin\/breach$/,                         handler: postBreachAssessment },
];

export async function route(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(req.url);
  for (const r of ROUTES) {
    if (r.method === req.method && r.pattern.test(url.pathname)) {
      try {
        return await r.handler(req, env, ctx);
      } catch (err) {
        console.error('Route handler error', err);
        return new Response(
          JSON.stringify({ error: { code: 'internal_error', message: 'Something went wrong.' } }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  }
  return new Response(
    JSON.stringify({ error: { code: 'not_found', message: 'Route not found' } }),
    { status: 404, headers: { 'Content-Type': 'application/json' } }
  );
}
