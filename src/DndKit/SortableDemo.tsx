import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { SortableItem } from "./SortableItem.tsx";

interface DndKitEvent {
  active: {
    id: number
  },
  over: {
    id: number
  }
}

export const SortableDemo = (props) => {
  const [ items, setItems ] = useState([ 1, 2, 3 ]);
  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: DndKitEvent) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems(items => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      })
    }
  }

  return (
    <DndContext
      // Determines when a draggable is considered "over" a droppable
      // this is th recommended algorithm for sortable lists, because it is more forgiving (i.e. triggers "over" sooner than default)
      collisionDetection={closestCenter} 
      sensors={sensors}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items}
        strategy={verticalListSortingStrategy}
      >
        <div style={{ border: "solid 2px", backgroundColor: "green" }}>
          { items.map(id => <SortableItem key={id} id={id} />) }
        </div>
      </SortableContext>
    </DndContext>
  )
}

