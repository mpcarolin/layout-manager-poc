import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Column } from "./Column.tsx";
import { Grabber } from "./Grabber.tsx";

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


