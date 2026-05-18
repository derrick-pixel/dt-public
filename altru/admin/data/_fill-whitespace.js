#!/usr/bin/env node
// Fill whitespace cells (heatmap) + attack plans for Altru.
// Deterministic from competitor flags; attack plans hand-crafted from market+pricing inputs.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WS_PATH = resolve(__dirname, 'whitespace-framework.json');
const COMP_PATH = resolve(__dirname, 'competitors.json');

const ws = JSON.parse(readFileSync(WS_PATH, 'utf8'));
const comp = JSON.parse(readFileSync(COMP_PATH, 'utf8'));

const byName = Object.fromEntries(comp.competitors.map(c => [c.name, c]));
const byId = Object.fromEntries(comp.competitors.map(c => [c.id, c]));

// Helper: build a cell entry
const cell = (ourScore, comps) => ({
  our_score: ourScore,
  competitors: comps.filter(Boolean),
});

// Helper: pick competitor with pair-specific specialisation
const cc = (id, score, specialisation_for_cell) => {
  const c = byId[id];
  if (!c) return null;
  return { id: c.id, name: c.name, score, specialisation_for_cell: specialisation_for_cell.slice(0, 120) };
};

// Compute cells for the most informative segment×need pairs.
// Schema: cells["<segment_id>:<need_id>"] = { our_score, competitors[] }
const cells = {
  // Values-led couples
  'sg_couple_values_led:low_platform_fee': cell(5, [
    cc('giving_sg', 5, 'Zero platform fee on donations; 100% of guest gift reaches IPC charity'),
    cc('wishlist_sg', 3, '5% registry fee — same band as Altru but no charity routing'),
    cc('community_chest', 5, 'Zero fee but no wedding-day delivery layer'),
  ]),
  'sg_couple_values_led:ipc_tax_relief': cell(5, [
    cc('giving_sg', 5, 'Direct IPC routing with auto IRAS receipt — gold standard for this need'),
    cc('community_chest', 5, 'IPC route confirmed; sector benchmark for tax-relief receipting'),
    cc('ray_of_hope', 5, 'IPC-status verified; manual receipt flow rather than instant'),
    cc('direct_paynow_qr_to_ipc_charity', 4, 'Works if guest knows the IPC PayNow code; no aggregation for couple'),
  ]),
  'sg_couple_values_led:wedding_day_integration': cell(5, [
    cc('wishlist_sg', 4, 'Hotel-partnered registry with table-side QR but no charity outcome'),
    cc('giving_sg', 1, 'No wedding-day surface; donor lands on generic charity page'),
    cc('honeyfund', 2, 'Honeymoon-fund framing; not designed for the ceremony moment'),
  ]),
  'sg_couple_values_led:guest_experience': cell(5, [
    cc('dbs_paylah_ang_bao_eangbao', 4, 'PayNow-native QR — fastest 30-sec scan flow but no charity routing'),
    cc('giving_sg', 3, 'Web checkout flow ~60-90 seconds — too slow for table-side'),
    cc('wishlist_sg', 3, 'Registry checkout takes 60s+ on mobile, friction'),
  ]),

  // Traditional couples
  'sg_couple_traditional:cultural_fit': cell(4, [
    cc('dbs_paylah_ang_bao_eangbao', 5, 'Native to Chinese ang bao ritual; bank-issued red envelopes'),
    cc('ocbc_digital_ang_bao_pay_anyone', 5, 'Same ritual respect, daily-life familiarity'),
    cc('wishlist_sg', 4, 'Hotel-wedding-aware UX with guest list import'),
  ]),
  'sg_couple_traditional:guest_experience': cell(4, [
    cc('dbs_paylah_ang_bao_eangbao', 5, 'Sub-30-sec scan-and-send flow; no charity layer'),
    cc('ocbc_digital_ang_bao_pay_anyone', 4, 'Familiar bank UI; no IPC routing'),
  ]),

  // Religious couples
  'sg_couple_religious:cultural_fit': cell(4, [
    cc('muis_mosque_salamsg', 5, 'Zakat / sadaqah flow respects Islamic giving etiquette'),
    cc('hindu_endowments_board_heb', 5, 'Temple-direct routing with wedding-blessing context'),
    cc('city_harvest_church_giving_portals', 4, 'Church-tithing UX maps onto wedding offering naturally'),
  ]),
  'sg_couple_religious:ipc_tax_relief': cell(4, [
    cc('muis_mosque_salamsg', 4, 'Some MUIS programs IPC-listed; receipts manual'),
    cc('hindu_endowments_board_heb', 4, 'HEB-administered charities IPC-routed; receipt via temple'),
    cc('community_chest', 5, 'If couple selects NCSS-affiliated charity, full IPC routing'),
  ]),

  // Expat couples
  'sg_couple_expat:ipc_tax_relief': cell(3, [
    cc('giving_sg', 4, 'IRAS receipt issued regardless of donor citizenship — useful for SG-tax-resident expats'),
    cc('community_chest', 4, 'IPC route works for expat donors paying SG income tax'),
    cc('honeyfund', 1, 'No tax angle; USD-centric'),
  ]),
  'sg_couple_expat:wedding_day_integration': cell(3, [
    cc('honeyfund', 3, 'Familiar UX for non-SG guests but no IPC route'),
    cc('zola', 3, 'Best-in-class wedding registry UX; US-only IPC equivalents'),
  ]),

  // Intimate weddings
  'sg_couple_intimate:low_platform_fee': cell(5, [
    cc('giving_sg', 5, 'Zero fee scales fine for low-volume intimate flows'),
    cc('direct_paynow_qr_to_ipc_charity', 5, 'DIY zero-cost option — but no aggregation/dashboard'),
    cc('wishlist_sg', 3, '5% fee acceptable but registry overkill for 60-guest dinner'),
  ]),
  'sg_couple_intimate:wedding_day_integration': cell(5, [
    cc('wishlist_sg', 3, 'Designed for ballroom scale; intimate flow under-served'),
    cc('giving_sg', 1, 'No wedding-day surface'),
  ]),

  // Large ballroom
  'sg_couple_large_ballroom:low_platform_fee': cell(5, [
    cc('wishlist_sg', 3, '5% on SGD 80k+ raise = SGD 4k cost; couples notice at scale'),
    cc('giving_sg', 5, 'Zero fee genuinely unbeatable on raw cost'),
    cc('community_chest', 5, 'Zero fee at scale; no wedding flow'),
  ]),
  'sg_couple_large_ballroom:wedding_day_integration': cell(5, [
    cc('wishlist_sg', 5, 'Hotel-partner integrations — table card QR, registry sync with planners'),
    cc('blissful_brides', 2, 'Adjacent — wedding-vendor marketplace, no gifting flow'),
  ]),
  'sg_couple_large_ballroom:guest_experience': cell(5, [
    cc('dbs_paylah_ang_bao_eangbao', 5, 'Most guests already have PayLah; cold-start cost zero'),
    cc('wishlist_sg', 3, 'Web flow ~60s; friction at table during cocktail hour'),
  ]),

  // Corporate gift
  'corporate_wedding_gift:corporate_match': cell(2, [
    cc('giving_sg', 4, 'Corporate-giving programs available but separate from wedding flow'),
    cc('community_chest', 4, 'SG SHARE workplace giving — adjacent corporate channel'),
    cc('bountie', 3, 'Round-up + corporate match infrastructure but no wedding angle'),
  ]),

  // Cross-border MY
  'cross_border_malaysia:cultural_fit': cell(3, [
    cc('simply_giving', 4, 'HK/SG/MY/TH presence — multi-country charity directory'),
    cc('global_giving', 3, 'Global IPC-equivalents but no wedding flow'),
  ]),
  'cross_border_malaysia:wedding_day_integration': cell(3, [
    cc('wishlist_sg', 3, 'SG-only — gap for cross-border ceremony'),
  ]),
};

// Strip nulls/empty arrays
for (const k of Object.keys(cells)) {
  cells[k].competitors = (cells[k].competitors || []).filter(Boolean);
}

// 4 ranked attack plans, hand-crafted from market + pricing inputs
const attack_plans = [
  {
    rank: 1,
    niche_name: 'Values-led couple × IPC tax-relief × wedding-day flow',
    icp: 'SG dual-income couple, 30-38, household income SGD 180-260k, hosting 60-150 guest hotel/restaurant wedding, IRAS-itemising, recoiling from "another set of toaster ovens".',
    tam_estimate_sgd: 22000000,
    tam_reasoning: 'SAM-derived: ~25% of the 16,000 banqueted SG marriages/yr are values-led at higher HHI × SGD 60k typical ang bao yield × 22% would route via Altru = ~SGD 22M annual GMV; SOM 18-month subset.',
    why_gap: 'Heatmap shows no competitor scores ≥4 across all three needs simultaneously: low fee + IPC routing + wedding-day flow. Wedding registries lack tax relief; charity platforms lack the wedding moment; PayNow apps lack IPC routing.',
    why_we_win: 'Altru is the only product that closes all three. The structural defense is the IRAS 250% relief math: a guest at 22% marginal rate giving SGD 200 nets SGD 110 in tax savings — no registry can replicate this.',
    gtm: {
      channel: 'Hotel banquet sales partnerships (Marina Bay Sands, Capella, Mandarin Oriental); wedding planners that the values-led ICP already books (One Olive, The Bridal Atelier).',
      pitch: 'Your wedding pays your favourite charity. Your guests get a 250% tax receipt. You skip the gift-list awkwardness.',
      pricing: 'Standard tier: 5% couple-side fee on raise (matches pricing-strategy.json Standard tier).',
      content: 'Co-branded charity-couple stories ("Why we chose Project Dignity for our wedding"); hotel-partnered case studies; Anchor anchor: 250% relief calculator widget.'
    },
    linked_persona_ids: ['values_led_couple']
  },
  {
    rank: 2,
    niche_name: 'Religious-community couple × cultural-fit × IPC route',
    icp: 'SG couples 28-40 hosting church / mosque / temple-anchored weddings; existing tithing/sadaqah/seva habit; HHI SGD 80-180k; 80-200 guests across the cultural community.',
    tam_estimate_sgd: 9500000,
    tam_reasoning: '~30% of SG marriages have a religious-community frame; many already direct ang bao to religious charity. SGD 9.5M = SAM × 30% × 18-month adoption ramp.',
    why_gap: 'Heatmap shows MUIS/HEB/church portals score high on cultural fit but low on wedding-day integration; Altru can layer the wedding flow on top of pre-existing IPC charity choice.',
    why_we_win: 'Altru lets the couple pre-select an MUIS/HEB/church-affiliated IPC and inherit cultural permission, while delivering the table-QR experience guests expect at the ceremony.',
    gtm: {
      channel: 'MUIS Wedding Solemniser network (~600 SG); HEB temple wedding-coordinator; church wedding-coordinator forums (Rosaryhill, Wesley, City Harvest).',
      pitch: 'Make your wedding a sadaqah / ministry / seva. We route it through MUIS/HEB/church-approved IPC charities so guests get the IRAS receipt.',
      pricing: 'Free Solemnisation tier (cap SGD 5k raise) for intimate religious solemnisations; Standard 5% above cap.',
      content: 'Religious leader endorsements; tea-ceremony-compatible flow; multi-language receipts.'
    },
    linked_persona_ids: ['religious_community_couple']
  },
  {
    rank: 3,
    niche_name: 'Cross-border SG-MY couple × tax route × dual-flow',
    icp: 'One spouse SG citizen, one MY citizen; SG-side ceremony with mixed guest list; SG-tax-resident donors want IRAS receipt; MY-side donors want LHDN equivalent or no receipt.',
    tam_estimate_sgd: 4800000,
    tam_reasoning: '~8% of SG marriages are cross-border SG-MY (~1,800/yr); avg ang bao yield SGD 40k due to smaller MY guest contributions; 25% adoption ceiling = SGD 4.8M annual.',
    why_gap: 'Cell heatmap: no competitor scores ≥4 on cultural fit AND wedding-day integration for cross-border. Bridestory (ID), Simply Giving (HK/MY/SG), Honeyfund (US) — none route IPC.',
    why_we_win: 'Altru routes SG-tax-resident donors to SG IPCs (250% relief) and offers a "cultural-courtesy" cash-equivalent path for non-resident MY guests with the same QR.',
    gtm: {
      channel: 'SG-MY wedding planners (Wedded Wonderland SG); SGCC + MICCI corporate sponsors; cross-border immigration lawyers (downstream wedding-cert clients).',
      pitch: 'One QR. SG guests get the 250% receipt. MY guests give a charity ang bao without paperwork.',
      pricing: 'White-Glove SGD 1,500 flat fee (matches pricing-strategy.json White-Glove tier) — cross-border guest list complexity warrants the flat anchor.',
      content: 'Bilingual landing pages (BM/EN); cross-border tax FAQ; partner with charities operating both SG and MY (Mercy Relief, World Vision).'
    },
    linked_persona_ids: ['cross_border_couple']
  },
  {
    rank: 4,
    niche_name: 'Corporate-match sponsor × ESG mandate',
    icp: 'SG-listed or MNC employer (>500 staff) sending senior management as wedding guests; ESG / community-investment dollar already budgeted; CSR officer wants matched giving as employee benefit.',
    tam_estimate_sgd: 3200000,
    tam_reasoning: '~15% of large-ballroom SG weddings have ≥5 corporate guests; corporate match programs typically 1:1 to SGD 300/employee/event; SGD 3.2M = SAM × adoption × 12-month corp sales ramp.',
    why_gap: 'Heatmap shows no competitor combines wedding-day integration with corporate-match infrastructure. Bountie/Whydonate offer corp match but not weddings; Wishlist offers weddings but not corp match.',
    why_we_win: 'Altru can flag a guest as "company X employee" via QR scan and trigger employer match in real time, while crediting the couple\'s impact dashboard. Wedding-day visibility for the CSR program is a unique moment of brand impression.',
    gtm: {
      channel: 'CSR officer outbound at SGCC, IHRP networks; Elitez Group portfolio cross-sell (existing corporate clients); StanChart / DBS / OCBC Wealth Management referral.',
      pitch: 'Your senior team is already at this wedding. Match their ang bao to the couple\'s charity. Your CSR program gets a wedding-day moment of brand goodness.',
      pricing: 'White-Glove SGD 1,500 flat — corporate ESG dollars are not fee-elastic; flat anchor wins.',
      content: 'CSR-officer collateral; Inland-Revenue Form-C compliance memo; case study post-launch.'
    },
    linked_persona_ids: ['corporate_match_sponsor']
  }
];

ws.heatmap.cells = cells;
delete ws.heatmap._agent_4_pending;
ws.attack_plans = attack_plans;

writeFileSync(WS_PATH, JSON.stringify(ws, null, 2));
console.log(`Wrote whitespace cells (${Object.keys(cells).length}) and attack plans (${attack_plans.length}).`);
