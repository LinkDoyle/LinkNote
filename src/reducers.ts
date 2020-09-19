import { combineReducers } from "@reduxjs/toolkit";
import drawingReducer from "./drawing/drawingSlice";
import editorReducer from "./editor/editorSlice";

const rootReducer = combineReducers({
  drawing: drawingReducer,
  editor: editorReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
