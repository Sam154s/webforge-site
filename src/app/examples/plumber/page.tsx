import type { Metadata } from "next";
import Demo from "../tools/plumber/demo";

export const metadata: Metadata = {
  title: "Example: a boiler fault finder and heating planner",
  description: "A working example for a fictional plumbing and heating firm. A fault finder that orders the part and books the engineer, and a heating planner.",
  alternates: { canonical: "/examples/plumber" },
};

// The full tool from our sales sandbox, for a fictional firm. Plain code throughout: no AI is called and nothing is sent.
export default function Page() {
  return <div className="sbx"><Demo /></div>;
}
