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

const InvisibleWrapper = styled(Wrapper)`
  background-color: transparent;
  cursor: auto;
`;

export const Item = ({ id, title, x, y, isSpacer }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumnStart: x + 1,
    gridRowStart: y + 1,
  }

  const Wrap = isSpacer ? InvisibleWrapper : Wrapper;

  return (
    <Wrap
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div style={{ display: "flex", flexDirection: "column", height: 40 }}>
        <b>{ !isSpacer && title }</b>
        { !isSpacer && id }
      </div>
    </Wrap>
  );
}

