import { COMPANY, companyLine } from "@/lib/company";

export function DraftBanner() {
  return (
    <div className="bg-lime text-ink" role="note">
      <p className="max-w-page mx-auto px-5 md:px-10 py-2.5 text-sm font-semibold">
        Draft, not yet reviewed. Items in [SQUARE BRACKETS] are facts still to be supplied or confirmed.
      </p>
    </div>
  );
}

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <main className="pt-16">
      <DraftBanner />
      <article className="max-w-page mx-auto px-5 md:px-10 pt-10 md:pt-16 pb-24 md:pb-36 grid md:grid-cols-12 gap-10">
        <header className="md:col-span-4 md:self-start md:sticky md:top-24">
          <h1 className="font-display font-extrabold tracking-[-0.045em] leading-[0.92] text-[13vw] md:text-[5vw]">{title}</h1>
          <p className="mt-4 text-sm text-dim">Draft of {updated}</p>
        </header>
        <div className="md:col-span-7 md:col-start-6 text-[17px] leading-relaxed space-y-5 [&_h2]:font-display [&_h2]:font-bold [&_h2]:text-2xl [&_h2]:tracking-[-0.02em] [&_h2]:pt-8 [&_h2]:border-t [&_h2]:border-line [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_a]:text-signal [&_a]:underline [&_a]:underline-offset-4 [&_.ph]:font-mono [&_.ph]:text-[.85em] [&_.ph]:bg-lime [&_.ph]:px-1 [&_.ph]:rounded-sm">
          {children}
        </div>
      </article>
    </main>
  );
}

// A visible placeholder for a legal fact Sam must supply.
export const Ph = ({ children }: { children: React.ReactNode }) => <span className="ph">{children}</span>;
// Renders whichever company facts exist; with none set, a neutral phrase.
export const Co = () => <>{companyLine(COMPANY) || "our registered company details"}</>;
