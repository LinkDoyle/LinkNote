import _ from "lodash";
import { useReducer, Dispatch } from "react";
import { NotImplementedError } from "../utility";

const initialLines = [
  "Hello WennyEditor",
  "Hello LinkNode",
  "Practice makes perfect",
  "Space: 1",
  "Space:  2",
  "Space:   3",
];

export interface Caret {
  line: number; // start at 0
  offset: number; // start at 0
}

export class TextRange {
  private _startLine: number; // included, start at 0
  private _endLine: number; // exclusive
  private _startOffset: number; // included, start at 0
  private _endOffset: number; // exclusive

  constructor();
  constructor(line: number, offset: number);
  /**
   * @param startLine included
   * @param endLine exclusive
   * @param startOffset included
   * @param endOffset exclusive
   */
  constructor(
    startLine: number,
    startOffset: number,
    endLine: number,
    endOffset: number
  );

  /**
   * @param startLine included
   * @param endLine exclusive
   * @param startOffset included
   * @param endOffset exclusive
   */
  constructor(
    startLine?: number,
    startOffset?: number,
    endLine?: number,
    endOffset?: number
  ) {
    this._startLine = startLine ?? 0;
    this._startOffset = startOffset ?? 0;
    this._endLine = endLine ?? this._startLine;
    this._endOffset = endOffset ?? this._startOffset + 1;
  }

  public get startLine(): number {
    return this._startLine;
  }
  public set startLine(v: number) {
    this._startLine = v;
  }

  public get endLine(): number {
    return this._endLine;
  }
  public set endLine(v: number) {
    this._endLine = v;
  }

  public get startOffset(): number {
    return this._startOffset;
  }
  public set startOffset(v: number) {
    this._startOffset = v;
  }

  public get endOffset(): number {
    return this._endOffset;
  }
  public set endOffset(v: number) {
    this._endOffset = v;
  }

  public toString = (): string => {
    return `TextRange (${this.startLine}:${this.startOffset}, ${this.endLine}:${this.endOffset})`;
  };

  public get caret(): Caret {
    return { line: this.endLine, offset: this.endOffset };
  }

  public get collapsed(): boolean {
    return this.startLine == this.endLine && this.startOffset == this.endLine;
  }
}

export const SET_TEXT = "setText";
export const LOAD_TEXT = "loadText";

export const SET_VIEW_RANGE = "setViewRange";

export const INSERT_TEXT = "insertText";
export const DELETE_TEXT = "deleteText";
export const REPLACE_RANGE = "replaceRange";
export const REPLACE_TEXT = "replaceText";

export const ADD_SELECTION = "addSelection";
export const REMOVE_SELECTION = "removeSelection";
export const CLEAR_SELECTION = "clearSelection";
export const UPDATE_CARETS = "updateCarets";

interface SetTextAction {
  type: typeof SET_TEXT;
  text: string;
}

interface LoadText {
  type: typeof LOAD_TEXT;
  path: string;
}

interface SetViewRange {
  type: typeof SET_VIEW_RANGE;
  range: TextRange;
}
interface InsertAction {
  type: typeof INSERT_TEXT;
  line: number;
  offset: number;
  text: string;
}

interface DeleteAction {
  type: typeof DELETE_TEXT;
  ranges: TextRange | TextRange[];
}

interface ReplaceRangeAction {
  type: typeof REPLACE_RANGE;
  ranges: TextRange | TextRange[];
  text: string;
}

interface ReplaceTextAction {
  type: typeof REPLACE_TEXT;
  text: string | RegExp;
  newText: string;
}

interface AddSelectionAction {
  type: typeof ADD_SELECTION;
  range: TextRange;
}
interface RemoveSelectionAction {
  type: typeof REMOVE_SELECTION;
  range: TextRange;
}
interface ClearSelectionAction {
  type: typeof CLEAR_SELECTION;
}

interface UpdateCaretsAction {
  type: typeof UPDATE_CARETS;
  carets: Caret[];
}

export type State = {
  lines: string[];
  lineNumbers: number[];
  carets: Caret[];
};

export type Action =
  | SetTextAction
  | LoadText
  | SetViewRange
  | InsertAction
  | DeleteAction
  | ReplaceRangeAction
  | ReplaceTextAction
  | AddSelectionAction
  | RemoveSelectionAction
  | ClearSelectionAction
  | UpdateCaretsAction;

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case SET_TEXT: {
      const newLines = action.text.split(/\n/);
      return {
        ...state,
        lines: newLines,
        lineNumbers: _.range(newLines.length),
      };
    }
    case LOAD_TEXT: {
      throw new NotImplementedError(`Not implemented action '${action}'`);
    }
    case SET_VIEW_RANGE: {
      throw new NotImplementedError(`Not implemented action '${action}'`);
    }
    case INSERT_TEXT: {
      /*
       * Single Line
       * ...
       * [BEGIN_TEXT] [INSERTED_TEXT] [END_TEXT]
       * ...
       *
       * MultiLine
       * ...
       * [BEGIN_TEXT] [INSERTED_TEXT_0]
       * ...
       * [INSERTED_TEXT_K]
       * ...
       * [INSERTED_TEXT_N] [END_TEXT]
       * ...
       */
      const lineIndex = Math.max(action.line, 0);
      const insertedLines = action.text.split(/\r?\n/);
      const currentLine = state.lines[lineIndex];

      const beginText = currentLine.slice(0, action.offset) + insertedLines[0];
      const endText =
        (insertedLines.length > 1
          ? insertedLines[insertedLines.length - 1]
          : "") + currentLine.slice(action.offset);

      const lines =
        insertedLines.length > 1
          ? [beginText, ...insertedLines.slice(1, -1), endText]
          : [beginText + endText];

      const newLines = [
        ...state.lines.slice(0, lineIndex),
        ...lines,
        ...state.lines.slice(lineIndex + 1),
      ];

      const newCaretLine = lineIndex + insertedLines.length - 1;
      const newCaretOffset =
        insertedLines.length === 1
          ? action.offset + insertedLines[0].length
          : insertedLines[insertedLines.length - 1].length;
      return {
        lines: newLines,
        lineNumbers: _.range(1, newLines.length + 1),
        carets: [
          {
            line: newCaretLine + 1,
            offset: newCaretOffset,
          },
        ],
      };
    }
    case DELETE_TEXT: {
      const ranges: TextRange[] =
        action.ranges instanceof TextRange ? [action.ranges] : action.ranges;
      let lines = state.lines;
      for (const range of ranges) {
        const [startLine, startOffset, endLine, endOffset] =
          range.startLine <= range.endLine
            ? [
                range.startLine,
                range.startOffset,
                range.endLine,
                range.endOffset,
              ]
            : [
                range.endLine,
                range.endOffset,
                range.startLine,
                range.startOffset,
              ];
        if (startLine < 0 || endLine >= lines.length) {
          throw new Error(
            `Line range=[${startLine}, ${endLine}) is out of range!`
          );
        }
        if (startOffset < 0 || endOffset > lines[endLine].length) {
          throw new Error(`Text range ${range} is out of range!`);
        }
        lines[startLine] =
          lines[startLine].slice(0, startOffset) +
          lines[endLine].slice(endOffset);
        lines = lines
          .slice(0, startLine)
          .concat(lines[startLine])
          .concat(lines.slice(startLine + 1));
      }
      return {
        ...state,
        lines,
      };
    }
    case REPLACE_RANGE: {
      throw new NotImplementedError(`Not implemented action '${action}'`);
    }
    case REPLACE_TEXT: {
      throw new NotImplementedError(`Not implemented action '${action}'`);
    }
    case ADD_SELECTION: {
      throw new NotImplementedError(`Not implemented action '${action}'`);
    }
    case REMOVE_SELECTION: {
      throw new NotImplementedError(`Not implemented action '${action}'`);
    }
    case CLEAR_SELECTION: {
      throw new NotImplementedError(`Not implemented action '${action}'`);
    }

    case UPDATE_CARETS: {
      return {
        ...state,
        carets: [...action.carets],
      };
    }
    default:
      throw new NotImplementedError(`Not implemented action '${action}'`);
  }

  return state;
};

export const useTextAreaReducer = (): [State, Dispatch<Action>] => {
  const [state, dispatch] = useReducer(reducer, {
    lines: initialLines,
    lineNumbers: _.range(1, initialLines.length + 1),
    carets: [{ line: 0, offset: 0 }],
  });
  return [state, dispatch];
};
