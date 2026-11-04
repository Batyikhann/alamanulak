// Each visitor's own order for the bazaar, media and players lists: shuffled from a number kept for the browser
// session (a cookie without an expiry date), so every new visit sees them in a new order while it stays the same
// from page to page, and the server and the browser arrange them alike.

export const orderCookie = "au-order";

// Mulberry32: small, seeded random numbers in [0, 1)
function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fisher–Yates with the seeded numbers: the same seed always gives the same order.
export function shuffled<T>(list: readonly T[], seed: number): T[] {
  const random = seededRandom(seed);
  const result = [...list];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}
