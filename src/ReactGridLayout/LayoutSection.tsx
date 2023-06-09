import React from "react";
import GridLayout from "react-grid-layout";
import styled from "styled-components";
import { Field } from "../App.tsx"
import { Item } from "./Item.tsx"
import { useLayout } from "../hooks/useLayout.tsx";
import { nanoid } from "nanoid";

const generateID = () => nanoid(2)

const GridWidth = 500; 

const GridRoot = styled.div`
  border: 2px solid blue;
  background-color: lightblue;
  margin: 15px;
  width: ${GridWidth}px;
  cursor: pointer;
`;

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


export const LayoutSection = React.forwardRef((props: {
  title: string,
  fields: Field[],
  onFieldAdd: (field) => void,
  onFieldRemove?: (id: string) => void
  initialCols?: number
}, ref: unknown) => {
  const {
    title,
    fields = [],
    onFieldAdd,
    onFieldRemove,
    initialCols = 1,
    ...gridLayoutProps
  } = props;
  const [ columns, setColumns ] = React.useState(initialCols);

  const layout = useLayout(fields, columns);

  // Store the layout according to grid, for eventual export
  const [ currentLayout, setLayout ] = React.useState(layout);
  console.log(currentLayout);

  return (
    <GridRoot ref={ref} {...gridLayoutProps} className="draggable">
      <b>Section:</b> { title }
      <GridLayout
        cols={columns}
        rowHeight={50}
        width={GridWidth}
        layout={layout}
        onLayoutChange={setLayout}
        onDragStart={(a, b, c, d, e) => e.stopPropagation()}
        onDragStop={(layout, oldItem, newItem, placeholder) => console.log("onDragStop", { layout, oldItem, newItem, placeholder })}
        onDrop={() => console.log("onDrop")}
        onDropDragOver={() => console.log("onDropDragOver")}
      >
        {
          fields.map(field =>
            <Item
              key={field.id}
              onRemove={() => onFieldRemove(field.id)}
            >
              <b> Title: </b>
             {field.title}
              <b> ID: </b>
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
      <AdjustButton
        onClick={() => console.log(JSON.stringify(currentLayout, null, 2)) || alert("Printed to console")}
      >
        Export
      </AdjustButton>
    </GridRoot>
  );
});

