
  // this guy might be able to simplify/replace complex logic in handleDragEnd, but for now sticking w/ dndkit story code
  const setColumnItems = (
    columnKey: string,
    items: string[] | ((items: string[]) => Columns)
  ) => {
    setColumns(columns => ({
      ...columns,
      [columnKey]: typeof items === "function"
        ? items(columns[columnKey])
        : ({ ...columns, [columnKey]: items })
    }))
  }

const useFormLayout = () => {
  /**
   *
   * State
   *
   */
  const [ sections, setSections ] = useState<Sections>({
    "test": {
      "A": [ "test:A:foo", "test:A:bar", "test:A:baz" ],
      "B": [ "test:B:boom", "test:B:bam", "test:B:dazzle" ],
    }
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const recentlyMovedToNewContainerRef = useRef(false);
  const columnNames = new Set<string | undefined>(Object.keys(columns));
  const isSortingContainer = activeId ? columnNames.has(activeId) : false;

  /**
   *
   * Hook private helpers 
   *
   */
  const destructureId = (id: string) => {
    const [ sectionId, columnId, itemId ] = id.split(":");
    return { sectionId, columnId, itemId };
  }

  const setSectionColumns = (sectionId, columnSetter: ((columns: Columns) => Columns)) => {
    setSections(sections => ({
      ...sections,
      [sectionId]: {
        ...sections[sectionId],
        ...columnSetter(sections[sectionId])
      }
    }))
  }


  // find column with the id, or the column containing the item with id
  const findContainingColumn = (id: string): string | undefined => {
    const { sectionId } = destructureId(id);

    const columns = sections[sectionId];

    // if the id is referring to a column then just return that column id
    if (id in columns) {
      return id;
    }


    // if the id is referring to a item, then find the column with that item
    return Object
      .keys(columns)
      .find(key => columns[key].includes(id));
  };

  /**
   *
   * LIFECYCLE FUNCTIONS
   *
   */
  const handleDragStart = ({ active }: DragEvent) => {
    setActiveId(active.id);
  }

  const handleDragEnd = ({active, over}) => {
    const activeColumnId = findContainingColumn(active.id);
    const { sectionId: activeSectionId } = destructureId(activeColumnId);

    if (!activeColumnId)
      return setActiveId(null);

    const overId = over?.id;

    if (overId == null)
      return setActiveId(null);

    const overContainer = findContainingColumn(overId);
    const { sectionId: overSectionId } = destructureId(overId);

    if (overContainer) {
      const activeIndex = sections[activeSectionId][activeColumnId].indexOf(active.id);
      const overIndex = sections[overSectionId][overContainer].indexOf(overId);

      if (activeIndex !== overIndex) {
        setSectionColumns(overSectionId, columns => ({
          ...columns,
          [overContainer]: arrayMove(
            columns[overContainer],
            activeIndex,
            overIndex
          ),
        }));
      }
    }

    setActiveId(null);
  }


  const handleDragOver = ({ active, over }: DragEvent) => {
    const overId = over?.id;

    const { sectionId, columnId } = destructureId(overId);
    const columns = sections[sectionId][columnId];

    if (overId == null || active.id in columns) {
      return;
    }

    const overColumn = findContainingColumn(overId);
    const activeColumn = findContainingColumn(active.id);

    if (!overColumn || !activeColumn) {
      return;
    }

    if (activeColumn !== overColumn) {
      setSectionColumns(sectionId, (columns: Columns) => {
        const activeItems = columns[activeColumn];
        const overItems = columns[overColumn];
        const overIndex = overItems.indexOf(overId);
        const activeIndex = activeItems.indexOf(active.id);

        let newIndex: number;

        if (overId in columns) { // if moving over to a new column without a specific spot
          newIndex = overItems.length + 1;
        } else {
          // determine the right index depending on if active is above or below the over item
          const isBelowOverItem =
            over &&
            active.rect.current.translated &&
            active.rect.current.translated.top > over.rect.top + over.rect.height;

          const modifier = isBelowOverItem ? 1 : 0;

          newIndex =
            overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
        }

        recentlyMovedToNewContainerRef.current = true;

        return {
          ...columns,
          [activeColumn]: columns[activeColumn].filter(item => item && item !== active.id),
          // in the new column, place the moved item to the right index
          [overColumn]: [
            ...columns[overColumn].slice(0, newIndex),
            columns[activeColumn][activeIndex],
            ...columns[overColumn].slice(newIndex, columns[overColumn].length),
          ],
        };
      });
    }
  }

  /**
   *
   * Public Helpers
   *
   */
  const addColumn = (sectionId: string) => () => {
    const columns = sections[sectionId];

    const columnIds = Object.keys(columns);
    const lastColumnId = columnIds[columnIds.length - 1];

    const nextColumnId = String.fromCharCode(lastColumnId.charCodeAt(0) + 1);

    setSectionColumns(sectionId, columns => ({
      ...columns,
      [nextColumnId]: []
    }))
  }

  const removeColumn = (sectionId: string) => (id: string) => () => setSectionColumns(sectionId, columns => {
    const { [id]: removedColumn, ...remainingColumns } = columns;
    return remainingColumns;
  });

  const addItem = (sectionId: string) => (columnId: string) => () => {
    setSectionColumns(sectionId, columns => ({
      ...columns,
      [columnId]: [
        ...columns[columnId],
        `${columnId}:${nanoid(4)}`
      ],
    }))
  }

  // TODO: make currying / partial using lodash...
  const removeItem = (sectionId: string) => (columnId: string) => (itemId: string) => (event: SyntheticEvent) => {
    // TODO: is this stop propagation necessary?
    event.stopPropagation();
    setSectionColumns(sectionId, columns => ({
      ...columns,
      [columnId]: columns[columnId].filter(id => id !== itemId)
    }));
  }

  return {
    sections,
    columnNames,
    setSections,

    // lifecycles
    handleDragStart,
    handleDragEnd,
    handleDragOver,

    // public helpers
    addColumn,
    removeColumn,
    addItem,
    removeItem,

    activeId,
    recentlyMovedToNewContainerRef,
    isSortingContainer,
  }
}
