import Image from "next/image";
import type { CSSProperties } from "react";
import { latticeCell, latticeGaps } from "@/lib/kerege";

// Decorative diamonds that close the last row of a кереге lattice, separately for the wide layout
// (desktopK per row) and the phone layout (2 per row). Each shows a spare site photo not already in
// the lattice, or a gold rosette once those run out. They are not clickable.

const sparePhotos = ["/images/argymak-stallion.jpg", "/images/yurt-interior.jpg", "/images/season-ulak.jpg", "/images/ulak-steppe-race.jpg", "/images/riders-sunset.jpg", "/images/yurt-flag.jpg", "/images/hero-horse.jpg"];

export default function KeregeFillers({ count, desktopK, usedPhotos }: { count: number; desktopK: number; usedPhotos: string[] }) {
  const spare = sparePhotos.filter((src) => !usedPhotos.includes(src));
  const layouts: ["desktop" | "mobile", number][] = [["desktop", desktopK], ["mobile", 2]];
  return <>
    {layouts.flatMap(([layout, k]) => Array.from({ length: latticeGaps(count, k) }, (_, gap) => {
      const cell = latticeCell(count + gap, k);
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
