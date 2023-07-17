import React, { useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

// section
import { Section } from "./Section.tsx";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { arrayMove } from "@dnd-kit/sortable";
import { useSectionListCollisionDetectionStrategy } from "./collisionDetectionStrategies.ts";


const useSections = () => {
  /**
   *
   * State
   *
   */
  const [ sections, setSections ] = useState<string[]>([ "FOO", "BAR" ]);

  /**
   *
   * LIFECYCLE FUNCTIONS
   *
   */
  const handleDragEnd = ({ active, over }) => {
    if (active.id !== over.id) {
      setSections((items: string[]) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }


  /**
   *
   * PUBLIC HELPERS
   *
   */
  const addSection = () => {}
  const removeSection = (id: string) => {}


  return {
    sections,
    setSections,

    // lifecycles
    handleDragEnd,

    // public helpers
    addSection,
    removeSection,
  }

}

export const LayoutManager = () => {
  const sensors = useSensors(useSensor(PointerSensor));
  const collisionStrategy = useSectionListCollisionDetectionStrategy();

  const {
    sections,
    handleDragEnd,
  } = useSections();

  return (
    <DndContext
      collisionDetection={collisionStrategy} 
      sensors={sensors}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sections}
        strategy={verticalListSortingStrategy}
      >
      {
        sections.map(title => (
          <Section
            key={title}
            id={title}
            title={title}
          />
        ))
      }
      </SortableContext>
    </DndContext>
  )
}


