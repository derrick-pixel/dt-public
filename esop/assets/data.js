// Elitez ESOP — seed data bundled as a module so the app runs by opening the
// HTML directly (no fetch, no server needed). Derived from elitez-esop-seed-data.json.
// Replace with authoritative HR values before production use.

window.ESOP_DATA = {
  meta: {
    as_of: "2026-04-23",
    confidentiality: "Clause 15 of the Plan — confidential among the Company, Committee and Option Holders."
  },
  org: {
    legal_name: "Elitez Group Pte. Ltd.",
    short: "EGPL",
    address: "2 Kallang Avenue, #03-08, CT Hub, Singapore 339407",
    jurisdiction: "Singapore",
    currency: "SGD",
    fye: "30 April",
    total_outstanding_shares: 32432432,
    pre_esop_shares: 30000000,
    major_shareholders: [
      { name: "Teo Wen Shan, Derrick", role: "Co-founder / CEO", pct: 33.33 },
      { name: "Chen Zaoxiang", role: "Co-founder / Exec Director", pct: 33.33 },
      { name: "Lim Yong Ciat", role: "CFO / ESOP Trustee", pct: 33.34 }
    ],
    entities: [
      { name: "Elitez Group Pte. Ltd.", role: "issuer / holding", pct: 100 },
      { name: "Elitez Pte. Ltd.", role: "subsidiary", pct: 100 },
      { name: "Elitez & Associates Pte. Ltd.", role: "subsidiary", pct: 90 },
      { name: "Elitez (FMCG) Pte. Ltd.", role: "subsidiary", pct: 100, note: "FMCG % discrepancy — KPMG 100% vs xlsx 80/20. RESOLVE." },
      { name: "Elitez Security Pte. Ltd.", role: "subsidiary", pct: 70 },
      { name: "Dynamic Human Capital Pte. Ltd.", role: "subsidiary", pct: 60, note: "Several ESOP holders are DHC employees." },
      { name: "Jobs Today Pte. Ltd.", role: "subsidiary", pct: 100 },
      { name: "Elitez Property Pte. Ltd.", role: "investment holding", pct: 100, note: "Excluded from operational / potential sale scope." }
    ]
  },
  plan: {
    name: "The Elitez Employee Share Option Plan",
    commenced: "2025-10-05",
    term: "Perpetual until revoked (Clause 5)",
    committee: "3 Major Shareholders + 2 senior employees (Clause 5.2)",
    trustee: "Lim Yong Ciat",
    payment: {
      name: "Lin Rongjie",
      email: "rongjie@elitez.asia",
      paynow: "+65 96639634"
    }
  },
  pool: {
    authorised: 6486486,
    pct_fully_diluted: 0.20
  },
  vesting: {
    cliff_pct: 0.20,
    cliff_months: 12,
    monthly_months: 48,
    total_years: 5,
    exit_acceleration: true
  },
  exercise: {
    window_days: 14,
    mode: "whole, not partial",
    discount: 0.90,   // 90% off FMV => you pay 10%
    share_class: "Series A Preference (converts 1:1 on Exit/IPO)"
  },
  valuation_history: [
    { fy: "FY2021", ebitda: 2866596, multiple: 6, fmv: 0.5303 },
    { fy: "FY2022", ebitda: -690139, multiple: 6, fmv: 0.1969, note: "Negative EBITDA — NTA floor applied" },
    { fy: "FY2023", ebitda: 2221089, multiple: 6, fmv: 0.4109 },
    { fy: "FY2024", ebitda: 6146972, multiple: 6, fmv: 1.1372 },
    { fy: "FY2025", ebitda: 4624269, multiple: 6, fmv: 0.8555, active: true, firm_value: 27745614, exercise_price: 0.0856 }
  ],
  kpmg_benchmark: {
    date: "2024-03",
    ev_multiple_range: [8.0, 9.0],
    ev_sgdm_range: [32.9, 37.0],
    equity_sgdm_range: [28.0, 32.1],
    implied_pe_range: [10.5, 12.1]
  },
  allocation: {
    method: "linear",
    weights: { years: 0.15, performance: 0.60, potential: 0.25 },
    scales: {
      years: [
        { pts: 1, label: "> 3 yrs" },
        { pts: 2, label: "> 5 yrs" },
        { pts: 3, label: "> 7 yrs" },
        { pts: 4, label: "> 9 yrs" },
        { pts: 5, label: "> 12 yrs" }
      ],
      performance: [
        { pts: 1, label: "> 3.5" },
        { pts: 2, label: "> 4.0" },
        { pts: 3, label: "> 4.5" },
        { pts: 4, label: "> 4.75" },
        { pts: 5, label: "5.0" }
      ],
      potential: [
        { pts: 1, label: "75% likely to Senior Manager" },
        { pts: 2, label: "Currently Senior Manager" },
        { pts: 3, label: "50% likely to Director" },
        { pts: 4, label: "75% likely to Director" },
        { pts: 5, label: "Will assume Director" }
      ]
    }
  },
  grants_history: [
    { fy: "FY2022", grant_date: "2022-07-15", letter_date: "2022-07-31", total: 366000, first_exercise: "2027-07-15", deadline: "2027-07-29" },
    { fy: "FY2023", grant_date: null, total: 0, note: "No grants issued." },
    { fy: "FY2024", grant_date: "2024-07-31", letter_date: "2024-07-31", total: 1200000, first_exercise: "2029-07-31", deadline: "2029-08-14" },
    { fy: "FY2025", grant_date: "pending", total: 535300, status: "draft" }
  ],
  special_dividends: [
    {
      name: "Adept Academy Pte Ltd Sale",
      declared: "2025-12-31",
      trigger: "Sale of subsidiary",
      gross: 1400000,
      broker_fee: 56000,
      staff_set_aside: 30000,
      distributable: 1314000,
      non_esop_allocations: [
        { recipient: "Tommy", pct: 0.20, amount: 262800 },
        { recipient: "EGPL", pct: 0.80, amount: 1051200 }
      ],
      esop_pool: 70054.46,
      esop_shares_entitled: 2056942,
      per_share: 0.0341,
      condition: "Must exercise ESOP within one month of declaration"
    }
  ],
  holders: [
    { id: 1, name: "Tok Meiting", dept: "HR", title: "HR Manager", nat: "Singaporean", ic: "XXXXX267F", email: "tok@elitez.asia",
      grants: [
        { fy: "FY2022", grant_date: "2022-07-15", qty: 60000, status: "active" },
        { fy: "FY2024", grant_date: "2024-07-31", qty: 71595, status: "active" },
        { fy: "FY2025", grant_date: null, qty: 40400, status: "draft" }
      ], status: "active" },
    { id: 2, name: "Li Qian", dept: "FIN", title: "Senior Finance Manager", nat: "Singaporean", ic: "XXXXX139F", email: "li@elitez.asia",
      grants: [
        { fy: "FY2022", grant_date: "2022-07-15", qty: 60000, status: "active" },
        { fy: "FY2024", grant_date: "2024-07-31", qty: 71595, status: "active" },
        { fy: "FY2025", grant_date: null, qty: 40400, status: "draft" }
      ], status: "active" },
    { id: 3, name: "Eevann Seah", dept: "SALES", title: "Senior Manager", nat: "Singaporean", ic: "XXXXX620D", email: "eevann@elitez.asia",
      grants: [
        { fy: "FY2022", grant_date: "2022-07-15", qty: 35000, status: "active" },
        { fy: "FY2024", grant_date: "2024-07-31", qty: 66926, status: "active" },
        { fy: "FY2025", grant_date: null, qty: 39200, status: "draft" }
      ], status: "active" },
    { id: 4, name: "Wang Jiemin (Jack)", dept: "SALES", title: "Associate Director", nat: "Singaporean", ic: "XXXXX978G", email: "wang@elitez.asia",
      grants: [
        { fy: "FY2022", grant_date: "2022-07-15", qty: 40000, status: "active" },
        { fy: "FY2024", grant_date: "2024-07-31", qty: 69261, status: "active" },
        { fy: "FY2025", grant_date: null, qty: 42700, status: "draft" }
      ], status: "active" },
    { id: 5, name: "Sharon Lau Jie Joo", dept: "SALES", title: "Senior Manager", nat: "Malaysian", ic: "XXXXX763E", email: "sharon@elitez.asia",
      grants: [
        { fy: "FY2022", grant_date: "2022-07-15", qty: 40000, status: "active" },
        { fy: "FY2024", grant_date: "2024-07-31", qty: 66926, status: "active" },
        { fy: "FY2025", grant_date: null, qty: 9700, status: "draft" }
      ], status: "active" },
    { id: 6, name: "Yeoh Ser How", dept: "OPS", title: "Operations Manager", nat: "Malaysian", ic: "XXXXX646F", email: "yeoh@elitez.asia",
      grants: [
        { fy: "FY2022", grant_date: "2022-07-15", qty: 26000, status: "active" },
        { fy: "FY2024", grant_date: "2024-07-31", qty: 52140, status: "active" },
        { fy: "FY2025", grant_date: null, qty: 9700, status: "draft" }
      ], status: "active" },
    { id: 7, name: "Chan Wai Seng, Nicholas", dept: "SALES", title: "Head of Tenders", nat: "Singaporean", ic: "XXXXX162G", email: "chan@elitez.asia",
      grants: [
        { fy: "FY2022", grant_date: "2022-07-15", qty: 25000, status: "active" },
        { fy: "FY2024", grant_date: "2024-07-31", qty: 40467, status: "active" },
        { fy: "FY2025", grant_date: null, qty: 18500, status: "draft" }
      ], status: "active" },
    { id: 8, name: "Damien Tan Han Kiap", dept: "SALES", title: "Business Development Manager", nat: "Singaporean", ic: "XXXXX253Z", email: "damien@elitez.asia",
      grants: [
        { fy: "FY2022", grant_date: "2022-07-15", qty: 20000, status: "active" },
        { fy: "FY2024", grant_date: "2024-07-31", qty: 45914, status: "active" },
        { fy: "FY2025", grant_date: null, qty: 17100, status: "draft" }
      ], status: "active" },
    { id: 9, name: "Chen Ting", dept: "FIN", title: "Senior Finance Executive", nat: "Chinese", ic: "XXXXX645G", email: "chen@elitez.asia",
      grants: [
        { fy: "FY2022", grant_date: "2022-07-15", qty: 20000, status: "active" },
        { fy: "FY2024", grant_date: "2024-07-31", qty: 48249, status: "active" },
        { fy: "FY2025", grant_date: null, qty: 13700, status: "draft" }
      ], status: "active" },
    { id: 10, name: "Andy Lim Wen Jie", dept: "OPS", title: "Deputy Head, ESG", nat: "Singaporean", ic: "XXXXX300D", email: "andy@elitez.asia",
      grants: [
        { fy: "FY2022", grant_date: "2022-07-15", qty: 20000, status: "active" },
        { fy: "FY2024", grant_date: "2024-07-31", qty: 40467, status: "active" },
        { fy: "FY2025", grant_date: null, qty: 15000, status: "draft" }
      ], status: "active" },
    { id: 11, name: "Aiydon Li Yi Xuan", dept: "HR", title: "Team Lead", nat: "Singaporean", ic: "XXXXX890Z", email: "aiydon@elitez.asia",
      grants: [
        { fy: "FY2022", grant_date: "2022-07-15", qty: 20000, status: "active" },
        { fy: "FY2024", grant_date: "2024-07-31", qty: 55253, status: "active" },
        { fy: "FY2025", grant_date: null, qty: 13700, status: "draft" }
      ], status: "active" },
    { id: 12, name: "Wong Siew Hua", dept: "FIN", title: "Assistant Accounts Manager", nat: "Malaysian", ic: "XXXXX768L", email: "wong@elitez.asia",
      grants: [
        { fy: "FY2024", grant_date: "2024-07-31", qty: 45914, status: "active" },
        { fy: "FY2025", grant_date: null, qty: 28700, status: "draft" }
      ], status: "active" },
    { id: 13, name: "Kan Siew Weng", dept: "FIN", title: "Senior Finance Executive", nat: "Malaysian", ic: "NEEDS RE-ENTRY", email: "kan@elitez.asia",
      grants: [
        { fy: "FY2024", grant_date: "2024-07-31", qty: 45914, status: "active" },
        { fy: "FY2025", grant_date: null, qty: 15000, status: "draft" }
      ], status: "active" },
    { id: 14, name: "How Hee Chek (Jaysen)", dept: "DHC", title: "Deputy Regional Head of Sales", nat: "Singaporean", ic: "XXXXX770A", email: "how@elitez.asia",
      grants: [
        { fy: "FY2024", grant_date: "2024-07-31", qty: 36576, status: "active" },
        { fy: "FY2025", grant_date: null, qty: 15000, status: "draft" }
      ], status: "active" },
    { id: 15, name: "Lim Runting", dept: "DHC", title: "Principal Consultant", nat: "Singaporean", ic: "XXXXX484Z", email: "lim@elitez.asia",
      grants: [
        { fy: "FY2024", grant_date: "2024-07-31", qty: 41245, status: "active" },
        { fy: "FY2025", grant_date: null, qty: 11300, status: "draft" }
      ], status: "active" },
    { id: 16, name: "Ho Si Cong", dept: "DHC", title: "Manager", nat: "Singaporean", ic: "XXXXX440G", email: "ho@elitez.asia",
      grants: [
        { fy: "FY2024", grant_date: "2024-07-31", qty: 40467, status: "active" },
        { fy: "FY2025", grant_date: null, qty: 8200, status: "draft" }
      ], status: "active" },
    { id: 17, name: "Tiong Kai Yuen, Noreen", dept: "DHC", title: "Senior Researcher", nat: "Singaporean", ic: "XXXXX127B", email: "tiong@elitez.asia",
      grants: [
        { fy: "FY2024", grant_date: "2024-07-31", qty: 29572, status: "active" },
        { fy: "FY2025", grant_date: null, qty: 7300, status: "draft" }
      ], status: "active" },
    { id: 18, name: "Tan Hui Qing", dept: "DHC", title: "Operations Manager", nat: "Singaporean", ic: "XXXXX958Z", email: "tan.hq@elitez.asia",
      grants: [
        { fy: "FY2024", grant_date: "2024-07-31", qty: 41245, status: "active" },
        { fy: "FY2025", grant_date: null, qty: 23300, status: "draft" }
      ], status: "active" },
    { id: 19, name: "Kenneth Koh", dept: "OPS", title: "Operations Manager", nat: "Singaporean", ic: "XXXXX246D", email: "kenneth@elitez.asia",
      grants: [
        { fy: "FY2024", grant_date: "2024-07-31", qty: 45914, status: "active" },
        { fy: "FY2025", grant_date: null, qty: 2300, status: "draft" }
      ], status: "active" },
    { id: 20, name: "Heng Zeng Yang Ian", dept: "SALES", title: "Business Development Manager", nat: "Singaporean", ic: "XXXXX974E", email: "heng@elitez.asia",
      grants: [
        { fy: "FY2024", grant_date: "2024-07-31", qty: 63035, status: "active" },
        { fy: "FY2025", grant_date: null, qty: 18500, status: "draft" }
      ], status: "active" },
    { id: 21, name: "Tsai Pei-Hua (Penny)", dept: "SALES", title: "Manager", nat: "Taiwanese", ic: "XXXXX445G", email: "tsai@elitez.asia",
      grants: [
        { fy: "FY2024", grant_date: "2024-07-31", qty: 36576, status: "active" },
        { fy: "FY2025", grant_date: null, qty: 11900, status: "draft" }
      ], status: "active" },
    { id: 22, name: "Jorena Tan Chee Huan", dept: "SALES", title: "Business Development Manager", nat: "Singaporean", ic: "XXXXX775B", email: "jorena@elitez.asia",
      grants: [
        { fy: "FY2024", grant_date: "2024-07-31", qty: 56809, status: "active" },
        { fy: "FY2025", grant_date: null, qty: 11900, status: "draft" }
      ], status: "active" },
    { id: 23, name: "Melissa Tan Yi Xuan", dept: "SALES", title: "Senior BD Executive", nat: "Singaporean", ic: "XXXXX251I", email: "melissa@elitez.asia",
      grants: [
        { fy: "FY2024", grant_date: "2024-07-31", qty: 43580, status: "active" },
        { fy: "FY2025", grant_date: null, qty: 11900, status: "draft" }
      ], status: "active" },
    { id: 24, name: "Marilyn Choo Lih Cheen", dept: "FIN", title: "Team Lead", nat: "Malaysian", ic: "XXXXX317G", email: "marilyn@elitez.asia",
      grants: [
        { fy: "FY2025", grant_date: null, qty: 35900, status: "draft" }
      ], status: "active" },
    { id: 25, name: "Phua Qiu Ru", dept: "DHC", title: "Senior Manager", nat: "Singaporean", ic: "XXXXX923H", email: "phua@elitez.asia",
      grants: [
        { fy: "FY2025", grant_date: null, qty: 15000, status: "draft" }
      ], status: "active" },
    { id: 26, name: "Neo Xian Yao", dept: "SALES", title: "Assistant BD Manager", nat: "Singaporean", ic: "XXXXX999D", email: "neo@elitez.asia",
      grants: [
        { fy: "FY2025", grant_date: null, qty: 20100, status: "draft" }
      ], status: "active" },
    { id: 27, name: "Tan Sheng Yang", dept: "FIN", title: "Assistant Finance Manager", nat: "Singaporean", ic: "XXXXX893G", email: "tan.sy@elitez.asia",
      grants: [
        { fy: "FY2025", grant_date: null, qty: 28700, status: "draft" }
      ], status: "active" },
    { id: 28, name: "Chan Huan Zhang Adrian", dept: "SALES", title: "BD Manager", nat: "Singaporean", ic: "XXXXX162D", email: "chan.a@elitez.asia",
      grants: [
        { fy: "FY2025", grant_date: null, qty: 10200, status: "draft" }
      ], status: "active" }
  ],
  leavers: [
    { name: "Samion Ong", note: "FY2022 20,000 forfeited — leaver treatment TBD" },
    { name: "Philip Leong", note: "FY2022 20,000 forfeited — leaver treatment TBD" },
    { name: "Asmond Soh", note: "FY2022 20,000 forfeited — leaver treatment TBD" }
  ],
  data_quality: [
    { sev: "high", topic: "Kan Siew Weng IC",
      issue: "Stored as scientific notation in xlsx; needs clean re-entry." },
    { sev: "high", topic: "FMCG ownership %",
      issue: "KPMG: 100%; xlsx Trading Rules implies 80/20 with Eevann. Resolve before go-live." },
    { sev: "high", topic: "Committee composition",
      issue: "Legal: 3 Major Shareholders + 2 senior employees; Guidebook: 2 employees + 1 Management. Legal wins — update Guidebook." },
    { sev: "medium", topic: "Yeoh Ser How nationality",
      issue: "Singaporean in 2024 sheet; Malaysian in 2025 sheet. Confirm with HR." },
    { sev: "medium", topic: "Factor 1 threshold",
      issue: "Guidebook: >5 yrs = 2 pts; xlsx used 4 yrs = 2 pts. Guidebook governs." },
    { sev: "medium", topic: "Toh Hui Leong (Daryl)",
      issue: "Dual entries in xlsx (active #5 + terminated #29). Treated as Left pending confirmation." },
    { sev: "medium", topic: "Pre-Commencement grants",
      issue: "FY2022 and FY2024 grants pre-date Plan commencement (5 Oct 2025). Confirm instrument of regularisation." },
    { sev: "low", topic: "FY2023 zero grants",
      issue: "Confirm intentional gap vs missing records." },
    { sev: "low", topic: "Leaver determinations",
      issue: "Samion, Philip, Asmond — Good vs Bad Leaver determination pending." },
    { sev: "low", topic: "Valuation multiple choice",
      issue: "Internal 6× vs KPMG 8–9×. Conservative internal reduces taxable perquisite at exercise but also reduces exit optics. Conscious policy?" }
  ]
};
