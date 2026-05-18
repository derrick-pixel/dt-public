import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const base = "https://derrick-pixel.github.io/elitezshelf-frontage";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/solution",
    "/intelligence",
    "/intelligence/competitors",
    "/intelligence/pricing",
    "/intelligence/consumer",
    "/intelligence/culture-policy",
    "/intelligence/whitespace",
    "/pricing",
    "/about",
    "/demo",
  ];
  return paths.map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: p === "/" ? 1 : 0.8,
  }));
}
