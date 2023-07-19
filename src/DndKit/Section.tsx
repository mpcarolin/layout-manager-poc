import React, { useState, useRef } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  MeasuringStrategy,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable, arrayMove, } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMultipleContainerCollisionDetectionStrategy } from "./collisionDetectionStrategies.ts";
import { Row } from "./Row.tsx";
import { Grabber } from "./Grabber.tsx";
import {
  generateColumn,
  generateRow,
  generateItemId,
  findPath as getFindPath
} from "./helpers.ts";

const useRows = () => {
  const [ rows, setRows ] = useState<Row[]>([ generateRow(), generateRow() ]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const rowIds = rows.map(row => row.rowId);
  const recentlyMovedToNewContainerRef = useRef(false);

  const findPath = getFindPath(rows);

  /**
   *
   * LIFECYCLE FUNCTIONS
   *
   */

  // Callback that runs when the user begins dragging a draggable.
  // All we're doing here is setting the active draggable id.
  // This is significant primarily for the collision detection strategy.
  const handleDragStart = ({ active }) => {
    setActiveId(active.id);
  }

  // Callback that runs when user lets go of mouse button after dragging
  // a draggable somewhere. By the time this runs, both active and over should
  // either be items in the same column, or over is not an item at all.
  //
  // This callback is mostly only meaningful when moving elements within the
  // same column. You can replace this with an empty function, and the POC
  // will mostly still work for moving items between columns, but it will bug out 
  // when moving an item within the same column.
  const handleDragEnd = ({ active, over }) => {
    // find the column in which the active element currently resides
    const activePath = findPath(active.id);
    const overPath = findPath(over.id);

    if (!activePath || !overPath)
      return setActiveId(null);

    // check if we are just moving rows around
    if (activePath.isRowMove) {
      if (activePath.rowId !== overPath.rowId) {
        setRows((items: Row[]) => {
          const oldIndex = items.findIndex(row => row.rowId === active.id);
          const newIndex = items.findIndex(row => row.rowId === over.id);
          
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    } else if (!activePath?.columnId) {
      // if we aren't doing a row move, but no columns are present, then just short circuit out
      return setActiveId(null);
    }

    // check if we are moving items around in the same column
    if (activePath.isItemMove) {
      const rowIndex = rows.findIndex(row => row.rowId === activePath.rowId);

      const column = rows[rowIndex]?.columns[activePath.columnId as string];

      // same column
      const activeIndexInColumn = column.indexOf(activePath.itemId as string);
      const overIndexInColumn = column.indexOf(overPath.itemId as string);


      setRows(rows => [
        ...rows.slice(0, rowIndex),
        {
          ...rows[rowIndex],
          columns: {
            ...rows[rowIndex].columns,
            [activePath.columnId as string]: arrayMove(
              rows[rowIndex].columns[activePath.columnId as string],
              activeIndexInColumn,
              overIndexInColumn
            )
          }
        },
        ...rows.slice(rowIndex + 1),
      ])
    }

    setActiveId(null);
  }

  // Callback that runs as the user is dragging a draggable over another element
  // tracked by the dnd context. This actually updates the state so that 
  // the active element resides in the "over" container while dragging.
  //
  // This is mostly meaningful for moving elements to a different column. If you replace
  // this with an empty function, the POC will mostly work fine for moving items within the 
  // same column, but bug out when moving to a different one.
  const handleDragOver = ({ active, over }) => {
    // find the column in which the active element currently resides
    const activePath = findPath(active.id);
    if (!activePath) return;

    const overPath = findPath(over.id);
    if (!overPath) return;

    if (activePath.isRowMove) return;
    if (overPath.isRowMove) return;

    // we need to be working with items in columns. If we aren't, short circuit
    if (!activePath.isItemMove) return

    if (activePath.columnId !== overPath.columnId) {
      setRows(rows => {
        const sourceRowIdx = rows.findIndex(row => row.rowId === activePath.rowId);
        const sourceRow = {
          ...rows[sourceRowIdx],
          columns: {
            ...rows[sourceRowIdx].columns,
            // remove active item from source row column
            [activePath.columnId as string]: rows[sourceRowIdx].columns[activePath.columnId as string].filter((item: string) => item && item !== activePath.itemId)
          }
        }

        const destinationRowIdx = rows.findIndex(row => row.rowId === overPath.rowId);
        const destinationColumn = rows[destinationRowIdx].columns[overPath.columnId as string];

        // compute index of active item to be placed into over column
        let newIndex: number;
        if (overPath.isColumnMove) { // if moving over to a new column without a specific spot
          newIndex = destinationColumn.length + 1;
        } else if (overPath.isItemMove) {
          // determine the right index depending on if active is above or below the over item
          const isBelowOverItem =
            over &&
            active.rect.current.translated &&
            active.rect.current.translated.top > over.rect.top + over.rect.height;

          const modifier = isBelowOverItem ? 1 : 0;

          const overIndex = destinationColumn.indexOf(overPath.itemId as string);

          newIndex =
            overIndex >= 0 ? (overIndex + modifier) : (destinationColumn.length + 1);
        } else {
          throw new Error("Shouldnt be here.")
        }

        recentlyMovedToNewContainerRef.current = true;

        // update destination row with the active item at the specified index
        const destinationRow: Row = {
          ...rows[destinationRowIdx],
          // add active item to over row column
          columns: {
            ...rows[destinationRowIdx].columns,
            [overPath.columnId as string]: [
              ...destinationColumn.slice(0, newIndex),
              activePath.itemId as string,
              ...destinationColumn.slice(newIndex)
            ]
          }
        }

        const newRows = [ ...rows ];
        if (sourceRowIdx === destinationRowIdx) {
          newRows[sourceRowIdx] = {
            ...sourceRow,
            columns: {
              ...rows[destinationRowIdx].columns,
              [overPath.columnId as string]: [
                ...destinationColumn.slice(0, newIndex),
                activePath.itemId as string,
                ...destinationColumn.slice(newIndex)
              ],
              [activePath.columnId as string]: rows[sourceRowIdx].columns[activePath.columnId as string].filter((item: string) => item && item !== activePath.itemId)
            }
          }
        } else {
          newRows[sourceRowIdx] = sourceRow;
          newRows[destinationRowIdx] = destinationRow;
        }

        console.log({ newRows, destinationRow, sourceRow })
        return newRows;
      })
    }
  }


  const addRow = () => setRows(rows => [ ...rows, generateRow() ]);
  const removeRow = (id: string) => () => setRows(rows => rows.filter(row => row.rowId !== id));

  const addColumn = (rowId: string) => () => setRows(rows => {
    return rows.map(row => {
      return (row.rowId === rowId)
        ? { 
          ...row,
          columns: {
            ...row.columns,
            ...generateColumn()
          }
        }
        : row
    })
  });

  const removeColumn = (rowId: string) => (columnId: string) => () => setRows(rows => {
    return rows.map(row => {
      if (row.rowId !== rowId) return row;
      const { [columnId]: removedColumn, ...columns } = row.columns;
      return { ...row, columns };
    });
  });

  const updateItems = (rowId: string, columnId: string, columnSetter: ((columns: string[]) => string[])) => {
    setRows(rows => {
      return rows.map(row => {
        if (row.rowId !== rowId) return row;
        if (!(columnId in row.columns)) return row;
        return {
          ...row,
          columns: {
            ...row.columns,
            [columnId]: columnSetter(row.columns[columnId])
          }
        }
      })
    })
    
  }

  const addItem = (rowId: string) => (columnId: string) => () => {
    updateItems(rowId, columnId, columns => [ ...columns, generateItemId(columnId) ]);
  }

  const removeItem = (rowId: string) => (columnId: string) => (itemId: string) => () => {
    updateItems(rowId, columnId, columns => columns.filter(item => item !== itemId));
  }

  return { 
    rows,
    rowIds,
    activeId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    recentlyMovedToNewContainerRef,

    addRow,
    removeRow,

    addColumn,
    removeColumn,

    addItem,
    removeItem
  }
}


export const Section = ({ title, id }) => {
  const sensors = useSensors(useSensor(PointerSensor));

  const {
    rows,
    rowIds,
    activeId,
    recentlyMovedToNewContainerRef,

    handleDragStart,
    handleDragOver,
    handleDragEnd,

    addRow,
    removeRow,

    addColumn,
    removeColumn,

    addItem,
    removeItem
  } = useRows();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id });

  const collisionStrategy = useMultipleContainerCollisionDetectionStrategy({
    activeId,  
    recentlyMovedToNewContainerRef,
    items: rows
  });

  const style = {
    backgroundColor: "gray",
    border: "solid 1px black",
    padding: 5,
    margin: 5,
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <p><b>{ title }</b></p>
      <button onClick={addRow}>+ Row</button>
      <Grabber title="Move Section" {...listeners} />
      <DndContext
        collisionDetection={collisionStrategy} 
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={rowIds}
          strategy={verticalListSortingStrategy}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            {
              rows.map(row => (
                <Row
                  key={row.rowId}
                  id={row.rowId}
                  columns={row.columns}
                  onRemoveClick={removeRow(row.rowId)}
                  onAddColumn={addColumn(row.rowId)}
                  onRemoveColumn={removeColumn(row.rowId)}
                  onAddItem={addItem(row.rowId)}
                  onRemoveItem={removeItem(row.rowId)}
                />
              ))
            }
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

