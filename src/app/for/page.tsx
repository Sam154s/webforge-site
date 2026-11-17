import type { Metadata } from "next";
import Link from "next/link";
import { CodeForm } from "./code-form";
import { EMAIL } from "@/lib/site";
import { SITUATIONS } from "@/lib/situations";

export const metadata: Metadata = {
  title: "Open your page",
  description: "Enter the code from our letter to open the page we wrote for your company.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/for" },
};

// The quiet place to type a code from a printed letter. The private page shows the right situation for the code,
// whichever address it is opened at, so any of the five will do as the destination.
export default function ForIndex() {
  return (
    <main className="sb sub">
      <section className="sub-hero">
        <div className="wrap">
          <p className="slate"><span>From a letter</span></p>
          <h1 className="h1">Had a letter from us? <span>Type the code.</span></h1>
          <p className="lede">It opens the page we wrote for your company. The code is on the letter, in four groups of four.</p>
          <CodeForm to={`/for/${SITUATIONS[0].key}`} />
          <p className="fine">No code, or it will not open? Email <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. To stop hearing from us, reply &ldquo;stop&rdquo; or email us, and we will not contact you again. <Link href="/privacy#contacted">How we hold your company&rsquo;s details</Link>.</p>
        </div>
      </section>
    </main>
  );
}
