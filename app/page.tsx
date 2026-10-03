import { SceneDeck } from "@/components/scenes/SceneDeck";
import { profile } from "@/data/profile";
import { services } from "@/data/services";
import { site } from "@/data/site";

export default function HomePage() {
  const sameAs = profile.socials.filter((s) => s.href.startsWith("http")).map((s) => s.href);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    description: site.description,
    email: `mailto:${profile.email}`,
    foundingDate: site.founded,
    address: { "@type": "PostalAddress", addressLocality: "Mumbai", addressRegion: "Maharashtra", addressCountry: "IN" },
    sameAs,
    founder: {
      "@type": "Person",
      name: profile.name,
      jobTitle: "Founder",
      sameAs,
      alumniOf: profile.education.map((e) => ({ "@type": "CollegeOrUniversity", name: e.institution })),
    },
    makesOffer: services.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s.title, description: s.body } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SceneDeck />
    </>
  );
}
