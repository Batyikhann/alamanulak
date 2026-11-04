// Line icons for the footer's social links, drawn in the same style as the site's other icons (lucide: 24×24,
// 2px rounded strokes in the current colour). Lucide no longer ships brand icons, so these are simple outlines.

type IconProps = { size?: number };

const lineIcon = (size: number) => ({
  width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true,
});

// A speech bubble with a phone handset inside
export function WhatsappIcon({ size = 18 }: IconProps) {
  return (
    <svg {...lineIcon(size)}>
      <path d="M3 21l1.65-4.65A9 9 0 1 1 7.65 19.35Z" />
      <path d="M9.2 8.4c-.4.9 0 2.6 1.6 4.3 1.7 1.7 3.4 2.1 4.3 1.7l.7-1.3-1.8-1-.8.8c-.8-.3-1.8-1.3-2.1-2.1l.8-.8-1-1.8Z" />
    </svg>
  );
}

// A rounded square camera with its lens and flash
export function InstagramIcon({ size = 18 }: IconProps) {
  return (
    <svg {...lineIcon(size)}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <path d="M17.4 6.6h.01" />
    </svg>
  );
}

// The lowercase f
export function FacebookIcon({ size = 18 }: IconProps) {
  return (
    <svg {...lineIcon(size)}>
      <path d="M17 2.5h-2.5A4.5 4.5 0 0 0 10 7v3H7v4h3v7.5h4V14h3l1-4h-4V7a1 1 0 0 1 1-1h3Z" />
    </svg>
  );
}
