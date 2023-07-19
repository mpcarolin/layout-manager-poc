import React, { useRef } from "react";
import {
  closestCenter,
  rectIntersection,
  getFirstCollision,
  CollisionDetection,
  pointerWithin,
  UniqueIdentifier,
} from "@dnd-kit/core";

import { findPath as getFindPath, RowType } from "./helpers.ts";

export const useBasicSortableCollisionStrategy = () => closestCenter;

/**
 * Custom collision detection strategy optimized for multiple containers
 *
 * - First, find any droppable containers intersecting with the pointer.
 * - If there are none, find intersecting containers with the active draggable.
 * - If there are no intersecting containers, return the last matched intersection
 *
 * This is taken mostly verbatim from the dndkit multiple containers story, but made into
 * a custom hook and w/ some variables renamed for my own sanity
 */
export const useMultipleContainerCollisionDetectionStrategy = ({
  activeId,
  items,
  recentlyMovedToNewContainerRef
}: {
  activeId: string,
  items: RowType[],
  recentlyMovedToNewContainerRef: React.RefObject<boolean>
}): CollisionDetection => { 
  const lastOverIdRef = useRef<UniqueIdentifier | null>(null);

  const findPath = getFindPath(items);

  const rowIds = items.map(row => row.rowId);
  const columnIds = items.map(row => Object.keys(row.columns)).flat();
  const droppableIds = [ ...rowIds, ...columnIds ];

  const activePath = findPath(activeId);

  return React.useCallback(
    (args) => {
      if (activeId && (droppableIds.includes(activeId))) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) => droppableIds.includes(container.id)
          ),
        });
      }

      // Start by finding any intersecting droppable
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? // If there are droppables intersecting with the pointer, return those
            pointerIntersections
              : rectIntersection(args);
              let overId = getFirstCollision(intersections, 'id');

              const overPath = findPath(overId);

              if (overId != null) {
                if (droppableIds.includes(overId)) {

                  const containerItems = overPath.isRowMove
                    ? [ ...Object.values(overPath.row.columns) ].flat()
                    : overPath.isColumnMove
                      ? overPath.column
                      : [];
                      

                  // If a container is matched and it contains items (columns 'A', 'B', 'C')
                  if (containerItems.length > 0) {
                    // Return the closest droppable within that container
                    overId = closestCenter({
                      ...args,
                      droppableContainers: args.droppableContainers.filter(
                        (container) =>
                          container.id !== overId &&
                          containerItems.includes(container.id)
                      ),
                    })[0]?.id;
                  }
                }

                lastOverIdRef.current = overId;

                return [{id: overId}];
              }

              // When a draggable item moves to a new container, the layout may shift
              // and the `overId` may become `null`. We manually set the cached `lastOverId`
              // to the id of the draggable item that was moved to the new container, otherwise
              // the previous `overId` will be returned which can cause items to incorrectly shift positions
              if (recentlyMovedToNewContainerRef.current) {
                lastOverIdRef.current = activeId;
              }

              // If no droppable is matched, return the last match
              return lastOverIdRef.current ? [{id: lastOverIdRef.current}] : [];
    },
    [ activeId, lastOverIdRef, recentlyMovedToNewContainerRef, droppableIds, findPath ]
  ) };


