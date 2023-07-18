import React from "react";

const style = {
  cursor: "grab",
  border: "solid 1px black",
  marginRight: 5,
  backgroundColor: "yellow",
  padding: 2,
  maxWidth: 110
};

export const Grabber = ({ title, ...attributes }) => {
  return (
    <div style={style} {...attributes}>{ title }</div>
  )
}

