import type { Metadata } from "next";
import { Cta } from "@/components/track-link";
import { EMAIL } from "@/lib/site";

// ASSUMED widget contract (from workflow-builder/kit/web/shell.js and build.mjs). Correct it here, in one place:
//   script:  /tools/estimator/w.js, loaded with defer (the kit builds widget.js; the coordinator drops it in as w.js)
//   element: <wf-tool> with no attributes; the tool's config is baked into the bundle
//   height:  the kit's own page gives wf-tool display:block and min-height 585px, or 470px from 640px wide, so the same is reserved below
//   fallback: children of <wf-tool> are not slotted by the widget, so they show only until it loads, or if it never does
const SCRIPT = "/tools/estimator/w.js";
const TAG = "wf-tool";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "wf-tool": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { class?: string };
    }
  }
}

export const metadata: Metadata = {
  title: "What would it cost?",
  description: "A quick price guide for a job in your business. A few plain questions, a rough range in pounds, nothing to sign.",
  alternates: { canonical: "/estimate" },
  openGraph: { title: "What would it cost? | Webflow Outreach", url: "/estimate" },
};

export default function EstimatePage() {
  const Tool = TAG as "wf-tool";
  return (
    <main className="pt-16">
      <section className="max-w-page mx-auto px-5 md:px-10 pt-10 md:pt-20 pb-24 md:pb-36 grid md:grid-cols-12 gap-10 md:gap-14">
        <div className="md:col-span-5">
          <h1 className="font-display font-extrabold tracking-[-0.045em] leading-[0.92] text-[13vw] md:text-[5.6vw]">
            What would it cost?
          </h1>
          <p className="mt-6 text-lg text-dim leading-relaxed max-w-md">
            Answer a few plain questions about a job you would like fixed. You get a rough range in pounds straight away.
          </p>
          <dl className="mt-10 space-y-6 text-[15px]">
            <div><dt className="font-semibold">What it is</dt><dd className="text-dim mt-1">A guide, so you know the scale before you talk to anyone. Nothing to sign and no sales call.</dd></div>
            <div><dt className="font-semibold">What it is not</dt><dd className="text-dim mt-1">Not a quote. A real price is fixed and agreed in writing, after the free diagnostic has looked at your own numbers.</dd></div>
          </dl>
          <div className="mt-10 space-y-4">
            <Cta where="estimate-side">Book a free diagnostic</Cta>
            <p className="text-sm text-dim">Or email <a href={`mailto:${EMAIL}`} className="text-signal underline underline-offset-4">{EMAIL}</a></p>
          </div>
        </div>

        <div className="md:col-span-7 md:col-start-6">
          <div className="rounded-[24px] border border-ink p-6 md:p-10">
            {/* React 18 passes `class` (not className) through to custom elements */}
            <Tool class="block min-h-[585px] sm:min-h-[470px]">
              <p className="text-dim leading-relaxed">
                The estimator needs JavaScript, and it has not loaded. You can get a proper number from the{" "}
                <a href="/diagnostic" className="text-signal underline underline-offset-4">free diagnostic</a>{" "}
                instead, or email <a href={`mailto:${EMAIL}`} className="text-signal underline underline-offset-4">{EMAIL}</a>.
              </p>
            </Tool>
          </div>
        </div>
      </section>
      <script src={SCRIPT} defer />
    </main>
  );
}
