import React from "react";
import styled from "styled-components";

const DraggableRoot = styled.div`
  border: 2px solid black;
  background-color: coral;
  cursor: pointer;
`;

export const Item = React.forwardRef((props, ref) => {
  const { children, onRemove, ...gridLayoutProps } = props;
  return (
    <DraggableRoot
      ref={ref}
      {...gridLayoutProps}
      className="draggable"
    >
      { children }
    </DraggableRoot>
  )
});

//<button onClick={onRemove}>&times;</button>
