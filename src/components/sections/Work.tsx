import { FadeUp } from "@/components/ui/FadeUp";
import { TextReveal } from "@/components/ui/TextReveal";

const projects = [
  {
    title: "Spranki",
    category: "Interactive music platform",
    image: "/spranki-homepage-full.png",
    alt: "Spranki homepage",
  },
  {
    title: "Coming soon",
    category: "In progress",
    image: null,
    alt: "",
  },
];

export function Work() {
  return (
    <section className="relative px-8 py-32 border-t border-border overflow-hidden">

      {/* Ghost number */}
      <span
        className="absolute right-0 top-0 font-display font-light text-text select-none pointer-events-none leading-none"
        style={{ fontSize: "clamp(8rem, 22vw, 20rem)", opacity: 0.035 }}
        aria-hidden="true"
      >
        03
      </span>

      <div className="max-w-5xl mx-auto mb-12">
        <FadeUp>
          <span className="inline-block font-sans text-xs text-text-muted tracking-[0.18em] uppercase border border-border px-3 py-1 mb-6">
            Section 03
          </span>
        </FadeUp>
        <TextReveal delay={0.1}>
          <h2 className="font-display font-light text-3xl md:text-4xl text-text leading-tight">
            The work.
          </h2>
        </TextReveal>
      </div>

      {/* Horizontal scroll gallery — bleeds to viewport edge */}
      <FadeUp delay={0.2}>
        <div
          className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pb-4 -mx-8 px-8"
          style={{ cursor: "grab" }}
        >
          {projects.map((project) => (
            <div
              key={project.title}
              className="flex-none snap-start group relative overflow-hidden border border-border transition-all duration-500 hover:border-accent"
              style={{ width: "min(340px, 80vw)", height: "460px" }}
            >
              {project.image ? (
                <>
                  <div className="h-full overflow-y-scroll scrollbar-hide">
                    <img
                      src={project.image}
                      alt={project.alt}
                      className="w-full block"
                    />
                  </div>
                  {/* Hover accent overlay */}
                  <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />
                </>
              ) : (
                <div className="h-full flex items-center justify-center bg-surface">
                  <p className="font-display text-sm text-text-muted tracking-[0.18em] uppercase">
                    More coming
                  </p>
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
                <p className="font-display text-sm font-medium text-white tracking-wide uppercase mb-1">
                  {project.title}
                </p>
                <p className="font-sans text-xs text-white/60">
                  {project.category}
                </p>
              </div>
            </div>
          ))}
        </div>
      </FadeUp>
    </section>
  );
}
