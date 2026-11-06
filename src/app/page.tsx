import { ContactForm } from "./contact-form";

const RUNS = [9, 8.5, 9, 9.5, 8, 9, 9, 8.5, 9, 9.5];
const mean = (RUNS.reduce((a, b) => a + b, 0) / RUNS.length).toFixed(1);

const CONTRAST = [
  ["Everyone prompts it their own way.", "One way of doing the job, written down and built in."],
  ["The output changes from one go to the next.", "Tested on your real examples until it comes out right every time."],
  ["The know-how leaves when the person does.", "It lives in the tool, so a new starter gets the same result on day one."],
  ["A consultant builds one automation and leaves.", "You get the framework too, so your team can build the next tool."],
];

const TOOLS = [
  { sector: "Architects", name: "Concept visualiser", input: "Hand sketch, site photos, client brief", output: "Three design directions drawn in your practice's style", check: "Partner picks one" },
  { sector: "Estate agents", name: "Listing and photo-tour builder", input: "Photos, floor plan, viewing notes", output: "Listing copy and a captioned room-by-room tour in house style", check: "Branch manager approves" },
  { sector: "Trades", name: "Quote writer", input: "Site notes, measurements, photos", output: "Itemised quote in your format, priced from your rates", check: "Owner signs it off" },
  { sector: "Clinics and practices", name: "Letter drafter", input: "Appointment notes, template letters", output: "Correctly formatted letters ready to check and send", check: "Clinician reviews" },
  { sector: "Any office", name: "Inbox sorter", input: "Shared inbox", output: "Every email labelled, routed and drafted a reply", check: "Team clears the drafts" },
];

const STEPS = [
  ["Map the work", "A 30-minute call, then a short look at how the work really gets done. We list the jobs that repeat every week and pick the ones worth a tool."],
  ["Build on your examples", "Each tool is built in Claude around your documents, your templates and your past work, so it sounds like you and follows your rules."],
  ["Test it to a standard", "We run every tool ten times against real examples and score each run. It has to average 8 out of 10 before your team relies on it."],
  ["Hand it over", "Your team gets the tools, a one-page guide for each, and the framework we use to make them. We train whoever will run them."],
  ["Measure and extend", "A results page shows how each tool is being used and what it saves. When a new job comes up, you build the tool, or we do."],
];

const PRICES = [
  ["First call", "Free", "30 minutes. We look at your work and tell you honestly whether tools would help."],
  ["First toolkit", "£900 to £3,000", "Fixed price, agreed in writing before we start. Usually two to four tools, plus training."],
  ["Support, if you want it", "£300 to £500 a month", "Re-testing, improvements and new tools. Rolling monthly."],
  ["AI usage", "At cost", "Runs on your own Claude account, so you see every penny."],
];

const FAQ = [
  ["Do we need Claude?", "We build on Claude because it's the most dependable for this kind of work. A Claude Team plan is usually enough. The method works with other AI models if you already use one."],
  ["Who owns the tools?", "You do. They live in your accounts, written in plain files your team can read and change."],
  ["What if the person who runs them leaves?", "That's the point of building it this way. The method is in the tool, not in someone's head, and the guide shows the next person how to use it."],
  ["Is this just automation?", "No. Automation moves data from A to B. These tools do the skilled part of a job, in your style, with a person checking the result where it matters."],
  ["What happens to our data?", "It stays in your systems and your AI account. We only see what you choose to share while we build."],
];

function Rule({ n, title }: { n: string; title: string }) {
  return (
    <div className="flex items-baseline gap-4 border-t border-ink pt-3 mb-12">
      <span className="font-mono text-xs text-oxide">{n}</span>
      <span className="font-mono text-xs text-graphite">{title}</span>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <header className="max-w-page mx-auto px-5 md:px-8 py-6 flex items-center justify-between">
        <a href="/" className="font-serif text-2xl tracking-tight">WebForge</a>
        <nav className="flex items-center gap-6 text-sm">
          <a href="#how" className="hidden md:inline text-graphite hover:text-ink">How it works</a>
          <a href="#tools" className="hidden md:inline text-graphite hover:text-ink">Tools</a>
          <a href="#pricing" className="hidden md:inline text-graphite hover:text-ink">Pricing</a>
          <a href="#contact" className="bg-ink text-sheet px-4 py-2 hover:bg-oxide transition-colors">Book a call</a>
        </nav>
      </header>

      <main>
        {/* Hero: the claim on the left, the evidence on the right */}
        <section className="max-w-page mx-auto px-5 md:px-8 pt-10 md:pt-20 pb-20 md:pb-28 grid md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-12 md:gap-16 items-end">
          <div>
            <h1 className="rise font-serif text-[2.6rem] leading-[1.04] md:text-[4.4rem] tracking-[-0.02em]" style={{ animationDelay: "60ms" }}>
              AI tools your team owns, that do the job <em className="text-oxide">the same way</em> every time.
            </h1>
            <p className="rise mt-8 text-lg md:text-xl leading-relaxed text-graphite max-w-xl" style={{ animationDelay: "220ms" }}>
              We design custom tools and workflows for Claude, built on your own examples and tested until they&apos;re
              consistent. Your team runs them. When you need a new one, you can build it yourselves.
            </p>
            <div className="rise mt-10 flex flex-wrap items-center gap-6" style={{ animationDelay: "360ms" }}>
              <a href="#contact" className="bg-oxide text-sheet px-6 py-3.5 hover:bg-oxide-deep transition-colors">Book a 30-minute call</a>
              <a href="#how" className="underline underline-offset-4 decoration-rule hover:decoration-ink">See how it works</a>
            </div>
          </div>

          <figure className="rise bg-sheet border border-rule p-5 md:p-6" style={{ animationDelay: "420ms" }} aria-label={`Example: one tool run ten times, average ${mean} out of 10`}>
            <div className="flex justify-between font-mono text-[11px] text-graphite">
              <span>TOOL / quote-writer v3</span><span>example</span>
            </div>
            <p className="mt-3 font-serif text-xl">Same site notes. Ten runs.</p>
            <ol className="mt-5 space-y-1.5">
              {RUNS.map((s, i) => (
                <li key={i} className="grid grid-cols-[2.2rem_1fr_2.4rem] items-center gap-3 font-mono text-xs num">
                  <span className="text-graphite">{String(i + 1).padStart(2, "0")}</span>
                  <span className="h-1.5 bg-paper relative">
                    <span className={`bar-fill absolute inset-y-0 left-0 ${s >= 8 ? "bg-ink" : "bg-oxide"}`} style={{ width: `${s * 10}%`, animationDelay: `${700 + i * 70}ms` }} />
                    <span className="absolute inset-y-[-3px] w-0.5 -ml-px bg-oxide" style={{ left: "80%" }} aria-hidden />
                  </span>
                  <span className="text-right">{s.toFixed(1)}</span>
                </li>
              ))}
            </ol>
            <figcaption className="mt-5 pt-4 border-t border-rule flex justify-between font-mono text-xs num">
              <span>average {mean} / 10</span><span className="text-oxide">orange line = pass mark 8</span>
            </figcaption>
          </figure>
        </section>

        {/* Why: prompting is not a system */}
        <section className="bg-sheet border-y border-rule">
          <div className="max-w-page mx-auto px-5 md:px-8 py-20 md:py-28">
            <Rule n="01" title="Why" />
            <div className="grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-12">
              <h2 className="font-serif text-3xl md:text-5xl leading-[1.08] tracking-[-0.015em]">
                A chat window isn&apos;t a system.
              </h2>
              <div>
                <p className="text-lg leading-relaxed text-graphite mb-10 max-w-xl">
                  Most teams have tried AI. Results depend on who&apos;s typing and how they feel that day, so nobody quite
                  trusts it with real work. The fix isn&apos;t a cleverer prompt. It&apos;s a proper tool.
                </p>
                <div className="grid grid-cols-2 text-sm md:text-base">
                  <div className="font-mono text-xs text-graphite pb-3">AI as most teams use it</div>
                  <div className="font-mono text-xs text-oxide pb-3 pl-5">A WebForge tool</div>
                  {CONTRAST.map(([before, after]) => (
                    <div key={before} className="contents">
                      <p className="border-t border-rule py-4 pr-5 text-graphite">{before}</p>
                      <p className="border-t border-l border-rule py-4 pl-5">{after}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What we build: catalogue entries */}
        <section id="tools" className="max-w-page mx-auto px-5 md:px-8 py-20 md:py-28">
          <Rule n="02" title="What we build" />
          <div className="grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-12 mb-14">
            <h2 className="font-serif text-3xl md:text-5xl leading-[1.08] tracking-[-0.015em]">Tools for the work only your business does.</h2>
            <p className="text-lg leading-relaxed text-graphite max-w-xl md:pt-2">
              Each tool takes something your team already has, and turns it into something they&apos;d otherwise spend an
              hour making. A person checks the result where it matters. These are examples; yours are built around your work.
            </p>
          </div>
          <div className="border-t border-ink">
            {TOOLS.map((t, i) => (
              <article key={t.name} className="grid md:grid-cols-[3rem_minmax(0,3fr)_minmax(0,4fr)_minmax(0,4fr)_minmax(0,2fr)] gap-x-6 gap-y-2 py-6 border-b border-rule items-baseline">
                <span className="font-mono text-xs text-oxide num">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="font-serif text-xl">{t.name}</p>
                  <p className="font-mono text-[11px] text-graphite mt-1">{t.sector}</p>
                </div>
                <p className="text-sm"><span className="font-mono text-[11px] text-graphite block mb-1">In</span>{t.input}</p>
                <p className="text-sm"><span className="font-mono text-[11px] text-graphite block mb-1">Out</span>{t.output}</p>
                <p className="text-sm"><span className="font-mono text-[11px] text-graphite block mb-1">Checked by</span>{t.check}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 font-mono text-xs text-graphite">Built on Claude first. Works with any capable AI model.</p>
        </section>

        {/* How it works */}
        <section id="how" className="bg-ink text-sheet">
          <div className="max-w-page mx-auto px-5 md:px-8 py-20 md:py-28">
            <div className="flex items-baseline gap-4 border-t border-sheet/40 pt-3 mb-12">
              <span className="font-mono text-xs text-[#E07A4F]">03</span>
              <span className="font-mono text-xs text-sheet/60">How it works</span>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl leading-[1.08] tracking-[-0.015em] max-w-3xl mb-16">
              We build the first tools with you. Then you have the means to make your own.
            </h2>
            <ol className="grid md:grid-cols-5 gap-px bg-sheet/15">
              {STEPS.map(([title, body], i) => (
                <li key={title} className="bg-ink p-0 md:pr-6 pb-10 md:pb-0">
                  <span className="font-mono text-xs text-[#E07A4F] num">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="font-serif text-xl mt-3 mb-3">{title}</h3>
                  <p className="text-sm leading-relaxed text-sheet/70">{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Results page */}
        <section className="max-w-page mx-auto px-5 md:px-8 py-20 md:py-28 grid md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] gap-12 items-start">
          <div>
            <Rule n="04" title="Proof, not promises" />
            <h2 className="font-serif text-3xl md:text-4xl leading-[1.1] tracking-[-0.015em] mb-6">You can see it working.</h2>
            <p className="text-graphite leading-relaxed mb-5">
              Every client gets a results page: what each tool does, its latest test scores, how often it&apos;s used and
              what it&apos;s worth, shown as a range so nobody is overselling.
            </p>
            <p className="text-graphite leading-relaxed">Built by the team behind Vernus, AI admin software for NHS general practice.</p>
          </div>
          <figure>
            <img src="/dashboard-example.png" alt="Example results page for a fictional plumbing business, showing value added by each tool" className="w-full border border-ink" loading="lazy" />
            <figcaption className="mt-3 font-mono text-[11px] text-graphite">Example page for a fictional business. Figures are illustrative.</figcaption>
          </figure>
        </section>

        {/* Pricing + FAQ */}
        <section id="pricing" className="bg-sheet border-y border-rule">
          <div className="max-w-page mx-auto px-5 md:px-8 py-20 md:py-28">
            <Rule n="05" title="Pricing" />
            <h2 className="font-serif text-3xl md:text-5xl leading-[1.08] tracking-[-0.015em] mb-12">Fixed prices. No day rates.</h2>
            <div className="border-t border-ink mb-20">
              {PRICES.map(([what, price, note]) => (
                <div key={what} className="grid md:grid-cols-[minmax(0,3fr)_minmax(0,3fr)_minmax(0,6fr)] gap-x-8 gap-y-1 py-5 border-b border-rule items-baseline">
                  <p className="text-sm text-graphite">{what}</p>
                  <p className="font-serif text-2xl num">{price}</p>
                  <p className="text-sm text-graphite leading-relaxed">{note}</p>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-x-16 gap-y-10">
              {FAQ.map(([q, a]) => (
                <div key={q}>
                  <h3 className="font-serif text-xl mb-2">{q}</h3>
                  <p className="text-graphite leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="max-w-page mx-auto px-5 md:px-8 py-20 md:py-28 grid md:grid-cols-2 gap-14">
          <div>
            <Rule n="06" title="Contact" />
            <h2 className="font-serif text-4xl md:text-6xl leading-[1.02] tracking-[-0.02em] mb-6">What do you do every week that you wish you didn&apos;t?</h2>
            <p className="text-graphite leading-relaxed max-w-md">
              Tell us in a few lines. We&apos;ll reply within two working days to book a 30-minute call, and if tools
              won&apos;t help, we&apos;ll say so.
            </p>
          </div>
          <ContactForm />
        </section>
      </main>

      <footer className="border-t border-rule">
        <div className="max-w-page mx-auto px-5 md:px-8 py-8 flex flex-wrap gap-4 justify-between font-mono text-xs text-graphite">
          <span>© WebForge 2026</span>
          <a href="mailto:sam@webflowoutreach.com" className="hover:text-ink">sam@webflowoutreach.com</a>
        </div>
      </footer>
    </>
  );
}
