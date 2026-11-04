import Image from "next/image";
import type { CSSProperties } from "react";
import { latticeCell, latticeGaps } from "@/lib/kerege";

// Decorative diamonds that close the last row of a кереге lattice, separately for the wide layout
// (desktopK per row) and the phone layout (2 per row). Each shows a spare site photo not already in
// the lattice, or a gold rosette once those run out. They are not clickable. With `total`, they also fill
// the lattice up to that many places, so a short set still shows its full shape. `desktopOrder` lists the
// wide layout's places in the order they are filled (photos first, then fillers); `mobileCount` and
// `mobileTotal` give phones their own number of photos and places, so a lattice keeps a balanced shape on both.

// Not the horse market's photos: those belong to the bazaar.
const sparePhotos = ["/images/yurt-interior.jpg", "/images/season-ulak.jpg", "/images/ulak-steppe-race.jpg", "/images/riders-sunset.jpg", "/images/yurt-flag.jpg"];

export default function KeregeFillers({ count, desktopK, usedPhotos, total = 0, desktopOrder, mobileCount = count, mobileTotal }: { count: number; desktopK: number; usedPhotos: string[]; total?: number; desktopOrder?: number[]; mobileCount?: number; mobileTotal?: number }) {
  const spare = sparePhotos.filter((src) => !usedPhotos.includes(src));
  const layouts: ["desktop" | "mobile", number][] = [["desktop", desktopK], ["mobile", 2]];
  const gaps = (layout: "desktop" | "mobile", k: number) => layout === "mobile" && mobileTotal !== undefined
    ? Math.max(mobileTotal - mobileCount, 0)
    : Math.max(total - count, latticeGaps(count, k));
  return <>
    {layouts.flatMap(([layout, k]) => Array.from({ length: gaps(layout, k) }, (_, gap) => {
      const first = layout === "mobile" ? mobileCount : count;
      const place = layout === "desktop" && desktopOrder ? desktopOrder[count + gap] ?? count + gap : first + gap;
      const cell = latticeCell(place, k);
      const photo = spare[gap];
      const position = layout === "desktop"
        ? { "--dc": cell.col, "--dr": cell.row }
        : { "--dc": cell.col, "--dr": cell.row, "--mc": cell.col, "--mr": cell.row };
      return (
        <span key={`${layout}-${gap}`} className={`kerege-cell kerege-filler is-${layout}`} style={position as CSSProperties} aria-hidden="true">
          <span className={`kerege-photo${photo ? "" : " is-ornament"}`}>{photo && <Image src={photo} alt="" width={800} height={800} unoptimized />}</span>
        </span>
      );
    }))}
  </>;
}
