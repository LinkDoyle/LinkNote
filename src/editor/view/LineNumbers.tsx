import React, { ReactElement, useContext } from "react";
import EditorContext from "../editorContext";

const LineNumberContainer = (): ReactElement => {
  const { state } = useContext(EditorContext);
  const { lineNumbers } = state;

  return (
    <div className="editor-line-numbers">
      {lineNumbers.map((value, index) => {
        return (
          <div className="editor-line-number" key={index}>
            {value}
          </div>
        );
      })}
    </div>
  );
};

export default LineNumberContainer;
