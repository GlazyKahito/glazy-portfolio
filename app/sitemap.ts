import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";
import { site } from "@/data/site";

/** Stable dates from the content itself (never the time of the request), so crawlers see real changes only. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, lastModified: site.updated, changeFrequency: "monthly", priority: 1 },
    ...projects
      .filter((p) => p.caseStudy !== false)
      .map((p) => ({
        url: `${site.url}/projects/${p.slug}`,
        lastModified: p.updated ?? site.updated,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
  ];
}
