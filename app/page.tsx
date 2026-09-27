import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { InProgress } from "@/components/sections/InProgress";
import { About } from "@/components/sections/About";
import { TechStack } from "@/components/sections/TechStack";
import { Contact } from "@/components/sections/Contact";
import { Marquee } from "@/components/ui/Marquee";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { site } from "@/data/site";

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    alternateName: profile.alias,
    url: site.url,
    email: `mailto:${profile.email}`,
    jobTitle: "Full-stack developer",
    address: { "@type": "PostalAddress", addressLocality: "Mumbai", addressRegion: "Maharashtra", addressCountry: "IN" },
    sameAs: profile.socials.filter((s) => s.href.startsWith("http")).map((s) => s.href),
    alumniOf: profile.education.map((e) => ({ "@type": "CollegeOrUniversity", name: e.institution })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <Marquee items={[...projects.map((p) => p.title), ...profile.roles]} />
      <Projects />
      <InProgress />
      <About />
      <TechStack />
      <Contact />
    </>
  );
}
