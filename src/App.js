import React from "react";
//import { LayoutManager } from "./DndKit/LayoutManager.tsx";
import { LayoutManager } from "./ReactGridLayout/LayoutManager.tsx";
import styled from "styled-components";
import { nanoid } from "nanoid";

const FieldFormWrapper = styled.div`
  border: 2px solid red;
  background-color: lavenderblush;
  margin: 15px;
  width: 500px;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  padding: 15px;
`;

const FieldForm = ({ onSubmit }) => {
  const [ title, setTitle ] = React.useState("");
  return <FieldFormWrapper>
    <span>
      <label for="title">Title</label>
      <input 
        style={{ marginLeft: 15, width: "50%" }}
        id="title"
        onChange={(e) => setTitle(e.currentTarget.value)}
      />
    </span>
    <button
      style={{width: 80}} 
      onClick={() => onSubmit({ title, id: nanoid(2) })}
    >
      Submit
    </button>
  </FieldFormWrapper>
}

function App() {
  // id needs to be string for react grid keys for some reason
  const data = Array(4)
    .fill(null)
    .map(() => ({ title: "N/A", id: nanoid(2) }));

  const [ fields, setFields ] = React.useState(data);

  const [ enableForm, setEnableForm ] = React.useState(false);

  const onSubmit = field => {
    setFields([...fields, field]);
    setEnableForm(false);
  }

  return (
    <span>
      { enableForm && <FieldForm onSubmit={onSubmit} /> }
      <LayoutManager
        fields={fields}
        setFields={setFields}
        setShowForm={setEnableForm}
      />
    </span>
  );
}

export default App;
