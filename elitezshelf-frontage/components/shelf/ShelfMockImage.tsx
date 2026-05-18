import { cn } from "@/lib/utils";

type Slot = { hue: number; w: number; sat?: number; l?: number; tag?: string };

const shelves: Slot[][] = [
  [
    { hue: 4,  w: 1.0, sat: 78, l: 48, tag: "Coca-Cola" },
    { hue: 4,  w: 1.0, sat: 78, l: 48 },
    { hue: 4,  w: 1.0, sat: 78, l: 48 },
    { hue: 215, w: 1.1, sat: 78, l: 42, tag: "Pepsi" },
    { hue: 215, w: 1.1, sat: 78, l: 42 },
    { hue: 30, w: 0.8, sat: 70, l: 50, tag: "Yeo's" },
    { hue: 30, w: 0.8, sat: 70, l: 50 },
    { hue: 130, w: 0.9, sat: 55, l: 38, tag: "100Plus" },
    { hue: 130, w: 0.9, sat: 55, l: 38 },
    { hue: 200, w: 0.9, sat: 65, l: 55, tag: "Pocari" },
  ],
  [
    { hue: 350, w: 0.9, sat: 70, l: 52, tag: "Magnum" },
    { hue: 350, w: 0.9, sat: 70, l: 52 },
    { hue: 60, w: 1.1, sat: 65, l: 58, tag: "Lays" },
    { hue: 60, w: 1.1, sat: 65, l: 58 },
    { hue: 60, w: 1.1, sat: 65, l: 58 },
    { hue: 18, w: 0.8, sat: 85, l: 50, tag: "Cheetos" },
    { hue: 18, w: 0.8, sat: 85, l: 50 },
    { hue: 270, w: 0.7, sat: 50, l: 45 },
    { hue: 270, w: 0.7, sat: 50, l: 45 },
    { hue: 0, w: 0.6, sat: 12, l: 80, tag: "OOS" },
  ],
  [
    { hue: 28, w: 1.0, sat: 80, l: 48, tag: "KitKat" },
    { hue: 28, w: 1.0, sat: 80, l: 48 },
    { hue: 28, w: 1.0, sat: 80, l: 48 },
    { hue: 38, w: 0.9, sat: 75, l: 45, tag: "Twix" },
    { hue: 320, w: 0.7, sat: 65, l: 50, tag: "Cadbury" },
    { hue: 320, w: 0.7, sat: 65, l: 50 },
    { hue: 220, w: 0.9, sat: 55, l: 40, tag: "Hershey" },
    { hue: 220, w: 0.9, sat: 55, l: 40 },
    { hue: 100, w: 0.8, sat: 50, l: 50, tag: "Beryl's" },
    { hue: 100, w: 0.8, sat: 50, l: 50 },
  ],
];

export function ShelfMockImage({ className }: Readonly<{ className?: string }>) {
  return (
    <div className={cn("relative h-full w-full bg-gradient-to-b from-[#1a1f2c] via-[#0f131c] to-[#0a0d14]", className)}>
      {/* aisle floor perspective lines */}
      <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute inset-0 flex flex-col gap-[2.5%] px-[3%] py-[6%]">
        {shelves.map((row, ri) => (
          <div
            key={ri}
            className="relative flex flex-1 items-end gap-1 rounded-md bg-[#101521]/40 px-1 ring-1 ring-white/5"
          >
            {/* shelf-edge price strip */}
            <div className="absolute inset-x-0 -bottom-[5px] h-[6px] rounded bg-white/85" />
            {row.map((s, si) => (
              <div
                key={si}
                className="relative flex-shrink-0 rounded-sm shadow-[inset_0_-8px_24px_rgba(0,0,0,0.35)]"
                style={{
                  height: "82%",
                  width: `${(s.w * 100) / 12}%`,
                  background: `linear-gradient(180deg, hsl(${s.hue} ${s.sat ?? 60}% ${(s.l ?? 50) + 12}%) 0%, hsl(${s.hue} ${s.sat ?? 60}% ${s.l ?? 50}%) 50%, hsl(${s.hue} ${(s.sat ?? 60) - 10}% ${(s.l ?? 50) - 10}%) 100%)`,
                }}
              >
                {/* label band */}
                <div className="absolute inset-x-1 top-[28%] h-[18%] rounded-sm bg-white/85 mix-blend-screen opacity-70" />
                <div className="absolute inset-x-1 top-[52%] h-[8%] rounded-sm bg-black/30" />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.55)_100%)]" />
    </div>
  );
}
