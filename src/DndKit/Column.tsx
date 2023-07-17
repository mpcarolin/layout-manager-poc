import React from "react";
import {
  useDroppable,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { SortableItem } from "./SortableItem.tsx";

export const Column = ({ items, name, onRemoveClick, onAddItem, onRemoveItem }) => {
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

