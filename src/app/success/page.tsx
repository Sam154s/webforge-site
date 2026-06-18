import { Nav } from "@/components/sections/Nav";
import { Footer } from "@/components/sections/Footer";

export default function SuccessPage() {
  return (
    <>
      <Nav />
      <main className="min-h-svh bg-bg flex items-center px-8">
        <div className="max-w-2xl mx-auto py-32">

          <p className="font-display text-xs font-medium tracking-[0.2em] text-accent uppercase mb-8">
            Deposit received
          </p>

          <h1 className="font-display font-light text-4xl md:text-5xl text-text leading-tight mb-8">
            You&apos;re in. Let&apos;s build something worth sending.
          </h1>

          <div className="space-y-5 max-w-lg">
            <p className="font-sans text-text-sec text-base leading-relaxed">
              Your deposit is confirmed. Check your inbox - you should have a receipt
              and a welcome email from us shortly.
            </p>

            <p className="font-sans text-text-sec text-base leading-relaxed">
              Over the next few days I&apos;ll send you 3-4 short emails with questions
              about your business. They&apos;re not what you&apos;d normally expect -
              no brief forms, no dropdowns. Just a conversation that gets to the bottom
              of what makes your business worth choosing.
            </p>

            <p className="font-sans text-text-sec text-base leading-relaxed">
              If you&apos;d prefer all the questions in one go rather than spread out,
              just reply to the welcome email and say so.
            </p>
          </div>

          <div className="mt-16 pt-8 border-t border-border">
            <p className="font-sans text-sm text-text-muted">
              Questions before we start?{" "}
              <a
                href="mailto:hello@webforge.build"
                className="text-text-sec hover:text-text transition-colors duration-200"
              >
                hello@webforge.build
              </a>
            </p>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
