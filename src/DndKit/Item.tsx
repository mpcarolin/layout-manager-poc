import styled from "styled-components";
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

const Wrapper = styled("div")`
  width: 100px;
  cursor: pointer;
  border: 2px solid blue;
  padding: 5px;
  background-color: coral;
`;

export const Item = ({ id, title }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <Wrapper
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <b>{ title }</b>
        { id }
      </div>
    </Wrapper>
  );
}

