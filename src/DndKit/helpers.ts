export const destructureId = (id: string) => {
  const [ sectionId, columnId, itemId ] = id.split(":");
  return { sectionId, columnId, itemId };
}

