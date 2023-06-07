import React from "react";
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

export const FieldForm = ({ onSubmit }) => {
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
    <button
      style={{width: 80}} 
      onClick={() => onSubmit(null)}
    >
      Cancel
    </button>
  </FieldFormWrapper>
}


