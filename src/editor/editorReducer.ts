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

export type Action =
  | {
      type: "insert";
      line: number;
      offset: number;
      text: string;
    }
  | {
      type: "delete";
      startLine: number;
      endLine: number;
      startOffset: number;
      endOffset: number;
    }
  | {
      type: "updateCarets";
      carets: Caret[];
    };

export type State = {
  lines: string[];
  lineNumbers: number[];
  carets: Caret[];
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "insert": {
      const insertedLines = action.text.split(/\r?\n/);
      const currentLine = state.lines[action.line];
      const startLine =
        currentLine.slice(0, action.offset) +
        insertedLines[0] +
        currentLine.slice(action.offset);

      const newLines = [
        ...state.lines.slice(0, action.line),
        startLine,
        ...insertedLines.slice(1),
        ...state.lines.slice(action.line + 1),
      ];

      const newCaretLine = action.line + insertedLines.length - 1;
      const newCaretOffset =
        insertedLines.length === 1
          ? action.offset + insertedLines[0].length
          : insertedLines[insertedLines.length - 1].length;
      return {
        lines: newLines,
        lineNumbers: _.range(1, newLines.length + 1),
        carets: [
          {
            line: newCaretLine,
            offset: newCaretOffset,
          },
        ],
      };
    }
    case "delete": {
      break;
    }
    case "updateCarets": {
      return {
        ...state,
        carets: [...action.carets],
      };
    }
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
