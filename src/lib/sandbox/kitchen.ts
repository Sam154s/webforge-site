// A cut-down kitchen take-off for the homepage example: a galley plan measured and priced from a small price book.
// Example rates and rules for a fictional firm. The full planner in the sales sandbox prices every item on the plan.
import { tidy } from "./journey";

export type Finish = "good" | "better" | "best";
export const FINISHES: Finish[] = ["good", "better", "best"];
export const BOOK: Record<Finish, { name: string; unit: number; worktop: number; floor: number }> = {
  good: { name: "Good", unit: 420, worktop: 160, floor: 48 },
  better: { name: "Better", unit: 520, worktop: 340, floor: 72 },
  best: { name: "Best", unit: 690, worktop: 520, floor: 110 },
};
export const RULE = { module: 600, aisle: 1000 };        // mm: unit width and depth, and the least clear floor between two runs
export const LIMIT = { length: [2400, 5400], width: [1800, 3600] } as const;
const FIT = 185, SPLASH = 95, SKIP = 320, SERVICES = 1850; // fitting per unit, splashback per m2, skip, electrics and plumbing

export function kitchen(length: number, width: number) {
  const perRun = Math.floor(length / RULE.module);
  const runs = width - 2 * RULE.module >= RULE.aisle ? 2 : 1;
  const aisle = width - runs * RULE.module;
  const units = perRun * runs;
  const worktop = (units * RULE.module) / 1000;
  const floor = (length * width) / 1e6;
  const splash = worktop * 0.6;
  const price = (f: Finish) => {
    const b = BOOK[f];
    return tidy((units * (b.unit + FIT) + worktop * b.worktop + floor * b.floor * 1.1 + splash * SPLASH + SKIP + SERVICES) * 1.05 * 1.2);
  };
  return { perRun, runs, aisle, units, worktop, floor, splash, price };
}
