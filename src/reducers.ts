import { combineReducers } from "@reduxjs/toolkit";
import drawingReducer from "./drawing/drawingSlice";

const rootReducer = combineReducers({
  drawing: drawingReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
