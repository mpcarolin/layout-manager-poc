import React from "react";
import styled from "styled-components";
import { SortableDemo } from "./DndKit/SortableDemo.tsx";

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

function App() {
  return (
    <AppRoot>
      <SortableDemo />
    </AppRoot>
  );
}

export default App;
