import React from "react";
import { FieldForm } from "./components/FieldForm.tsx"
import { LayoutSection } from "./DndKit/LayoutSection.tsx"
import { nanoid } from "nanoid";
import styled from "styled-components";
import { getNextGridCoordinate } from "./hooks/useCoordinates.tsx"

const buildField = ({
  title = "N/A",
  isSpacer = false,
  id = nanoid(3),
  x = 0,
  y = 0,
}: {
  isSpacer?: boolean
  title?: string,
  id?: string,
  x?: number,
  y?: number
} = {}) => ({
  x,
  y,
  title,
  isSpacer,
  id
})

const buildSpacer = ({ x, y }) => buildField({ title: "(spacer)", isSpacer: true, x, y });

interface Section {
  id: string
  title: string
  fields: Field[]
  columnCount: number
  rowCount: number
}

export interface Field {
  id: string,
  x: number,
  y: number,
  title?: string
  width?: number
  height?: number
  isSpacer?: boolean
}


const AppRoot = styled.div`
  border: 2px solid black;
  background-color: lavender;
  margin: 15px;
  width: 900px;
  height: 1000px;
  padding: 15px;
`;

const SectionList = styled.div`
  display: flex;
  flex-direction: column;
` 

const buildSection = ({ title, columnCount = 1, rowCount = 1, fields = [] }: Section): Section => {
  console.log({ title, columnCount, rowCount, fields });
  const id = nanoid(3);

  const regularFieldIterator = getNextGridCoordinate(columnCount, rowCount);

  const regularFields = fields.filter(field => !field.isSpacer && field.x <= columnCount - 1 && field.y <= rowCount - 1);
  const maxY = Math.max(rowCount - 1, ...regularFields.map(field => field.y));
  const maxX = Math.max(columnCount - 1, ...regularFields.map(field => field.x));


  const processedFields = regularFields.map(field => {
    const [ x, y ] = regularFieldIterator.next().value;
    return buildField({ ...field, x, y });
  });

  // Add spacers to ensure we can still drag and drop over "empty" spots in grid
  let x = 0;
  let y = 0;
  const increment = () => {
    if (x < maxX) {
      x++;
    } else {
      x = 0;
      y++;
    }
  };
  const fieldExistsAt = (x, y) => regularFields.find(field => field.x === x && field.y === y);
  while (x <= maxX && y <= maxY) {
    console.log({ x, y, maxX, maxY })
    if (fieldExistsAt(x, y)) {
      increment();
      continue;
    }
    processedFields.push(buildSpacer({ x, y }))
    increment();
  }

  return {
    title,
    id,
    columnCount,
    rowCount,
    fields: processedFields,
  }
}


function App() {
  const [ sections, setSections ] = React.useState<Section[]>([
    buildSection({ title: "Foo", columnCount: 2, rowCount: 2 }),
  ]);

  console.log(sections[0].fields)

  const [ sectionFormId, setSectionFormId ] = React.useState<string | null>(null);

  const updateSection = (sectionId: string, sectionSetter: (section: Section) => Section) => {
    const index = sections.findIndex(section => section.id === sectionId);
    if (index < 0) throw new Error("No section!" + sectionId);
    setSections(
      sections.with(
        index,
        sectionSetter(sections[index])
      )
    );
  } 

  const setFields = (sectionId: string) => (fields: Field[] | ((fields: Field[]) => Field[])) => {
    const fieldsSetter = typeof fields === "function" ? fields : () => fields;

    updateSection(
      sectionId,
      (section: Section) => ({ ...section, fields: fieldsSetter(section.fields) })
    );
  }

  const setColumnCount = (sectionId: string) => (count: number | ((currentCount: number) => number)) => {
    const countSetter = typeof count === "function"
      ? count
      : () => count;

    updateSection(
      sectionId,
      (section: Section) => {
        const nextCount = countSetter(section.columnCount);
        const sectionProps = {
          ...section,
          columnCount: nextCount,
        };
        return buildSection(sectionProps);
      }
    )
  }

  const setRowCount = (sectionId: string) => (count: number | ((currentCount: number) => number)) => {
    const countSetter = typeof count === "function"
      ? count
      : () => count;

    updateSection(
      sectionId,
      (section: Section) => {
        const nextCount = countSetter(section.rowCount);
        const sectionProps = {
          ...section,
          rowCount: nextCount,
        };
        return buildSection(sectionProps);
      }
    )
  }

  const onFieldSubmit = (field: Field) => {
    setSectionFormId(null);
    if (!field || !sectionFormId) return;
    updateSection(
      sectionFormId,
      section => buildSection({ ...section, fields: [ ...section.fields, buildField(field) ] })
    );
  }

  return (
    <AppRoot>
      { sectionFormId &&
        <FieldForm
          section={sectionFormId}
          onSubmit={onFieldSubmit}
        />
      }
      <SectionList>
      {
        sections.map(section => <LayoutSection 
          key={section.id}
          style={{ marginBottom: 15 }}
          onRequestFieldAdd={() => setSectionFormId(section.id)}
          setFields={setFields(section.id)}
          setColumnCount={setColumnCount(section.id)}
          setRowCount={setRowCount(section.id)}
          {...section}
        />)
      }
      </SectionList>
    </AppRoot>
  );
}

export default App;
