import { SceneDeck } from "@/components/scenes/SceneDeck";
import { profile } from "@/data/profile";
import { services } from "@/data/services";
import { site } from "@/data/site";

export default function HomePage() {
  const sameAs = profile.socials.filter((s) => s.href.startsWith("http")).map((s) => s.href);
  const organization = {
    "@type": "Organization",
    "@id": `${site.url}/#organization`,
    name: site.name,
    url: site.url,
    // A square logo (public/logo-512.png, drawn from the wordmark).
    logo: { "@type": "ImageObject", url: `${site.url}/logo-512.png`, width: 512, height: 512 },
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
  const website = {
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    url: site.url,
    name: site.name,
    alternateName: site.title,
    description: site.description,
    inLanguage: "en-IN",
    publisher: { "@id": `${site.url}/#organization` },
  };
  const jsonLd = { "@context": "https://schema.org", "@graph": [organization, website] };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SceneDeck />
    </>
  );
}
