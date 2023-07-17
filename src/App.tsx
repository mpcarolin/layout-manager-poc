import React from "react";
import styled from "styled-components";
import { LayoutManager  } from "./DndKit/LayoutManager.tsx";

const AppRoot = styled.div`
  border: 2px solid black;
  background-color: lavender;
  margin: 15px;
  width: 900px;
  height: 1000px;
  padding: 15px;
`;


function App() {
  return (
    <AppRoot>
      <LayoutManager title="test" />
    </AppRoot>
  );
}

export default App;
