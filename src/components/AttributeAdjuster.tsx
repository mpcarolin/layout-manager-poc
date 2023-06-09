import React from "react";
import styled from "styled-components";

const AdjustButton = styled.button`
  margin: 5px;
`

export const AttributeAdjuster = ({
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

