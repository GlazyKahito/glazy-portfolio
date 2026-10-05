import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/projects/ProjectDetail";
import { ContactFooter } from "@/components/scenes/Contact";
import { getAdjacentProjects, getProject, projects } from "@/data/projects";
import { profile } from "@/data/profile";
import { site } from "@/data/site";
import type { ImageAsset } from "@/lib/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.filter((p) => p.caseStudy !== false).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: `${project.title} — GLAZY`,
      description: project.description,
      type: "article",
      images: [{ url: project.image.src, width: project.image.width, height: project.image.height, alt: project.image.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} — GLAZY`,
      description: project.description,
      images: [project.image.src],
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project || project.caseStudy === false) notFound();

  const { prev, next } = getAdjacentProjects(slug);
  const gallery: ImageAsset[] = project.gallery ?? [];

  const url = `${site.url}/projects/${project.slug}`;
  const elsewhere = [project.live, project.github, project.demo].filter((u): u is string => !!u);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `${url}#work`,
        name: project.title,
        headline: project.tagline,
        description: project.description,
        // The case study is this work's page; the live site, the code and the demo are the work itself.
        url,
        mainEntityOfPage: url,
        ...(elsewhere.length ? { sameAs: elsewhere } : {}),
        image: `${site.url}${project.image.src}`,
        dateCreated: project.year,
        ...(project.updated ? { dateModified: project.updated } : {}),
        genre: project.category,
        keywords: project.technologies.join(", "),
        author: { "@type": "Person", name: profile.name, url: site.url },
        creator: { "@type": "Organization", "@id": `${site.url}/#organization`, name: site.name, url: site.url },
        publisher: { "@type": "Organization", "@id": `${site.url}/#organization`, name: site.name, url: site.url },
        isPartOf: { "@type": "WebSite", "@id": `${site.url}/#website`, name: site.name, url: site.url },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: site.name, item: site.url },
          { "@type": "ListItem", position: 2, name: "The work", item: `${site.url}/#projects` },
          { "@type": "ListItem", position: 3, name: project.title, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProjectDetail project={project} gallery={gallery} prev={prev} next={next} />
      <ContactFooter />
    </>
  );
}
