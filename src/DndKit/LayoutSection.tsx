import React from 'react';
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
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { groupBy, pick } from "lodash";
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

const GridDiv = styled.div`
  background-color: yellow;
  display: grid;
  grid-template-columns: ${ ({ columns }) => "repeat(" + columns + ", 1fr)" };
  grid-gap: 10;
  padding: 10;
`

const buildSwappedFields = (fields: Field[], activeIdx: number, overIdx: number) => {
  const activeUpdated = { ...fields[activeIdx] };
  const { x, y } = activeUpdated;
  const overUpdated = { ...fields[overIdx] };
  activeUpdated.x = overUpdated.x;
  activeUpdated.y = overUpdated.y;
  overUpdated.x = x;
  overUpdated.y = y;

  const newFields = [ ...fields ];
  newFields[activeIdx] = activeUpdated;
  newFields[overIdx] = overUpdated;

  return newFields;
}

// https://docs.dndkit.com/presets/sortable
export const LayoutSection = ({ title, style, rowCount, columnCount, fields, onRequestFieldAdd, setFields, setColumnCount, setRowCount }) => {

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
      setFields((fields: Field[]) => {
        const activeFieldIdx = fields.findIndex(field => field.id === active.id);
        const overFieldIdx = fields.findIndex(field => field.id === over.id);
        return buildSwappedFields(fields, activeFieldIdx, overFieldIdx);
      });
    }
  }


  return (
    <SectionWrapper style={style}>
      <h2>Section - { title }</h2>
      <p>Columns - { columnCount }</p>
      <p>Rows - { rowCount }</p>
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
        <AttributeAdjuster
          type="Row"
          onAdd={() => setRowCount(count => count + 1)}
          onRemove={() => setRowCount(count => Math.max(count - 1, 1))}
        />
        <SortableContext 
          items={fields}
          strategy={rectSortingStrategy}
        >
          <GridDiv columns={columnCount}>
            { fields.map(f => <Item key={f.id} {...f} /> ) }
          </GridDiv>
        </SortableContext>
      </DndContext>
    </SectionWrapper>
  );

}
