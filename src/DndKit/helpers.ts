import { nanoid } from "nanoid";

export type Path = {
  rowId: string
  columnId?: string
  itemId?: string

  row: RowType,
  column?: string[],

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

// Gets the path to the id in the row
export const getPath = (row: RowType, id: string): Path | undefined => {
  if (row.rowId === id) 
    return ({
      rowId: id,
      row,
      isRowMove: true
    });

  const matchingColumnId = Object.keys(row.columns).find(colId => colId === id);

  if (matchingColumnId) {
    return {
      rowId: row.rowId,
      row,
      columnId: matchingColumnId,
      column: row.columns[matchingColumnId],
      isColumnMove: true
    }
  }

  for (const [ columnId, items ] of Object.entries(row.columns)) {
    if (items.includes(id)) {
      return {
        rowId: row.rowId,
        row,
        columnId,
        column: row.columns[matchingColumnId],
        itemId: id,
        isItemMove: true
      }
    }
  }
}

// Finds the path to the object with the id in the rows.
export const findPath = (rows: RowType[]) => (id: string): undefined | Path => {
  for (const row of rows) {
    const result = getPath(row, id)
    if (!result) continue;
    return result;
  }
}
