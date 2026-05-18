export type Whitespace = {
  id: string;
  category: string;
  retailer: string;
  cluster: string;
  incumbent: string;
  challenger: string;
  weeklyPrize: number;
  rationale: string;
};

export const whitespaceCells: Whitespace[] = [
  {
    id: "ws-01",
    category: "Halal premium chocolate",
    retailer: "NTUC FairPrice",
    cluster: "Tampines / Pasir Ris",
    incumbent: "Top-3 brands at 4.2% share",
    challenger: "Beryl's / KitKat Halal Variants",
    weeklyPrize: 18000,
    rationale: "Top-3 SOS 4.2% vs SG average 11.7%. Halal-certified mid-premium gap visible across 14 outlets.",
  },
  {
    id: "ws-02",
    category: "Low-sugar isotonic (Grade A)",
    retailer: "Sheng Siong",
    cluster: "Heartland (Yishun, Bedok, Hougang)",
    incumbent: "Pocari Sweat (2 facings)",
    challenger: "100Plus Reduced Sugar / Aquarius",
    weeklyPrize: 12500,
    rationale: "Category +18% YoY. Only 2 facings vs 6+ for Grade C alternatives. Nutri-Grade tailwind.",
  },
  {
    id: "ws-03",
    category: "Korean ready-meals",
    retailer: "Don Don Donki",
    cluster: "Orchard, Clarke Quay, Jewel",
    incumbent: "47 SKUs, only 2 from local distributor",
    challenger: "SG-importer Korean RTE brand",
    weeklyPrize: 9800,
    rationale: "Donki shopper indexes 2.1× SG average for K-food. Local distributor whitespace at distributor margin.",
  },
  {
    id: "ws-04",
    category: "Refill home-care formats",
    retailer: "Cold Storage",
    cluster: "CBD (Suntec, Marina, Raffles)",
    incumbent: "Refill SOS 6%",
    challenger: "Method / Kao Attack refill packs",
    weeklyPrize: 14200,
    rationale: "Sustainability shopper index +34. Premium CBD shoppers paying for eco-positioning. Shelf hasn't caught up.",
  },
  {
    id: "ws-05",
    category: "Hispanic snacks",
    retailer: "Mustafa",
    cluster: "Little India",
    incumbent: "Generic imports",
    challenger: "Doritos / Takis",
    weeklyPrize: 4800,
    rationale: "Mustafa over-indexes for novel snacks. Underserved expat segment.",
  },
  {
    id: "ws-06",
    category: "Plant-based dairy",
    retailer: "FairPrice Finest",
    cluster: "Bukit Timah / Holland Village",
    incumbent: "Oatside, Oatly (combined 38% facings)",
    challenger: "Local SG plant-milk SME",
    weeklyPrize: 7600,
    rationale: "Affluent shopper, sustainability-led. Two-brand duopoly leaves 22% facings to small private labels.",
  },
];

// Coverage map - synthetic SG district coverage dots
export const coverageDots = [
  { district: "Tampines", x: 78, y: 48, visits: 24, retailers: ["NTUC", "Giant", "Sheng Siong", "Prime"] },
  { district: "Bedok", x: 70, y: 56, visits: 22, retailers: ["NTUC", "Sheng Siong", "Cold Storage"] },
  { district: "Pasir Ris", x: 86, y: 38, visits: 14, retailers: ["NTUC", "Giant"] },
  { district: "Hougang", x: 62, y: 42, visits: 20, retailers: ["NTUC", "Sheng Siong"] },
  { district: "Punggol", x: 78, y: 28, visits: 16, retailers: ["NTUC", "Giant"] },
  { district: "Sengkang", x: 70, y: 32, visits: 18, retailers: ["NTUC", "Sheng Siong"] },
  { district: "Yishun", x: 52, y: 24, visits: 19, retailers: ["NTUC", "Sheng Siong"] },
  { district: "Woodlands", x: 36, y: 18, visits: 17, retailers: ["NTUC", "Sheng Siong"] },
  { district: "Choa Chu Kang", x: 26, y: 36, visits: 15, retailers: ["NTUC", "Sheng Siong"] },
  { district: "Bukit Batok", x: 32, y: 44, visits: 12, retailers: ["NTUC", "Sheng Siong"] },
  { district: "Jurong East", x: 22, y: 50, visits: 21, retailers: ["NTUC", "Giant", "Sheng Siong"] },
  { district: "Clementi", x: 30, y: 60, visits: 16, retailers: ["NTUC", "Cold Storage"] },
  { district: "Bukit Timah", x: 40, y: 52, visits: 13, retailers: ["Cold Storage", "FairPrice Finest"] },
  { district: "Holland V", x: 40, y: 62, visits: 11, retailers: ["Cold Storage"] },
  { district: "Orchard", x: 50, y: 64, visits: 23, retailers: ["Donki", "Cold Storage", "FairPrice Finest"] },
  { district: "CBD", x: 56, y: 72, visits: 18, retailers: ["Cold Storage", "NTUC"] },
  { district: "Toa Payoh", x: 52, y: 50, visits: 16, retailers: ["NTUC", "Sheng Siong"] },
  { district: "Bishan", x: 50, y: 42, visits: 14, retailers: ["NTUC", "Cold Storage"] },
  { district: "AMK", x: 56, y: 38, visits: 19, retailers: ["NTUC", "Sheng Siong", "Giant"] },
  { district: "Serangoon", x: 60, y: 50, visits: 15, retailers: ["NTUC", "Cold Storage"] },
  { district: "Geylang", x: 60, y: 64, visits: 12, retailers: ["NTUC", "Sheng Siong"] },
  { district: "Marine Parade", x: 64, y: 70, visits: 10, retailers: ["NTUC", "Cold Storage"] },
  { district: "Little India", x: 52, y: 60, visits: 8, retailers: ["Mustafa"] },
];
