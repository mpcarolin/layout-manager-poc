import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styled from "styled-components";

const Wrapper = styled.div`
  border: solid 2px;
  background-color: white;
  cursor: pointer;
  margin-top: 15px;
  padding: 15px;
  z-index: 1;
  &:active {
    background-color: coral;
  }
`

export const SortableItem = props => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Wrapper ref={setNodeRef} style={style} {...attributes} {...listeners}>
      { props.id }
    </Wrapper>
  )
}
