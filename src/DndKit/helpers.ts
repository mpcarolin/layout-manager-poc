import { nanoid } from "nanoid";

export type Path = {
  rowId: string
  columnId?: string
  itemId?: string

  isRowMove?: boolean
  isColumnMove?: boolean
  isItemMove?: boolean
}

export interface Columns {
  [columnKey: string]: string[]
}

export type RowType = {
  rowId: string
  columns: Columns,
}

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

export const generateItemId = (columnId: string) => `${columnId}:${nanoid(3)}`;

export const generateColumn = () => {
  const colId = nanoid(3);
  return {
    [colId]: [ colId, colId, colId ].map(generateItemId)
  }
}

export const generateRow = (): RowType => ({
  rowId: nanoid(3),
  columns: {
    ...generateColumn(),
    ...generateColumn()
  },
})

export const getPath = (row: RowType, id: string): Path | undefined => {
  if (row.rowId === id) 
    return ({
      rowId: id,
      isRowMove: true
    });

  const matchingColumnId = Object.keys(row.columns).find(colId => colId === id);

  if (matchingColumnId) {
    return {
      rowId: row.rowId,
      columnId: matchingColumnId,
      isColumnMove: true
    }
  }

  for (const [ columnId, items ] of Object.entries(row.columns)) {
    if (items.includes(id)) {
      return {
        rowId: row.rowId,
        columnId,
        itemId: id,
        isItemMove: true
      }
    }
  }
}

