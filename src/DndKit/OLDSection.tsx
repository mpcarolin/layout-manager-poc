import React, { useState, useRef, SyntheticEvent } from "react";
import {
  DndContext,
  MeasuringStrategy,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";

import { nanoid } from "nanoid";

import { useMultipleContainerCollisionDetectionStrategy } from "./useMultipleContainerCollisionDetection.ts";

import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { SortableItem } from "./SortableItem.tsx";

const Column = ({ items, name, onRemoveClick, onAddItem, onRemoveItem }) => {
  const { setNodeRef } = useDroppable({ id: name })
  const style = {
    border: "solid 2px",
    margin: 15,
    padding: 15
  };

  return (
    <SortableContext
      items={items}
      strategy={verticalListSortingStrategy}
    >
      <div ref={setNodeRef} style={style}>
        <span>
          <b style={{ marginRight: 5 }}>{ name }</b>
          <button onClick={onRemoveClick}>X</button>
          <button onClick={onAddItem}>+</button>
        </span>
        { items.map(id => <SortableItem key={id} id={id} onRemoveClick={onRemoveItem} />) }
      </div>
    </SortableContext>
  );
}

interface DndObject {
  id: string
}
interface DragEvent {
  active: DndObject
  over: DndObject
}

interface Columns {
  [columnKey: string]: string[]
}

const useColumns = () => {
  /**
   *
   * State
   *
   */
  const [ columns, setColumns ] = useState<Columns>({
    "A": [ "A:foo", "A:bar", "A:baz" ],
    "B": [ "B:boom", "B:bam", "B:dazzle" ],
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const recentlyMovedToNewContainerRef = useRef(false);
  const columnNames = new Set<string | undefined>(Object.keys(columns));
  const isSortingContainer = activeId ? columnNames.has(activeId) : false;

  const [ clonedColumns, setClonedItems ] = useState<Columns | null>(null);

  /**
   *
   * Hook private helpers 
   *
   */
  // this guy might be able to simplify/replace complex logic in handleDragEnd, but for now sticking w/ dndkit story code
  const setColumnItems = (
    columnKey: string,
    items: string[] | ((items: string[]) => Columns)
  ) => {
    setColumns(columns => ({
      ...columns,
      [columnKey]: typeof items === "function"
        ? items(columns[columnKey])
        : ({ ...columns, [columnKey]: items })
    }))
  }

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
    setClonedItems(columns);
  }

  const handleDragEnd = ({active, over}) => {
    const activeColumnId = findContainingColumn(active.id);

    if (!activeColumnId)
      return setActiveId(null);

    const overId = over?.id;

    if (overId == null)
      return setActiveId(null);

    const overContainer = findContainingColumn(overId);

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
    const columnIds = Object.keys(columns);
    const lastColumnId = columnIds[columnIds.length - 1];

    const nextColumnId = String.fromCharCode(lastColumnId.charCodeAt(0) + 1);

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

  // TODO: make currying / partial using lodash...
  const removeItem = (columnId: string) => (itemId: string) => (event: SyntheticEvent) => {
    event.stopPropagation();
    setColumns(columns => ({
      ...columns,
      [columnId]: columns[columnId].filter(id => id !== itemId)
    }));
  }

  return {
    columns,
    columnNames,
    setColumns,
    clonedColumns,

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

export const LayoutManager = ({ title }) => {
  const sensors = useSensors(useSensor(PointerSensor));

  const {
    columns,

    // helpers
    addColumn,
    removeColumn,
    removeItem,
    addItem,

    // lifecycles
    handleDragStart,
    handleDragEnd,
    handleDragOver,

    activeId,
    recentlyMovedToNewContainerRef,
  } = useColumns();

  // I can't tell what this is for. Seems to work fine without it?
  React.useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainerRef.current = false;
    });
  }, [columns, recentlyMovedToNewContainerRef ]);


  const collisionStrategy = useMultipleContainerCollisionDetectionStrategy({
    activeId,
    recentlyMovedToNewContainerRef,
    items: columns
  });

  return (
    <DndContext
      collisionDetection={collisionStrategy} 
      measuring={{ droppable: { strategy: MeasuringStrategy.Always, } }}
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <p><b>{ title }</b></p>
      <button onClick={addColumn}>+ Column</button>
      <div style={{ display: "flex", flexDirection: "row" }}>
        {
          Object.entries(columns).map(([ name, items ]) => (
            <Column
              onRemoveClick={removeColumn(name)}
              onRemoveItem={removeItem(name)}
              onAddItem={addItem(name)}
              items={items}
              name={name}
              key={name}
            />
          ))
        }
      </div>
    </DndContext>
  )
}

