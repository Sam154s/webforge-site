import type { Metadata } from "next";
import { EMAIL } from "@/lib/site";
import { validToken } from "@/lib/outreach";

export const metadata: Metadata = {
  title: "Unsubscribe",
  description: "Stop emails from Webflow Outreach.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/unsubscribe" },
};

const link = "text-signal underline underline-offset-4";

export default function Unsubscribe({ searchParams }: { searchParams: { t?: string; done?: string; failed?: string } }) {
  const token = searchParams.t;
  const mode = searchParams.done ? "done" : validToken(token) ? "confirm" : "manual";
  const manual = (
    <>
      Reply <strong>STOP</strong> to any email from us, or write to <a href={`mailto:${EMAIL}?subject=STOP`} className={link}>{EMAIL}</a>. We will take you off the list and will not contact you again.
    </>
  );
  return (
    <main className="pt-16">
      <section className="max-w-page mx-auto px-5 md:px-10 pt-10 md:pt-20 pb-24 md:pb-36">
        <h1 className="font-display font-extrabold tracking-[-0.045em] leading-[0.92] text-[13vw] md:text-[5.6vw] max-w-[16ch]">
          {mode === "done" ? "You are unsubscribed." : mode === "confirm" ? "You will not hear from us again." : "How to opt out."}
        </h1>
        <div className="mt-8 max-w-xl text-lg text-dim leading-relaxed space-y-6">
          {mode === "done" && <p>We have stopped emailing you. Nothing else is needed.</p>}
          {mode === "confirm" && (
            <>
              <p>Press the button and we will stop emailing you.</p>
              <form method="post" action={`/unsubscribe?t=${token}`}>
                <input type="hidden" name="confirm" value="1" />
                <button type="submit" autoFocus className="group inline-flex items-center gap-3 rounded-full bg-ink text-stone font-semibold pl-6 pr-2 py-2 min-h-[44px]">
                  Stop emails
                  <span aria-hidden className="grid place-items-center w-8 h-8 rounded-full bg-lime text-ink">→</span>
                </button>
              </form>
            </>
          )}
          {mode === "manual" && (
            <>
              {searchParams.failed && <p className="text-ink bg-lime inline-block px-2 py-1 rounded text-base" role="alert">That did not go through.</p>}
              <p>{manual}</p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
