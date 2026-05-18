export type PriceSpread = {
  sku: string;
  category: string;
  prices: { retailer: string; price: number; promo?: string }[];
};

export const priceSpreadSamples: PriceSpread[] = [
  {
    sku: "Coca-Cola 1.5L",
    category: "CSD",
    prices: [
      { retailer: "NTUC", price: 2.45 },
      { retailer: "Sheng Siong", price: 2.30, promo: "2 for $4.50" },
      { retailer: "Cold Storage", price: 2.95 },
      { retailer: "Giant", price: 2.40 },
      { retailer: "Prime", price: 2.55 },
      { retailer: "Donki", price: 2.80 },
    ],
  },
  {
    sku: "Milo 1kg refill",
    category: "Beverages",
    prices: [
      { retailer: "NTUC", price: 13.20, promo: "Member $11.95" },
      { retailer: "Sheng Siong", price: 12.60 },
      { retailer: "Cold Storage", price: 14.50 },
      { retailer: "Giant", price: 12.95 },
      { retailer: "Prime", price: 13.50 },
      { retailer: "Donki", price: 15.80 },
    ],
  },
  {
    sku: "Pantene 480ml shampoo",
    category: "Haircare",
    prices: [
      { retailer: "NTUC", price: 11.95 },
      { retailer: "Sheng Siong", price: 11.50, promo: "20% off" },
      { retailer: "Cold Storage", price: 13.20 },
      { retailer: "Giant", price: 11.90 },
      { retailer: "Prime", price: 12.40 },
      { retailer: "Donki", price: 12.80 },
    ],
  },
  {
    sku: "Magnum Almond 4-pack",
    category: "Ice Cream",
    prices: [
      { retailer: "NTUC", price: 13.95 },
      { retailer: "Sheng Siong", price: 12.95, promo: "2 for $24" },
      { retailer: "Cold Storage", price: 14.95 },
      { retailer: "Giant", price: 13.50 },
      { retailer: "Prime", price: 13.95 },
      { retailer: "Donki", price: 13.80 },
    ],
  },
  {
    sku: "Pocari Sweat 500ml",
    category: "Isotonic",
    prices: [
      { retailer: "NTUC", price: 2.30 },
      { retailer: "Sheng Siong", price: 2.10, promo: "2 for $4" },
      { retailer: "Cold Storage", price: 2.65 },
      { retailer: "Giant", price: 2.20 },
      { retailer: "Prime", price: 2.40 },
      { retailer: "Donki", price: 2.45 },
    ],
  },
];

// 12 categories × 52 weeks promo intensity (0-100)
export const promoCalendar = (() => {
  const cats = [
    "CSD", "Snacks", "Confectionery", "Dairy", "Frozen",
    "Personal Care", "Household", "Alcohol", "Asian Drinks",
    "Cooking", "Health", "Pet",
  ];
  const peaks: Record<number, number> = { 4: 90, 5: 95, 6: 70, 24: 80, 25: 78, 26: 60, 33: 50, 41: 65, 50: 92, 51: 88 };
  return cats.map((c, ci) => ({
    category: c,
    weeks: Array.from({ length: 52 }, (_, w) => {
      const base = 18 + ((ci * 7 + w * 3) % 18);
      const peak = peaks[w] ?? 0;
      const cyclic = Math.max(0, Math.sin((w + ci) / 4) * 12);
      return Math.min(100, Math.round(base + cyclic + peak * (0.5 + ((ci * 11) % 10) / 20)));
    }),
  }));
})();

export const promoDepthBuckets = [
  { bucket: "0–5%", label: "Everyday low", count: 412 },
  { bucket: "5–15%", label: "Member tactical", count: 318 },
  { bucket: "15–35%", label: "Festival blowout", count: 168 },
  { bucket: "35%+", label: "Clearance", count: 47 },
];

export const priceLadders = [
  { brand: "Coca-Cola", sizes: [
    { size: "330ml", price: 1.20, perMl: 3.64 },
    { size: "500ml", price: 1.65, perMl: 3.30 },
    { size: "1.5L",  price: 2.45, perMl: 1.63 },
    { size: "2L",    price: 3.10, perMl: 1.55 },
  ], integrity: "intact" as const },
  { brand: "Pepsi", sizes: [
    { size: "330ml", price: 1.10, perMl: 3.33 },
    { size: "500ml", price: 1.55, perMl: 3.10 },
    { size: "1.5L",  price: 2.65, perMl: 1.77 },  // disrupted
    { size: "2L",    price: 2.85, perMl: 1.43 },
  ], integrity: "disrupted" as const },
  { brand: "Milo", sizes: [
    { size: "200ml UHT", price: 0.95, perMl: 4.75 },
    { size: "500ml UHT", price: 2.40, perMl: 4.80 },  // disrupted
    { size: "1L UHT",    price: 4.35, perMl: 4.35 },
  ], integrity: "disrupted" as const },
  { brand: "Pocari Sweat", sizes: [
    { size: "350ml", price: 1.85, perMl: 5.29 },
    { size: "500ml", price: 2.30, perMl: 4.60 },
    { size: "900ml", price: 3.55, perMl: 3.94 },
  ], integrity: "intact" as const },
];
