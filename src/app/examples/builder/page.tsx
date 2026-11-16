import type { Metadata } from "next";
import Demo from "../tools/builder/demo";

export const metadata: Metadata = {
  title: "Example: a room planner for a builder",
  description: "A working example for a fictional builder. The customer plans the room, and drawings, quantities and three priced options come back.",
  alternates: { canonical: "/examples/builder" },
};

// The full tool from our sales sandbox, for a fictional firm. Plain code throughout: no AI is called and nothing is sent.
export default function Page() {
  return <div className="sbx"><Demo /></div>;
}
