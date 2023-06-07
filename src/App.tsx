import React from "react";
import GridLayout from "react-grid-layout";
import { FieldForm } from "./components/FieldForm.tsx"
import { LayoutSection, Field  } from "./ReactGridLayout/LayoutSection.tsx"
import { nanoid } from "nanoid";
import { useLayout, LayoutItem } from "./hooks/useLayout.tsx"
import styled from "styled-components";

const buildField = ({ title = "N/A", id = nanoid(2) } = {}) => ({ title, id })

interface Section extends LayoutItem {
  id: string
  title: string
  fields: Field[]
}

const AppRoot = styled.div`
  border: 2px solid black;
  background-color: lavender;
  margin: 15px;
  width: 900px;
  height: 1000px;
`;

function App() {
  const [ sections, setSections ] = React.useState<Section[]>([
    {
      title: "Foo",
      id: nanoid(3),
      fields: Array(3).fill(null).map(() => buildField())
    },
    {
      title: "Bar",
      id: nanoid(3),
      fields: Array(3).fill(null).map(() => buildField())
    }
  ]);

  const rootLayout = useLayout(sections, 1);
  console.log({rootLayout})

  const [ sectionFormId, setSectionFormId ] = React.useState(null);

  const onFieldSubmit = (field: Field) => {
    setSectionFormId(null);
    if (!field) return;

    const idx = sections.findIndex(section => section.id === sectionFormId);
    const newSections = [ ...sections ];
    const section = newSections[idx];
    newSections[idx].fields = [ ...section.fields, field ];
    setSections(newSections);
  }


  return (
    <AppRoot>
      { sectionFormId &&
        <FieldForm
          section={sectionFormId}
          onSubmit={onFieldSubmit}
        />
      }
      <GridLayout
        cols={1}
        rowHeight={300}
        width={600}
        layout={rootLayout}
      >
      {
        sections.map(section => (
          <LayoutSection
            title={section.title}
            key={section.id}
            id={section.id}
            fields={section.fields}
            onFieldAdd={() => setSectionFormId(section.id)}
          />
        ))
      }
      </GridLayout>
    </AppRoot>
  );
}

export default App;
