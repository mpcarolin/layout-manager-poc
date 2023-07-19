import React, { useEffect, useState, useRef, SyntheticEvent } from "react";
import {
  DndContext,
  MeasuringStrategy,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

// section
import { useSortable, arrayMove, } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { nanoid } from "nanoid";
import { useMultipleContainerCollisionDetectionStrategy } from "./collisionDetectionStrategies.ts";
import { Column } from "./Column.tsx";
import { Grabber } from "./Grabber.tsx";

interface DragEvent {
  active: any
  over: any
}

interface Columns {
  [columnKey: string]: string[]
}


const useColumns = () => {
  const columnA = nanoid(3);
  const columnB = nanoid(3);

  const generateItemId = (columnId: string) => `${columnId}:${nanoid(3)}`

  /**
   *
   * State
   *
   */
  const [ columns, setColumns ] = useState<Columns>({
    [columnA]: [ columnA, columnA, columnA ].map(generateItemId),
    [columnB]: [ columnB, columnB, columnB ].map(generateItemId),
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const recentlyMovedToNewContainerRef = useRef(false);
  const columnNames = new Set<string | undefined>(Object.keys(columns));
  const isSortingContainer = activeId ? columnNames.has(activeId) : false;

  /**
   *
   * Hook private helpers 
   *
   */
  // find column with the id, or the column containing the item with id
  const findContainingColumn = (id: string): string | undefined => {
    // if the id is referring to a column then just return that column id
    if (id in columns) {
      return id;
    }


    // if the id is referring to a item, then find the column with that item
    return Object
      .keys(columns)
      .find(key => columns[key].includes(id));
  };

  /**
   *
   * LIFECYCLE FUNCTIONS
   *
   */
  const handleDragStart = ({ active }: DragEvent) => {
    setActiveId(active.id);
  }

  // Callback that runs when user lets go of mouse button after dragging
  // a draggable somewhere. By the time this runs, both active and over should
  // either be items in the same column, or over is not an item at all.
  //
  // This callback is really only meaningful when moving elements within the
  // same column. You can replace this with an empty function, and the POC
  // will still work for moving items between columns, but it will bug out 
  // when moving an item within the same column.
  const handleDragEnd = ({active, over}: DragEvent) => {
    // find the column in which the active element currently resides
    const activeColumnId = findContainingColumn(active.id);

    // if either columns do not exist, then just short circuit out
    if (!activeColumnId)
      return setActiveId(null);

    const overId = over?.id;

    if (overId == null)
      return setActiveId(null);

    const overContainer = findContainingColumn(overId);

    // If both columns exist, and the destination is a new index for the active item,
    // then swap those two items.
    if (overContainer) {
      const activeIndex = columns[activeColumnId].indexOf(active.id);
      const overIndex = columns[overContainer].indexOf(overId);

      if (activeIndex !== overIndex) {
        setColumns(columns => ({
          ...columns,
          [overContainer]: arrayMove(
            columns[overContainer],
            activeIndex,
            overIndex
          ),
        }));
      }
    }

    setActiveId(null);
  }


  // Callback that runs as the user is dragging a draggable over another element
  // tracked by the dnd context. This actually updates the state so that 
  // the active element resides in the "over" container while dragging.
  //
  // This is only meaningful when moving elements to a different column. If you replace
  // this with an empty function, the POC will work fine for moving items within the 
  // same column, btu bug out when moving to a different one.
  const handleDragOver = ({ active, over }: DragEvent) => {
    const overId = over?.id;

    if (overId == null || active.id in columns) {
      return;
    }

    const overColumn = findContainingColumn(overId);
    const activeColumn = findContainingColumn(active.id);

    if (!overColumn || !activeColumn) {
      return;
    }

    if (activeColumn !== overColumn) {
      setColumns((columns) => {
        const activeItems = columns[activeColumn];
        const overItems = columns[overColumn];
        const overIndex = overItems.indexOf(overId);
        const activeIndex = activeItems.indexOf(active.id);

        let newIndex: number;

        if (overId in columns) { // if moving over to a new column without a specific spot
          newIndex = overItems.length + 1;
        } else {
          // determine the right index depending on if active is above or below the over item
          const isBelowOverItem =
            over &&
            active.rect.current.translated &&
            active.rect.current.translated.top > over.rect.top + over.rect.height;

          const modifier = isBelowOverItem ? 1 : 0;

          newIndex =
            overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
        }

        recentlyMovedToNewContainerRef.current = true;

        return {
          ...columns,
          // remove the item from its previous container
          [activeColumn]: columns[activeColumn].filter(item => item && item !== active.id),
          // in the new column, place the moved item to the right index
          [overColumn]: [
            ...columns[overColumn].slice(0, newIndex),
            columns[activeColumn][activeIndex],
            ...columns[overColumn].slice(newIndex, columns[overColumn].length),
          ],
        };
      });
    }
  }

  /**
   *
   * Public Helpers
   *
   */
  const addColumn = () => {
    const nextColumnId = nanoid(3);

    setColumns(columns => ({
      ...columns,
      [nextColumnId]: []
    }))
  }

  const removeColumn = (id: string) => () => setColumns(columns => {
    const { [id]: removedColumn, ...remainingColumns } = columns;
    return remainingColumns;
  });

  const addItem = (columnId: string) => () => {
    setColumns(columns => ({
      ...columns,
      [columnId]: [
        ...columns[columnId],
        `${columnId}:${nanoid(4)}`
      ],
    }))
  }

  const removeItem = (columnId: string) => (itemId: string) => (event: SyntheticEvent) => {
    setColumns(columns => ({
      ...columns,
      [columnId]: columns[columnId].filter(id => id !== itemId)
    }));
  }

  return {
    columns,
    columnNames,
    setColumns,

    // lifecycles
    handleDragStart,
    handleDragEnd,
    handleDragOver,

    // public helpers
    addColumn,
    removeColumn,
    addItem,
    removeItem,

    activeId,
    recentlyMovedToNewContainerRef,
    isSortingContainer,
  }
}


export const Row = ({
  id,
  columns,

  onRemoveClick,
  onAddColumn,
  onRemoveColumn,
  onAddItem,
  onRemoveItem,
}) => {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id });


  const style = {
    backgroundColor: "tan",
    border: "solid 1px black",
    padding: 5,
    margin: 5,
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <button onClick={onAddColumn}>+ Column</button>
      <button onClick={onRemoveClick}>X</button>
      <Grabber title="Move Row" {...listeners} />
        <div style={{ display: "flex", flexDirection: "row" }}>
          {
            Object.entries(columns).map(([ name, items ]) => (
              <Column
                onRemoveClick={onRemoveColumn?.(name)}
                onAddItem={onAddItem?.(name)}
                onRemoveItem={onRemoveItem?.(name)}
                items={items}
                name={name}
                key={name}
              />
            ))
          }
        </div>
    </div>
  )
}


