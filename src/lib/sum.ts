// The process cost sum. The same sum is used by the "yours" page in the ops sandbox, so the two always agree.
//   hours a year   = people x hours a week each x 46
//   cost by hand   = hours a year x loaded hourly cost
//   saving         = 40% to 70% of the cost by hand
//   payback months = build price / (low saving / 12), rounded up
export const WEEKS = 46;
export const RATE = 25;
export const CUT: [number, number] = [0.4, 0.7];

export type Sum = { hoursYear: number; byHand: number; low: number; high: number; payback: number | null };

export function processCost(people: number, hoursEach: number, rate: number = RATE, buildPrice: number = 12000): Sum {
  const hoursYear = people * hoursEach * WEEKS;
  const byHand = hoursYear * rate;
  const low = byHand * CUT[0];
  const high = byHand * CUT[1];
  return { hoursYear, byHand, low, high, payback: low > 0 ? Math.ceil(buildPrice / (low / 12)) : null };
}

export const gbp = (n: number) => "£" + Math.round(n).toLocaleString("en-GB");
export const num = (n: number) => Math.round(n).toLocaleString("en-GB");

// The example used on the homepage, the pricing page and the sample report: one weekly report at a firm of 100 people.
export const EXAMPLE = { people: 6, hoursEach: 5 };
