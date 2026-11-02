// The кереге (yurt lattice wall) photo layout shared by the federation archive and the media page.

// Diamond lattice placement: rows alternate k and k - 1 cells, odd rows shifted by half a cell,
// each diamond spanning 2 columns and 2 half-height rows so neighbours interlock like a кереге.
export function latticeCell(index: number, k: number) {
  let row = 0;
  let rest = index;
  while (rest >= (row % 2 ? k - 1 : k)) {
    rest -= row % 2 ? k - 1 : k;
    row += 1;
  }
  return { col: (row % 2 ? 2 : 1) + rest * 2, row: row + 1 };
}

// Diamonds per full row on wide screens: enough for two rows of a small set, up to `max`.
export function latticeWidth(count: number, max = 4) {
  return Math.min(max, Math.max(2, Math.ceil((count + 1) / 2)));
}

// Empty places left in the last lattice row, so it can be closed with ornament diamonds.
export function latticeGaps(count: number, k: number) {
  if (!count) return 0;
  const last = latticeCell(count - 1, k);
  const rowSize = last.row % 2 ? k : k - 1;
  const used = (last.col - (last.row % 2 ? 1 : 2)) / 2 + 1;
  return rowSize - used;
}
