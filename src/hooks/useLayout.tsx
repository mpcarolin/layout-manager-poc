import React from "react";
import { useCoordinates } from "./useCoordinates.tsx";

export interface LayoutItem {
  id: string,
  width?: number
  height?: number
}

export const useLayout = (data: LayoutItem[], numColumns: number) => {
  const { next } = useCoordinates(numColumns);
  return React.useMemo(() => data.map(({ id, width, height }) => {
    const [ x, y ] = next();
    return {
      x, y,
      i: id,
      w: width ?? 1,
      h: height ?? 1
    }
  }), [ next, data ]);
}

