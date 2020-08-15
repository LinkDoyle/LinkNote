import React, { ReactElement } from "react";
import "../editor.css";

import ContentContainer from "./ContentView";
import { useTextAreaReducer } from "../editorReducer";
import LineNumberContainer from "./LineNumbers";

function EditorView(): ReactElement {
  const [state, dispatch] = useTextAreaReducer();

  return (
    <div className="editor-container">
      <LineNumberContainer lineNumbers={state.lineNumbers} />
      <ContentContainer
        lines={state.lines}
        carets={state.carets}
        onTextInsert={(line, offset, text) =>
          dispatch({ type: "insert", line, offset, text })
        }
        onCaretsChange={(carets) =>
          dispatch({ type: "updateCarets", carets: carets })
        }
      />
    </div>
  );
}

export default EditorView;
