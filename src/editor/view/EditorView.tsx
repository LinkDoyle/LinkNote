import React, { ReactElement } from "react";
import "../editor.css";

import ContentContainer from "./ContentView";
import LineNumberContainer from "./LineNumbers";
import { useSelector } from "react-redux";
import { RootState } from "../../reducers";
import _ from "lodash";

function EditorView(): ReactElement {
  const lineNumbers = useSelector((state: RootState) => {
    const { begin, end } = state.editor.viewLineRange;
    return _.range(begin + 1, end + 1);
  });
  return (
    <div className="editor-container">
      <LineNumberContainer lineNumbers={lineNumbers} />
      <ContentContainer />
    </div>
  );
}

export default EditorView;
