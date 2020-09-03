import React, { Dispatch } from "react";
import { State, Action } from "./editorReducer";
const EditorContext = React.createContext<{
  state: State;
  dispatch: Dispatch<Action>;
}>({
  state: { lines: [], lineNumbers: [], carets: [] },
  dispatch: () => {
    return;
  },
});

export default EditorContext;
