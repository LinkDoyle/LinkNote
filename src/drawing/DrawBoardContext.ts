import { Dispatch, useReducer } from "react";
import React from "react";

export enum Mode {
  PenDrawing,
  Text,
  Select,
  Erase,
}

interface Point {
  x: number;
  y: number;
}

interface ICommand {
  /**
   * draw
   */
  execute(ctx: CanvasRenderingContext2D): void;
  save(): unknown;
  load(state: unknown): void;
}

class PenCommand implements ICommand {
  private _lineWidth: number;
  private _color: string;
  private _track: Point[];
  /**
   *
   */
  constructor(lineWidth: number, color: string, track: Point[]) {
    this._lineWidth = lineWidth;
    this._color = color;
    this._track = track;
  }

  execute(ctx: CanvasRenderingContext2D): void {
    if (this._track.length === 0) {
      return;
    }
    ctx.save();
    ctx.lineWidth = this._lineWidth;
    ctx.strokeStyle = this._color;
    if (this._track.length === 1) {
      const { x, y } = this._track[0];
      ctx.moveTo(x, y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      for (let i = 0; i < this._track.length - 1; ++i) {
        const { x: x0, y: y0 } = this._track[i];
        ctx.moveTo(x0, y0);
        const { x: x1, y: y1 } = this._track[i + 1];
        ctx.lineTo(x1, y1);
      }
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();
  }

  save(): unknown {
    throw new Error("Method not implemented.");
  }

  load(state: unknown) {
    const { lineWidth, color, track } = state as {
      lineWidth: number;
      color: string;
      track: Point[];
    };
    [this._lineWidth, this._color, this._track] = [lineWidth, color, track];
  }
}

class TextCommand implements ICommand {
  execute(ctx: CanvasRenderingContext2D): void {
    throw new Error("Method not implemented.");
  }
  save(): unknown {
    throw new Error("Method not implemented.");
  }
  load(state: unknown): void {
    throw new Error("Method not implemented.");
  }
}

class ImageCommand implements ICommand {
  execute(ctx: CanvasRenderingContext2D): void {
    throw new Error("Method not implemented.");
  }
  save(): unknown {
    throw new Error("Method not implemented.");
  }
  load(state: unknown): void {
    throw new Error("Method not implemented.");
  }
}

class ClearCommand implements ICommand {
  execute(ctx: CanvasRenderingContext2D): void {
    ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
  save(): unknown {
    throw new Error("Method not implemented.");
  }
  load(state: unknown): void {
    throw new Error("Method not implemented.");
  }
}

export interface IDrawBoardState {
  readonly isDrawing: boolean;
  readonly mode: Mode;
  readonly eraseMode: boolean;

  readonly currentPointerId: number | null;
  readonly currentTrack: { x: number; y: number }[];

  readonly history: HistoryState;

  readonly context?: CanvasRenderingContext2D | null;
  readonly lineWidth: number;
  readonly color: string;
  readonly font: string;
  readonly fontSize: number;
  readonly fontBold: boolean;
  readonly fontUnderline: boolean;
  readonly fontItalic: boolean;
}

export class DrawBoardState implements IDrawBoardState {
  constructor() {
    this.isDrawing = false;
    this.mode = Mode.PenDrawing;

    this.currentPointerId = null;
    this.currentTrack = [];

    this.history = {
      commands: [],
      currentIndex: -1,

      cmdRedoAvailable: false,
      cmdUndoAvailable: false,
    };

    this.context = undefined;
    this.lineWidth = 2.0;
    this.color = "#000000";
    this.font = "";
    this.fontSize = 24;
    this.fontBold = false;
    this.fontUnderline = false;
    this.fontItalic = false;
  }

  isDrawing: boolean;
  mode: Mode;
  get eraseMode(): boolean {
    return this.mode === Mode.Erase;
  }

  currentPointerId: number | null;
  currentTrack: { x: number; y: number }[];

  history: HistoryState;

  context?: CanvasRenderingContext2D | null;
  lineWidth: number;
  color: string;
  font: string;
  fontSize: number;
  fontBold: boolean;
  fontUnderline: boolean;
  fontItalic: boolean;
}

export interface HistoryState {
  readonly commands: ICommand[];
  readonly currentIndex: number;
  readonly cmdRedoAvailable: boolean;
  readonly cmdUndoAvailable: boolean;
}

export const DEFAULT_STATE = new DrawBoardState();

export const SET_CONTEXT = "SET_CONTEXT";
export const SET_MODE = "SET_MODE";
export const BEGIN_DRAWING = "BEGIN_DRAWING";
export const DRAW = "DRAW";
export const END_DRAWING = "END_DRAWING";

export const RECORD = "RECORD";
export const REPLAY = "REPLAY";
export const UNDO = "UNDO";
export const REDO = "REDO";
export const CLEAR = "CLEAR";

export type DrawBoardAction =
  | {
      type: typeof SET_CONTEXT;
      context?: CanvasRenderingContext2D | null;
    }
  | {
      type: typeof SET_MODE;
      mode: Mode;
    }
  | {
      type: typeof BEGIN_DRAWING;
      pointerId: number;
      pointerType: string;
      ctx: CanvasRenderingContext2D;
      offsetX: number;
      offsetY: number;
    }
  | {
      type: typeof DRAW;
      pointerId: number;
      pointerType: string;
      ctx: CanvasRenderingContext2D;
      offsetX: number;
      offsetY: number;
    }
  | {
      type: typeof END_DRAWING;
      ctx: CanvasRenderingContext2D;
      offsetX: number;
      offsetY: number;
    }
  | { type: typeof CLEAR }
  | HistoryAction;

export type HistoryAction =
  | { type: typeof RECORD; command: ICommand }
  | { type: typeof UNDO }
  | { type: typeof REDO };

const replay = (
  ctx?: CanvasRenderingContext2D | null
): ((commands: ICommand[], endIndex: number) => void) => (
  commands: ICommand[],
  endIndex: number
) => {
  if (!ctx) {
    return;
  }
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (let i = 0; i < endIndex; ++i) {
    const command = commands[i];
    command.execute(ctx);
  }
};

const history = (
  historyState: HistoryState,
  historyAction: HistoryAction,
  onReplay?: (commands: ICommand[], currentIndex: number) => void
): HistoryState => {
  switch (historyAction.type) {
    case RECORD: {
      const { currentIndex, commands } = historyState;
      return {
        ...historyState,
        cmdUndoAvailable: true,
        cmdRedoAvailable: false,
        currentIndex: currentIndex + 1,
        commands: [
          ...commands.slice(0, currentIndex + 1),
          historyAction.command,
        ],
      };
    }
    case UNDO: {
      const { commands, currentIndex } = historyState;
      onReplay?.(commands, currentIndex);
      const nextIndex = Math.max(currentIndex - 1, -1);
      return {
        ...historyState,
        currentIndex: nextIndex,
        cmdUndoAvailable: nextIndex != -1,
        cmdRedoAvailable: true,
      };
    }
    case REDO: {
      const { currentIndex, commands } = historyState;
      const nextIndex = Math.min(currentIndex + 1, commands.length - 1);
      onReplay?.(commands, nextIndex + 1);
      return {
        ...historyState,
        currentIndex: nextIndex,
        cmdRedoAvailable: nextIndex < commands.length - 1,
        cmdUndoAvailable: true,
      };
    }
    default:
      return historyState;
  }
};

const reducer = (
  state: IDrawBoardState,
  action: DrawBoardAction
): IDrawBoardState => {
  console.log(action.type);
  switch (action.type) {
    case SET_CONTEXT: {
      return {
        ...state,
        context: action.context,
      };
    }
    case SET_MODE: {
      return {
        ...state,
        mode: action.mode,
      };
    }
    case BEGIN_DRAWING: {
      const { isDrawing, currentTrack } = state;
      if (isDrawing) {
        break;
      }
      const ctx = action.ctx;
      ctx.lineWidth = state.lineWidth;
      ctx.strokeStyle = state.color;
      return {
        ...state,
        isDrawing: true,
        currentPointerId: action.pointerId,
        currentTrack: [
          ...currentTrack,
          { x: action.offsetX, y: action.offsetY },
        ],
      };
    }
    case DRAW: {
      const { isDrawing, mode, currentPointerId, currentTrack } = state;
      if (!isDrawing || currentPointerId !== action.pointerId) {
        break;
      }
      switch (mode) {
        case Mode.PenDrawing: {
          const track = [
            ...currentTrack,
            { x: action.offsetX, y: action.offsetY },
          ];
          const ctx = action.ctx;
          ctx.beginPath();
          const { x: x0, y: y0 } = track[track.length - 2];
          ctx.moveTo(x0, y0);
          const { x: x1, y: y1 } = track[track.length - 1];
          ctx.lineTo(x1, y1);
          ctx.closePath();
          ctx.stroke();
          return {
            ...state,
            currentTrack: track,
          };
        }
        default: {
          // TODO
          console.warn(`Not implemented ${Mode[mode]} yet.`);
        }
      }
      return {
        ...state,
      };
    }
    case END_DRAWING: {
      const { isDrawing } = state;
      if (!isDrawing) {
        break;
      }
      const { mode, lineWidth, color, currentTrack } = state;
      let { history: historyState } = state;
      switch (mode) {
        case Mode.PenDrawing: {
          historyState = history(historyState, {
            type: RECORD,
            command: new PenCommand(lineWidth, color, currentTrack),
          });
          break;
        }
        default: {
          // TODO
          console.warn(`Not implemented mode ${Mode[mode]} yet.`);
        }
      }
      return {
        ...state,
        isDrawing: false,
        currentPointerId: null,
        currentTrack: [],
        history: { ...historyState },
      };
    }
    case CLEAR: {
      const { context } = state;
      if (!context) {
        break;
      }
      const canvas = context.canvas;
      context.clearRect(0, 0, canvas.width, canvas.height);
      return {
        ...state,
        history: history(state.history, {
          type: RECORD,
          command: new ClearCommand(),
        }),
      };
    }
    default: {
      return {
        ...state,
        history: history(state.history, action, replay(state.context)),
      };
    }
  }
  return {
    ...state,
  };
};

export function useDrawBoardReducer(): [
  IDrawBoardState,
  Dispatch<DrawBoardAction>
] {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE);
  return [state, dispatch];
}

const DrawBoardContext = React.createContext<{
  state: IDrawBoardState;
  dispatch: Dispatch<DrawBoardAction>;
}>({
  state: DEFAULT_STATE,
  dispatch: () => {
    return;
  },
});

export default DrawBoardContext;
