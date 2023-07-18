import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Grabber } from "./Grabber.tsx";
import styled from "styled-components";

const Wrapper = styled.div`
  border: solid 2px;
  background-color: white;
  margin-top: 15px;
  padding: 15px;
  z-index: 1;
  &:active {
    background-color: coral;
  }
`

export const SortableItem = ({ id, onRemoveClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Wrapper ref={setNodeRef} style={style} {...attributes}>
      <b>{ id }</b>
      <span style={{ display: "flex", flexDirection: "row" }}>
        <Grabber title="Move Item" {...listeners} />
        { onRemoveClick && <button onClick={onRemoveClick?.(id)} style={{ marginRight: 5 }}>X</button> }
      </span>
    </Wrapper>
  )
}
