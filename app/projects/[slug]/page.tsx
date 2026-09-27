import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/projects/ProjectDetail";
import { Contact } from "@/components/sections/Contact";
import { getAdjacentProjects, getProject, projects } from "@/data/projects";
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    url: project.live ?? project.github,
    dateCreated: project.year,
    author: { "@type": "Person", name: "Krutik Mhatre" },
    keywords: project.technologies.join(", "),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProjectDetail project={project} gallery={gallery} prev={prev} next={next} />
      <Contact compact />
    </>
  );
}
