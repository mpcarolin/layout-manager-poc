import React, { useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable, arrayMove, } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { nanoid } from "nanoid";
import { useBasicSortableCollisionStrategy } from "./collisionDetectionStrategies.ts";
import { Row } from "./Row.tsx";
import { Grabber } from "./Grabber.tsx";



const useRows = () => {
  const [ rows, setRows ] = useState([ nanoid(3), nanoid(3) ]);

  /**
   *
   * LIFECYCLE FUNCTIONS
   *
   */
  const handleDragEnd = ({ active, over }) => {
    if (active.id !== over.id) {
      setRows((items: string[]) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const addRow = () => setRows(rows => [ ...rows, nanoid(3) ]);
  const removeRow = (id: string) => () => setRows(rows => rows.filter(name => id !== name));

  return { 
    rows,
    handleDragEnd,
    addRow,
    removeRow,
  }
}


export const Section = ({ title, id }) => {
  const sensors = useSensors(useSensor(PointerSensor));

  const collisionStrategy = useBasicSortableCollisionStrategy();

  const {
    rows,
    addRow,
    removeRow,
    handleDragEnd,
  } = useRows();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id });

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
        sensors={sensors}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={rows}
          strategy={verticalListSortingStrategy}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            {
              rows.map(name => (
                <Row
                  key={name}
                  id={name}
                  onRemoveClick={removeRow(name)}
                />
              ))
            }
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

