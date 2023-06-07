import styled from "styled-components";
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

const Wrapper = styled("div")`
  width: 100px;
  cursor: pointer;
  border: 1px solid black;
  padding: 15px;
`;

export const SortableItem = ({ id }) => {
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
      { id }
    </Wrapper>
  );
}

