export type Retailer = {
  retailer: string;
  short: string;
  sharePct: number;
  outlets: number;
  tone: "value" | "premium" | "urban-jp" | "ethnic" | "indep";
};

export const sgRetailerShare: Retailer[] = [
  { retailer: "NTUC FairPrice", short: "NTUC", sharePct: 57, outlets: 230, tone: "value" },
  { retailer: "Sheng Siong", short: "Sheng Siong", sharePct: 14, outlets: 74, tone: "value" },
  { retailer: "Cold Storage (DFI)", short: "Cold Storage", sharePct: 9, outlets: 46, tone: "premium" },
  { retailer: "Giant (DFI)", short: "Giant", sharePct: 7, outlets: 43, tone: "value" },
  { retailer: "Prime", short: "Prime", sharePct: 3, outlets: 28, tone: "value" },
  { retailer: "Don Don Donki", short: "Donki", sharePct: 3, outlets: 17, tone: "urban-jp" },
  { retailer: "Mustafa", short: "Mustafa", sharePct: 2, outlets: 1, tone: "ethnic" },
  { retailer: "Independents/Others", short: "Others", sharePct: 5, outlets: 320, tone: "indep" },
];

export const categoryGrowthYoY = [
  { category: "Snacks", yoy: 4.2 },
  { category: "Beverages", yoy: 5.6 },
  { category: "Dairy", yoy: 1.4 },
  { category: "Personal Care", yoy: 2.1 },
  { category: "Household", yoy: -0.8 },
  { category: "Frozen", yoy: 6.3 },
  { category: "Confectionery", yoy: 3.4 },
  { category: "Alcohol", yoy: -2.1 },
  { category: "Health & Wellness", yoy: 8.7 },
];
