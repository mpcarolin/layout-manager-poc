import React, { useState } from 'react';
import styled from "styled-components";
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { groupBy } from "lodash";
import { Field } from "../App.tsx"
import { AttributeAdjuster } from "../components/AttributeAdjuster.tsx";

import { Item } from "./Item.tsx";

const SectionWrapper = styled.div`
  border: 2px solid black;
  padding: 15px;
  width: 50%;
  background-color: lightgrey;
`

const ColumnDiv = styled.div`
  background-color: yellow;
  display: flex;
  flex-direction: column;
  justifyContent: space-around;
  height: 200px;
  width: 120px;
  border: 2px solid black;
  padding: 15px;
  margin-right: 15px;
`

// https://docs.dndkit.com/presets/sortable
export const LayoutSection = ({ title, style, columnCount, fields, onRequestFieldAdd, setFields, setColumnCount }) => {

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = event => {
    const { active, over } = event;

    // this just updates the ordering of the fields since we are moving an item
    if (active.id !== over.id) {
      setFields(fields => {
        const oldIndex = fields.findIndex(field => field.id === active.id);
        const newIndex = fields.findIndex(field => field.id === over.id);
        console.log({ active, over })
        return arrayMove(fields, oldIndex, newIndex);
      });
    }
  }

  const columns: { field: Field[] }[] = Array(columnCount)
    .fill(null)
    .map((_, idx) => ({
      fields: fields.filter(field => field.x === idx)
    }))

  return (
    <SectionWrapper style={style}>
      <h2>Section - { title }</h2>
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <AttributeAdjuster
          type="Field"
          onAdd={onRequestFieldAdd}
        />
        <AttributeAdjuster
          type="Column"
          onAdd={() => setColumnCount(count => count + 1)}
          onRemove={() => setColumnCount(count => Math.max(count - 1, 1))}
        />
        <SortableContext 
          items={fields}
          strategy={rectSortingStrategy}
        >
          <div style={{ display: "flex", flexDirection: "row" }}>
            { columns.map(({ fields }, idx) => (
              <ColumnDiv key={idx}>
                {
                  fields.map(f => <Item key={f.id} {...f} />)
                }
              </ColumnDiv>
            )) }
          </div>
        </SortableContext>
      </DndContext>
    </SectionWrapper>
  );

}
