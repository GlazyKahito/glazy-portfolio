import { SceneDeck } from "@/components/scenes/SceneDeck";
import { profile } from "@/data/profile";
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SceneDeck />
    </>
  );
}
