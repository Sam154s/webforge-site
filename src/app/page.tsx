import { Nav } from "@/components/sections/Nav";
import { Hero } from "@/components/sections/Hero";
import { Problem } from "@/components/sections/Problem";
import { Process } from "@/components/sections/Process";
import { Work } from "@/components/sections/Work";
import { Testimonial } from "@/components/sections/Testimonial";
import { Packages } from "@/components/sections/Packages";
import { CTA } from "@/components/sections/CTA";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <Process />
        <Work />
        <Testimonial />
        <Packages />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
