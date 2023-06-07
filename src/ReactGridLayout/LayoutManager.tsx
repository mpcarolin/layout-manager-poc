import React from "react";
import GridLayout from "react-grid-layout";
import styled from "styled-components";
import { Item } from "./Item.tsx"
import { useCoordinates } from "./useCoordinates.tsx";
import { nanoid } from "nanoid";

const generateID = () => nanoid(2)

const GridWidth = 500; 

interface Field {
  id: string,
  width?: number
  height?: number
}

const GridRoot = styled.div`
  border: 2px solid blue;
  background-color: lightblue;
  margin: 15px;
  width: ${GridWidth}px;
`;

const useLayout = (fields: Field[], numColumns: number) => {
  const { next } = useCoordinates(numColumns);
  return React.useMemo(() => fields.map(field => {
    const [ x, y ] = next();
    return {
      x, y,
      i: field.id,
      w: field.width ?? 1,
      h: field.height ?? 1
    }
  }), [ next, fields ]);
}

const AdjustButton = styled.button`
  margin: 5px;
`

const AttributeManager = ({
    type,
    onAdd,
    onRemove
  }: {
    type: string,
    onAdd: () => void,
    onRemove?: () => void
  }) => {
  return (
    <div>
      <AdjustButton onClick={onAdd}>+ { type }</AdjustButton>
      { onRemove && 
        <AdjustButton onClick={onRemove}>- { type }</AdjustButton>
      }
    </div>
  )
}


const LayoutSection = ({ fields = [], onFieldAdd, onFieldRemove, initialCols = 1 }: { fields: Field[], onFieldAdd: (field) => void, onFieldRemove?: (id) => void }) => {
  const [ columns, setColumns ] = React.useState(initialCols);

  const layout = useLayout(fields, columns);

  // Store the layout according to grid, for eventual export
  const [ currentLayout, setLayout ] = React.useState(layout);
  console.log(currentLayout);

  return (
    <GridRoot>
      <GridLayout
        cols={columns}
        rowHeight={50}
        width={GridWidth}
        layout={layout}
        onLayoutChange={setLayout}
      >
        {
          fields.map(field =>
            <Item
              key={field.id}
              onRemove={() => onFieldRemove(field.id)}
            >
              {field.id}
            </Item>
          )
        }
      </GridLayout>
      <AttributeManager
        type="Column"
        onAdd={() => setColumns(state => state + 1)}
        onRemove={() => setColumns(state => state - 1)}
      />
      <AttributeManager
        type="Field"
        onAdd={() => onFieldAdd({ id: generateID() })}
      />
    </GridRoot>
  );
}

export function LayoutManager() {
  // id needs to be string for react grid keys for some reason
  const data = Array(4)
    .fill(null)
    .map(() => ({ id: generateID() }));

  const [ fields, setFields ] = React.useState(data);

  return (
    <LayoutSection
      onFieldAdd={field => setFields([...fields, field])}
      onFieldRemove={field => setFields(fields.filter(f => f.id !== field.id))}
      fields={fields}
    />
  );
}

