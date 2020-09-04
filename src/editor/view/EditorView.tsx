import React, { ReactElement } from "react";
import "../editor.css";

import ContentContainer from "./ContentView";
import { useTextAreaReducer } from "../editorReducer";
import LineNumberContainer from "./LineNumbers";
import EditorContext from "../editorContext";

function EditorView(): ReactElement {
  const [state, dispatch] = useTextAreaReducer();

  return (
    <EditorContext.Provider value={{ state: state, dispatch: dispatch }}>
      <div className="editor-container">
        <LineNumberContainer />
        <ContentContainer />
      </div>
    </EditorContext.Provider>
  );
}

export default EditorView;
