import React from "react";
import { FieldForm } from "./components/FieldForm.tsx"
import { LayoutSection } from "./DndKit/LayoutSection.tsx"
import { nanoid } from "nanoid";
import styled from "styled-components";
import { getNextGridCoordinate } from "./hooks/useCoordinates.tsx"

const buildField = ({
  title = "N/A",
  id = nanoid(2),
  x = 0,
  y = 0
}: {
  title?: string,
  id?: string,
  x?: number,
  y?: number
} = {}) => ({
  x,
  y,
  title,
  id
})

interface Section {
  id: string
  title: string
  fields: Field[]
  columnCount: number
}

export interface Field {
  id: string,
  x: number,
  y: number,
  title?: string
  width?: number
  height?: number
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

const buildSection = ({ title, columnCount = 1, fields = Array(3).fill({}) }): Section => {
  const id = nanoid(3);

  const iterator = getNextGridCoordinate(columnCount);

  return {
    title,
    id,
    columnCount,
    fields: fields.map(field => {
      const [ x, y ] = iterator.next().value;
      return buildField({ ...field, x, y });
    }),
  }
}


function App() {
  const [ sections, setSections ] = React.useState<Section[]>([
    buildSection({ title: "Foo", columnCount: 2 }),
    //buildSection({ title: "Bar" })
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
    const fieldsSetter = typeof fields === "function"
      ? fields
      : () => fields;

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
      (section: Section) => ({ ...section, columnCount: countSetter(section.columnCount)})
    )
  }

  const onFieldSubmit = (field: Field) => {
    setSectionFormId(null);
    if (!field) return;
    setFields(sectionFormId)((fields: Field[]) => [ ...fields, field ]);
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
          {...section}
          onRequestFieldAdd={() => setSectionFormId(section.id)}
          setFields={setFields(section.id)}
          setColumnCount={setColumnCount(section.id)}
        />)
      }
      </SectionList>
    </AppRoot>
  );
}

export default App;
