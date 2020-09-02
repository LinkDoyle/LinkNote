import _ from "lodash";
import { useReducer, Dispatch } from "react";

const initialLines = [
  "Hello WennyEditor",
  "Hello LinkNode",
  "Practice makes perfect",
  "Space: 1",
  "Space:  2",
  "Space:   3",
];

export interface Caret {
  line: number;
  offset: number;
}

export class TextRange {
  private _startLine: number; // included
  private _endLine: number; // exclusive
  private _startOffset: number; // included
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

enum ActionType {
  INSERT = "insert",
  DELETE = "delete",
  REPLACE_RANGE = "replace",
  REPLACE_TEXT = "replaceText",
  REPLACE_REGEX = "replaceRegex",
  GET_SELECTION = "getSelection",
  ADD_SELECTION = "addSelection",
  REMOVE_SELECTION = "removeSelection",
}

export type Action = InsertAction | DeleteAction | UpdateCaretsAction;

interface InsertAction {
  type: "insert";
  line: number;
  offset: number;
  text: string;
}

interface DeleteAction {
  type: "delete";
  ranges: TextRange | TextRange[];
}

interface ReplaceAction {
  type: ActionType.REPLACE_RANGE;
  ranges: TextRange | TextRange[];
  text: string;
}
interface UpdateCaretsAction {
  type: "updateCarets";
  carets: Caret[];
}

export type State = {
  lines: string[];
  lineNumbers: number[];
  carets: Caret[];
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "insert": {
      const lineIndex = Math.max(action.line - 1, 0);
      const insertedLines = action.text.split(/\r?\n/);
      const currentLine = state.lines[lineIndex];
      const startLine =
        currentLine.slice(0, action.offset) +
        insertedLines[0] +
        currentLine.slice(action.offset);

      const newLines = [
        ...state.lines.slice(0, lineIndex),
        startLine,
        ...insertedLines.slice(1),
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
    case "delete": {
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
        if (startOffset < 0 || endOffset > lines[endLine - 1].length) {
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
    case "updateCarets": {
      return {
        ...state,
        carets: [...action.carets],
      };
    }
    default:
      console.warn(`Not implement action? "${action}"`);
      break;
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
