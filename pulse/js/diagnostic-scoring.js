// Pure scoring function. No DOM. Safe to import in browser or Node.

const PACKAGE_MIDPOINT = { entry: 1049, core: 1999, premium: 3749 };
const DEAL_MIDPOINT = { "<1K": 500, "1K-5K": 3000, "5K-25K": 15000, "25K+": 40000 };

export function scoreAnswers(answers, weights, thresholds) {
  const w = weights || {};
  const a = answers || {};
  let score = 0;

  score += (w.industry && w.industry[a.industry]) || 0;
  score += (w.headcount && w.headcount[a.headcount]) || 0;
  const spendBucket = bucketSpend(a.spend);
  score += (w.spend && w.spend[spendBucket]) || 0;
  score += (w.dealSize && w.dealSize[a.dealSize]) || 0;
  score += (w.urgency && w.urgency[a.urgency]) || 0;

  // Package recommendation
  let pkg = "entry";
  const spendNum = Number(a.spend) || 0;
  const dealMid = DEAL_MIDPOINT[a.dealSize] || 0;
  const t = thresholds || {};
  if (t.premium && spendNum >= (t.premium.minSpend || Infinity) && dealMid >= (t.premium.minDealSize || Infinity)) {
    pkg = "premium";
  } else if (t.core && spendNum >= (t.core.minSpend || Infinity) && dealMid >= (t.core.minDealSize || Infinity)) {
    pkg = "core";
  }

  // Fit flag
  let fitFlag = "good";
  if (a.headcount === "<10" && spendNum < 500 && a.dealSize === "<1K") {
    fitFlag = "freelancer-better";
    score = Math.min(score, 30);
  } else if (score < 40) {
    fitFlag = "stretch";
  }

  // Break-even: retainer / deal size = deals/mo to cover us
  const retainer = PACKAGE_MIDPOINT[pkg];
  const breakEvenDeals = dealMid > 0 ? Math.ceil(retainer / dealMid) : null;
  const realistic = breakEvenDeals !== null && breakEvenDeals <= 4;

  const priority = rankCapabilities(a.pains || [], a.goal || "");

  return {
    score: clamp(score, 0, 100),
    package: pkg,
    fitFlag,
    breakEvenDeals,
    realistic,
    priority
  };
}

function bucketSpend(v) {
  const n = Number(v) || 0;
  if (n >= 5000) return "5000+";
  if (n >= 3000) return "3000";
  if (n >= 1000) return "1500";
  if (n >= 250) return "500";
  return "0";
}

function rankCapabilities(pains, goal) {
  const s = { "social-web": 1, video: 1, leads: 1, digital: 1, creative: 1 };
  if (pains.includes("No consistent leads")) s.leads += 3;
  if (pains.includes("Content feels generic")) { s.video += 2; s.digital += 2; }
  if (pains.includes("Website dead")) { s.digital += 2; s.leads += 1; }
  if (pains.includes("No team capacity")) { s["social-web"] += 2; s.creative += 2; }
  if (pains.includes("No clue what's working")) s.leads += 2;
  if (goal === "More qualified leads") s.leads += 2;
  if (goal === "Better brand/website" || goal === "Better brand+website") s.digital += 2;
  if (goal === "Launch campaigns faster") s.creative += 2;
  return Object.entries(s).sort((a, b) => b[1] - a[1]).map(([id]) => id);
}

function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
