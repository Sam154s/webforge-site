import type { Metadata } from "next";
import Demo from "../tools/architect/demo";

export const metadata: Metadata = {
  title: "Example: a 3D designer for an architect",
  description: "A working example for a fictional architect. The customer shapes the house, and the drawings, planning guide and fee proposal follow.",
  alternates: { canonical: "/examples/architect" },
};

// The full tool from our sales sandbox, for a fictional firm. Plain code throughout: no AI is called and nothing is sent.
export default function Page() {
  return <div className="sbx"><Demo /></div>;
}
