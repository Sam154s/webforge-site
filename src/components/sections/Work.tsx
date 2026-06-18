import { FadeUp } from "@/components/ui/FadeUp";

export function Work() {
  return (
    <section className="px-8 py-32 border-t border-border">
      <div className="max-w-5xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-8 md:gap-16 items-start mb-16">
          <FadeUp>
            <span className="font-display font-light text-5xl text-text-muted select-none">
              03
            </span>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h2 className="font-display font-light text-3xl md:text-4xl text-text leading-tight">
              The work.
            </h2>
          </FadeUp>
        </div>

        {/* Work grid — offset layout */}
        <FadeUp delay={0.15}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Placeholder 1 — large */}
            <div className="aspect-[4/3] bg-surface-el border border-border flex items-end p-6">
              <div>
                <p className="font-display text-sm font-medium text-text-sec tracking-wide uppercase mb-1">
                  Coming soon
                </p>
                <p className="font-sans text-xs text-text-muted">
                  Client work will appear here
                </p>
              </div>
            </div>

            {/* Placeholder 2 — offset */}
            <div className="flex flex-col gap-4 md:mt-12">
              <div className="aspect-[4/3] bg-surface-el border border-border flex items-end p-6">
                <div>
                  <p className="font-display text-sm font-medium text-text-sec tracking-wide uppercase mb-1">
                    Coming soon
                  </p>
                  <p className="font-sans text-xs text-text-muted">
                    Client work will appear here
                  </p>
                </div>
              </div>
            </div>

          </div>
        </FadeUp>

      </div>
    </section>
  );
}
