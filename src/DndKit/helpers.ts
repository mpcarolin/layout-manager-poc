import { nanoid } from "nanoid";

export const destructureId = (id: string) => {
  const [ row, column, item ] = id.split(":");
  return { row, column, item };
}

export const generateId = ({
  row = nanoid(3),
  column = nanoid(3),
  item = nanoid(3)
} = {}) => {
  return `${row}:${column}:${item}`
}

