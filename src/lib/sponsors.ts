// Placeholder sponsor strip under the home slider: logos of well-known Kyrgyz companies from
// Wikimedia Commons, recoloured to one tone (public/sponsors/*.png, used as CSS masks).
// They are not actual sponsors: replace with real sponsors before publishing.
// ratio = width / height of the trimmed logo; scale evens out visual weight (square marks look small).
export const sponsors = [
  { name: "O!", logo: "/sponsors/o.png", ratio: 129 / 115, scale: 1.3 },
  { name: "Beeline", logo: "/sponsors/beeline.png", ratio: 823 / 160, scale: 1 },
  { name: "Optima Bank", logo: "/sponsors/optima.png", ratio: 528 / 89, scale: 0.9 },
  { name: "Bakai Bank", logo: "/sponsors/bakai.png", ratio: 763 / 160, scale: 1 },
  { name: "Aiyl Bank", logo: "/sponsors/aiyl.png", ratio: 889 / 160, scale: 0.9 },
  { name: "RSK Bank", logo: "/sponsors/rsk.png", ratio: 720 / 157, scale: 1 },
];
