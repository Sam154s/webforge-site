import { BuilderScene } from "./builder-scene";
import { ContactForm } from "./contact-form";
import { Reveal } from "./reveal";

const BUILDER = [
  ["Your rules and examples", "How your business does things, taken from real documents you already have."],
  ["A kit of ordinary tools", "Read and write spreadsheets, make PDFs, send email, talk to the software you use."],
  ["A tester", "Every new workflow runs against your examples before it's switched on."],
  ["A one-page guide", "So anyone on the team can ask it for the next workflow."],
];
const WORKFLOWS = [
  ["Run without AI", "Plain code. Nothing guesses, nothing drifts."],
  ["Same input, same output", "Run it once or ten thousand times."],
  ["Nothing per run", "Hosting costs pennies. There's no AI bill per use."],
  ["Yours to read and keep", "Ordinary files in your accounts, not a black box."],
];
const WEEKS = [
  ["Week 1", "We map the work", "A call and a look at real examples. We list the jobs that repeat and pick the first ones."],
  ["Weeks 2 to 3", "We set up your builder", "In your Claude account, with your rules, your tools and a tester. We build your first workflows with it."],
  ["Week 4", "You take the wheel", "Your team builds a workflow themselves while we watch. Then it's yours."],
  ["After that", "We stay if you want", "Monthly checks, new tools for the kit, and workflows we build for you when you'd rather not."],
];
const PRICES = [
  ["Discovery call", "Free", "30 minutes. If a builder won't help, we'll tell you."],
  ["Your builder and first two workflows", "£5,000", "Fixed price, four weeks, training included."],
  ["Extra workflow, built by us", "£1,000", "Each. Scoped and agreed before we start."],
  ["Support and AI consulting", "From £1,000 a month", "Depends on the work: re-testing, new tools, advice on where AI fits next. Rolling monthly."],
  ["Workflows your team builds", "£0", "That's the point."],
  ["Running costs", "Cost of coordination", "Hosting and AI usage passed on at cost, on your own accounts, plus the time to coordinate them. Agreed up front."],
];

export default function Home() {
  return (
    <>
      <Reveal />
      <header className="fixed top-0 inset-x-0 z-40 bg-stone/85 backdrop-blur-md">
        <div className="max-w-page mx-auto px-5 md:px-10 h-16 flex items-center justify-between">
          <a href="/" className="font-display font-bold text-lg tracking-[-0.02em]">webflow outreach</a>
          <nav className="flex items-center gap-7 text-sm">
            <a href="#builder" className="hidden md:inline text-dim hover:text-ink transition-colors">The builder</a>
            <a href="#how" className="hidden md:inline text-dim hover:text-ink transition-colors">How it works</a>
            <a href="#pricing" className="hidden md:inline text-dim hover:text-ink transition-colors">Pricing</a>
            <a href="#contact" className="group flex items-center gap-2 bg-ink text-stone rounded-full pl-4 pr-1.5 py-1.5">
              Book a call <span className="grid place-items-center w-6 h-6 rounded-full bg-lime text-ink transition-transform duration-300 group-hover:translate-x-0.5">→</span>
            </a>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative min-h-[100svh] overflow-hidden pt-16">
          <span aria-hidden className="drift absolute left-[-2vw] bottom-[-4vw] font-display font-black narrow leading-none tracking-[-0.06em] text-[38vw] md:text-[30vw] text-ink/[0.06] select-none pointer-events-none">
            flow
          </span>
          <div className="relative max-w-page mx-auto px-5 md:px-10 pt-10 md:pt-14 grid md:grid-cols-12 gap-8">
            <p className="fade md:col-start-9 md:col-span-4 text-sm leading-relaxed text-dim md:text-right" style={{ animationDelay: ".9s" }}>
              For UK businesses that want AI to do real work, reliably, without a consultant on speed dial.
            </p>
            <h1 className="md:col-start-4 md:col-span-9 font-display font-extrabold tracking-[-0.045em] leading-[0.9] text-[15vw] md:text-[8.6vw] md:text-right">
              <span className="mask"><span style={{ animationDelay: ".05s" }}>AI builds it</span></span>
              <span className="mask"><span style={{ animationDelay: ".17s" }}>once.</span></span>
              <span className="mask"><span style={{ animationDelay: ".29s" }} className="font-medium">Plain code</span></span>
              <span className="mask"><span style={{ animationDelay: ".41s" }} className="font-medium">runs it forever.</span></span>
            </h1>
          </div>

          <div className="relative max-w-page mx-auto px-5 md:px-10 mt-10 md:-mt-[17vw] pb-14 grid md:grid-cols-12 gap-6 items-end">
            <div className="pop md:col-span-4 lg:col-span-3 bg-lime rounded-[20px] p-6 flex flex-col gap-5 min-h-[19rem]" style={{ animationDelay: ".6s" }}>
              <p className="font-display font-bold text-lg tracking-[-0.01em]">webflow outreach</p>
              <p className="text-[15px] leading-snug">
                We set up an AI workflow builder inside your business. Describe a problem and it builds a workflow in
                ordinary code, which then runs on its own.
              </p>
              <p className="text-[15px] font-semibold leading-snug">Same result every time. Nothing per run. Code you own.</p>
              <a href="#contact" className="mt-auto inline-flex items-center gap-2 font-semibold">Book a free call <span aria-hidden>→</span></a>
            </div>
            <div className="fade md:col-start-9 md:col-span-4 flex md:justify-end items-end gap-10 text-sm" style={{ animationDelay: "1.1s" }}>
              <a href="#builder" className="flex items-center gap-3 group">
                <span className="grid place-items-center w-11 h-11 rounded-full bg-ink text-stone transition-transform duration-500 ease-out group-hover:translate-y-1">↓</span>
                See how it works
              </a>
            </div>
          </div>
        </section>

        {/* THE SCROLL STORY */}
        <BuilderScene />

        {/* WHAT WE PROVIDE: the builder makes the workflows */}
        <section className="max-w-page mx-auto px-5 md:px-10 py-24 md:py-40">
          <h2 className="reveal font-display font-extrabold tracking-[-0.045em] leading-[0.92] text-[11vw] md:text-[6.4vw] max-w-[14ch]">
            One builder. <span className="font-medium text-dim">Every workflow after that.</span>
          </h2>
          <div className="mt-16 md:mt-24 grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-6 md:gap-10 items-stretch">
            <div className="reveal rounded-[24px] bg-ink text-stone p-7 md:p-10">
              <p className="font-mono text-xs text-lime">what we set up</p>
              <h3 className="font-display font-bold text-4xl md:text-5xl tracking-[-0.03em] mt-3 mb-10">The builder</h3>
              <dl className="space-y-6">
                {BUILDER.map(([t, d]) => (
                  <div key={t} className="border-t border-white/15 pt-4">
                    <dt className="font-semibold text-lg">{t}</dt>
                    <dd className="text-stone/65 mt-1">{d}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="reveal flex md:flex-col items-center justify-center gap-3 font-mono text-xs text-dim" style={{ transitionDelay: ".15s" }}>
              <span className="hidden md:block w-px h-24 bg-line" />
              <span className="grid place-items-center w-16 h-16 rounded-full bg-lime text-ink text-xl rotate-90 md:rotate-0">→</span>
              makes
              <span className="hidden md:block w-px h-24 bg-line" />
            </div>
            <div className="reveal rounded-[24px] border border-ink p-7 md:p-10" style={{ transitionDelay: ".3s" }}>
              <p className="font-mono text-xs text-dim">what you get, again and again</p>
              <h3 className="font-display font-bold text-4xl md:text-5xl tracking-[-0.03em] mt-3 mb-10">Workflows</h3>
              <dl className="space-y-6">
                {WORKFLOWS.map(([t, d]) => (
                  <div key={t} className="border-t border-line pt-4">
                    <dt className="font-semibold text-lg">{t}</dt>
                    <dd className="text-dim mt-1">{d}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <p className="reveal mt-10 max-w-2xl text-lg text-dim leading-relaxed">
            To start, we build the workflows for you. The difference is that every one we build makes your builder
            better, and your team can make the next one without us.
          </p>
        </section>

        {/* WHY NO AI AT RUN TIME */}
        <section className="max-w-page mx-auto px-5 md:px-10 pb-24 md:pb-40 grid md:grid-cols-12 gap-10">
          <p className="reveal md:col-span-5 font-display font-bold tracking-[-0.035em] leading-[0.95] text-5xl md:text-7xl">
            Why keep AI out of the running?
          </p>
          <div className="md:col-span-6 md:col-start-7 space-y-8 text-lg md:text-xl leading-relaxed">
            <p className="reveal">
              AI is brilliant at working out <em>what</em> needs doing. It&apos;s a poor thing to rely on for doing the
              same job identically ten thousand times. It can phrase things differently, miss a step, or cost money every run.
            </p>
            <p className="reveal">
              So we use it where it&apos;s strongest: designing the workflow, once, checked against your examples. What
              runs every day is ordinary code. <span className="bg-lime px-1">Predictable, cheap, and yours.</span>
            </p>
          </div>
        </section>

        {/* HOW WE PROVIDE IT */}
        <section id="how" className="bg-ink text-stone rounded-t-[36px] md:rounded-t-[56px]">
          <div className="max-w-page mx-auto px-5 md:px-10 py-24 md:py-36">
            <h2 className="reveal font-display font-extrabold tracking-[-0.045em] leading-[0.92] text-[11vw] md:text-[6vw] max-w-[16ch]">
              Four weeks to your own builder.
            </h2>
            <ol className="mt-16 md:mt-24 grid md:grid-cols-4 border-t border-white/15">
              {WEEKS.map(([when, what, detail], i) => (
                <li key={when} className={`reveal border-b md:border-b-0 border-white/15 py-8 md:pt-8 md:pb-0 md:pr-8 ${i ? "md:pl-8 md:border-l" : ""}`} style={{ transitionDelay: `${i * 0.12}s` }}>
                  <p className="font-mono text-xs text-lime">{when}</p>
                  <h3 className="font-display font-bold text-2xl md:text-3xl tracking-[-0.02em] mt-4 mb-4">{what}</h3>
                  <p className="text-stone/65 leading-relaxed">{detail}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* PRICING */}
          <div id="pricing" className="max-w-page mx-auto px-5 md:px-10 pb-24 md:pb-36">
            <div className="grid md:grid-cols-12 gap-10 items-end mb-14">
              <h2 className="reveal md:col-span-7 font-display font-extrabold tracking-[-0.045em] leading-[0.92] text-[11vw] md:text-[6vw]">
                What it costs.
              </h2>
              <p className="reveal md:col-span-4 md:col-start-9 text-stone/65 leading-relaxed">
                Fixed prices, agreed in writing before any work starts. No day rates, no surprises.
              </p>
            </div>
            <div className="border-t border-white/15">
              {PRICES.map(([what, price, note], i) => (
                <div key={what} className="reveal grid grid-cols-[1fr_auto] md:grid-cols-12 gap-x-6 gap-y-1 py-6 border-b border-white/15 items-baseline" style={{ transitionDelay: `${i * 0.06}s` }}>
                  <p className="md:col-span-4 text-lg">{what}</p>
                  <p className={`md:col-span-3 font-display font-bold tracking-[-0.02em] num ${price.length > 8 ? "text-xl md:text-2xl leading-tight text-right md:text-left" : "text-3xl md:text-4xl"} ${price === "£0" ? "text-lime" : ""}`}>{price}</p>
                  <p className="col-span-2 md:col-span-5 text-stone/60 leading-relaxed">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="bg-ink text-stone">
          <div className="max-w-page mx-auto px-5 md:px-10 pb-20 md:pb-32 grid md:grid-cols-12 gap-12">
            <div className="md:col-span-6">
              <h2 className="reveal font-display font-extrabold tracking-[-0.045em] leading-[0.9] text-[13vw] md:text-[6.4vw]">
                What do you do every week <span className="text-lime">that a workflow could?</span>
              </h2>
            </div>
            <div className="reveal md:col-span-5 md:col-start-8 md:pt-4">
              <p className="text-stone/65 leading-relaxed mb-8">
                A few lines is plenty. We reply within two working days to book a free 30-minute call. Built by the team
                behind Vernus, AI admin software for NHS general practice.
              </p>
              <ContactForm />
            </div>
          </div>
          <footer className="max-w-page mx-auto px-5 md:px-10 py-8 border-t border-white/15 flex flex-wrap justify-between gap-4 text-sm text-stone/50">
            <span>© Webflow Outreach 2026</span>
            <a href="mailto:sam@webflowoutreach.com" className="hover:text-stone">sam@webflowoutreach.com</a>
          </footer>
        </section>
      </main>
    </>
  );
}
