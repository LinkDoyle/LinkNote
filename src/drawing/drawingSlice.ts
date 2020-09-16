import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Command } from "./commands";

export enum Mode {
  PenDrawing,
  Text,
  Select,
  Erase,
}

export interface IHistory {
  readonly commands: Command[];
  readonly currentIndex: number;
  readonly cmdRedoAvailable: boolean;
  readonly cmdUndoAvailable: boolean;
}

export interface IDrawBoardState {
  readonly isDrawing: boolean;
  readonly mode: Mode;
  readonly eraseMode: boolean;

  readonly currentPointerId: number | null;
  readonly currentTrack: { x: number; y: number }[];

  readonly history: IHistory;

  readonly context?: CanvasRenderingContext2D | null;
  readonly lineWidth: number;
  readonly color: string;
  readonly font: string;
  readonly fontSize: number;
  readonly fontBold: boolean;
  readonly fontUnderline: boolean;
  readonly fontItalic: boolean;
}

export type DrawingPayloadAction = PayloadAction<{
  pointerId: number;
  pointerType: string;
  offsetX: number;
  offsetY: number;
}>;

export const DEFAULT_STATE = {
  isDrawing: false,
  mode: Mode.PenDrawing,

  currentPointerId: null,
  currentTrack: [],

  history: {
    commands: [] as Command[],
    currentIndex: -1,

    cmdRedoAvailable: false,
    cmdUndoAvailable: false,
  },

  context: undefined,
  lineWidth: 2.0,
  color: "#000000",
  font: "",
  fontSize: 24,
  fontBold: false,
  fontUnderline: false,
  fontItalic: false,
};

export type DrawingState = typeof DEFAULT_STATE;

export const selectHistory = (state: DrawingState): IHistory => state.history;

export const drawingSlice = createSlice({
  name: "drawing",
  initialState: DEFAULT_STATE,
  reducers: {
    setMode(state, action: PayloadAction<Mode>) {
      state.mode = action.payload;
    },
    record(state, action: PayloadAction<Command>) {
      const { history } = state;
      history.cmdUndoAvailable = true;
      history.cmdRedoAvailable = false;
      history.currentIndex++;
      history.commands.push(action.payload);
    },
    undo(state) {
      const { history } = state;
      const { currentIndex } = history;
      const nextIndex = Math.max(currentIndex - 1, -1);
      history.currentIndex = nextIndex;
      history.cmdUndoAvailable = nextIndex != -1;
      history.cmdRedoAvailable = true;
    },
    redo(state) {
      const { history } = state;
      const { currentIndex, commands } = history;
      const nextIndex = Math.min(currentIndex + 1, commands.length - 1);
      history.currentIndex = nextIndex;
      history.cmdUndoAvailable = true;
      history.cmdRedoAvailable = nextIndex < commands.length - 1;
    },
  },
});

export const { setMode, record, undo, redo } = drawingSlice.actions;

const reducer = drawingSlice.reducer;

export default reducer;
