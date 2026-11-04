import { cookies } from "next/headers";
import { orderCookie } from "@/lib/shuffle";

// The visitor's order seed (see lib/shuffle.ts): the one saved for this browser session, or a new one on the first
// page of a visit (the page then saves it).
export async function getOrderSeed() {
  const saved = Number((await cookies()).get(orderCookie)?.value);
  return Number.isInteger(saved) && saved > 0 && saved < 2 ** 32 ? saved : 1 + Math.floor(Math.random() * (2 ** 32 - 1));
}
