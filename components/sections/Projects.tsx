import { ProjectShowcase } from "@/components/projects/ProjectShowcase";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { projects } from "@/data/projects";

export function Projects() {
  return (
    <section id="projects" className="relative scroll-mt-24 pt-24 md:pt-32" aria-labelledby="projects-title">
      <div className="container-x">
        <div className="mx-auto max-w-[1500px]">
          <SectionHeading
            index="01"
            label={`Projects — ${String(projects.length).padStart(2, "0")}`}
            title="Selected work, built to be inspected."
            accent={["inspected."]}
            description="Every project below is live or open source. Scroll to turn the wheel; open one for the problem, the approach, the architecture and the links."
          />
        </div>
      </div>
      <div className="container-x mt-12 lg:mt-0 lg:px-0">
        <ProjectShowcase />
      </div>
    </section>
  );
}
