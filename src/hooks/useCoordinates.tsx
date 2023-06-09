import React from "react";


export function* getNextGridCoordinate(numColumns: number, rowCount: number = 1): IterableIterator<[number, number]> {
  let x = 0;
  let y = 0;
  while (y < rowCount) {
    yield [ x, y ];
    if (x < (numColumns - 1)) {
      x++;
    } else {
      x = 0;
      y++;
    }
  }
}

export const useCoordinates = (numColumns: number): { next: () => [number, number] } => {
  const iterator = React.useMemo(() => getNextGridCoordinate(numColumns), [ numColumns ]);
  const next = React.useCallback(() => iterator.next().value, [ iterator ]);
  return {
    next
  }
}

