// Demo portraits for players and federation members without a photo, until the admin uploads a real one.
// The same name always gets the same picture; women (by Kyrgyz/Russian surname or name ending) get a headscarf.
const men = 8;
const women = 3;

// FNV-1a with a final mix, so similar Cyrillic names still spread across the pictures.
function hash(value: string) {
  let sum = 2166136261;
  for (const char of value) sum = Math.imul(sum ^ char.charCodeAt(0), 16777619) >>> 0;
  sum = Math.imul(sum ^ (sum >>> 15), 2246822507) >>> 0;
  return (sum ^ (sum >>> 13)) >>> 0;
}

function isWoman(name: string) {
  const words = name.trim().toLowerCase().split(/\s+/);
  return words.some((word) => /(ова|ева|ина|гүл|гуль)$/.test(word));
}

export function demoPortrait(name: string) {
  const index = hash(name);
  return isWoman(name) ? `/images/portraits/woman-${(index % women) + 1}.svg` : `/images/portraits/man-${(index % men) + 1}.svg`;
}
