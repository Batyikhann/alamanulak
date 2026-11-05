import Image from "next/image";
import { ArrowRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

// A bazaar card (a horse or a piece of equipment), built like a shop's: the photo on top, then the breed or type, the
// name, a few facts, and the price as the button. The whole offer is on the item's own page, at `href`.

export type MarketFact = { icon: LucideIcon; text: string };

export default function MarketCard({ image, tag, title, facts, price, moreLabel, href }: {
  image: string;
  tag: string;
  title: string;
  facts: MarketFact[];
  price: string;
  moreLabel: string;
  href: string;
}) {
  // The photo, the name and the button all open the item
  const opener = (className: string, label: string | undefined, children: ReactNode, hidden = false) =>
    <a className={className} href={href} aria-label={label} {...(hidden ? { tabIndex: -1, "aria-hidden": true } : {})}>{children}</a>;
  return (
    <article className="card market-card">
      {opener("market-card-photo", undefined, image ? <Image src={image} alt="" width={720} height={540} unoptimized /> : <span className="horse-video-blank" />, true)}
      <div className="market-card-body">
        <p className="market-card-tag">{tag}</p>
        <h3>{opener("market-card-name", undefined, title)}</h3>
        <ul className="market-card-facts">
          {facts.map(({ icon: Icon, text }) => <li key={text}><Icon size={14} aria-hidden="true" />{text}</li>)}
        </ul>
        {opener("button button-accent market-card-more", `${title}: ${price}. ${moreLabel}`, <>{price}<ArrowRight size={15} aria-hidden="true" /></>)}
      </div>
    </article>
  );
}
