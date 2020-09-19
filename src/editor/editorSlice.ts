import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import { NotImplementedError } from "../utility";

export interface Caret {
  line: number; // start at 0
  column: number; // start at 0
}

export interface TextRange {
  startLine: number; // included, start at 0
  endLine: number; // exclusive
  startColumn: number; // included, start at 0
  endColumn: number; // exclusive
}

export const isTextRangeCollapsed = (textRange: TextRange): boolean => {
  return (
    textRange.startLine == textRange.endLine &&
    textRange.startColumn == textRange.endColumn
  );
};

export const collapsedTextRange = (textRange: TextRange): TextRange => ({
  startLine: textRange.endLine,
  startColumn: textRange.endColumn,
  endLine: textRange.endLine,
  endColumn: textRange.endColumn,
});

export const createTextRange = (
  startLine?: number,
  startColumn?: number,
  endLine?: number,
  endColumn?: number
): TextRange => {
  const _startLine = startLine ?? 0;
  const _startColumn = startColumn ?? 0;
  const _endLine = endLine ?? _startLine;
  const _endColumn = endColumn ?? _startColumn + 1;

  return {
    startLine: _startLine,
    startColumn: _startColumn,
    endLine: _endLine,
    endColumn: _endColumn,
  };
};

/**
 * All index are zero-based, e.g. line.
 * All range are [begin, end), note the `end` is exclusive.
 */
const DEFAULT_STATE = {
  lines: ["ZZZ"] as string[], // split by lines
  viewLineRange: {
    begin: 0, // >= 0
    end: 1, // >= begin
  },
  selections: [createTextRange()] as TextRange[], // sorted by (line, column)
  highlights: [] as TextRange[], // sorted by (line, column)
};

type EditorState = typeof DEFAULT_STATE;

export const selectVisibleLines = (state: EditorState): string[] => {
  const {
    lines,
    viewLineRange: { begin, end },
  } = state;
  return lines.slice(begin, end);
};

export const editorSlice = createSlice({
  name: "editor",
  initialState: DEFAULT_STATE,
  reducers: {
    /* Text */
    setText(state, action: PayloadAction<string>) {
      const newLines = action.payload.split(/\n/);
      state.lines = newLines;
    },
    loadText(_state, action: PayloadAction<string>) {
      throw new NotImplementedError(`Not implemented action '${action.type}'`);
    },
    setViewLineRange(
      state,
      action: PayloadAction<{ begin: number; end: number }>
    ) {
      state.viewLineRange = action.payload;
    },
    insertText(
      state,
      action: PayloadAction<{ line: number; column: number; text: string }>
    ) {
      /*
       * Case 1: Single Line
       * ...
       * [BEGIN_TEXT] [INSERTED_TEXT] [END_TEXT]
       * ...
       *
       * Case 2: MultiLine
       * ...
       * [BEGIN_TEXT] [INSERTED_TEXT_0]
       * ...
       * [INSERTED_TEXT_K]
       * ...
       * [INSERTED_TEXT_N] [END_TEXT]
       * ...
       */
      const { text } = action.payload;
      const lineIndex = Math.max(action.payload.line, 0);
      const column = Math.max(action.payload.column, 0);

      const insertedLines = text.split(/\r?\n/);
      const currentLine = state.lines[lineIndex];

      const beginText = currentLine.slice(0, column) + insertedLines[0];
      const endText =
        (insertedLines.length > 1
          ? insertedLines[insertedLines.length - 1]
          : "") + currentLine.slice(column);

      const newLines =
        insertedLines.length > 1
          ? [beginText, ...insertedLines.slice(1, -1), endText]
          : [beginText + endText];
      const newCaretLine = lineIndex + insertedLines.length;
      const newCaretColumn =
        insertedLines.length === 1
          ? column + insertedLines[0].length
          : insertedLines[insertedLines.length - 1].length;

      const { lines, selections } = state;
      lines.splice(lineIndex, 1, ...newLines);
      for (let i = selections.length - 1; i >= 0; --i) {
        selections[i].startLine += newCaretLine;
        selections[i].startColumn += newCaretColumn;
        selections[i].endLine += newCaretLine;
        selections[i].endColumn += newCaretColumn;
      }
    },
    deleteText(state, action: PayloadAction<TextRange | TextRange[]>) {
      const ranges = _.isArray(action.payload)
        ? action.payload
        : [action.payload];
      let lines = state.lines;
      for (const range of ranges.reverse()) {
        const [startLine, startColumn, endLine, endColumn] =
          range.startLine <= range.endLine
            ? [
                range.startLine,
                range.startColumn,
                range.endLine,
                range.endColumn,
              ]
            : [
                range.endLine,
                range.endColumn,
                range.startLine,
                range.startColumn,
              ];
        if (startLine < 0 || endLine >= lines.length) {
          throw new Error(
            `Line range=[${startLine}, ${endLine}) is out of range!`
          );
        }
        if (startColumn < 0 || endColumn > lines[endLine].length) {
          throw new Error(`Text range ${range} is out of range!`);
        }
        lines[startLine] =
          lines[startLine].slice(0, startColumn) +
          lines[endLine].slice(endColumn);
        lines = lines
          .slice(0, startLine)
          .concat(lines[startLine])
          .concat(lines.slice(startLine + 1));
      }
    },
    replaceRange(
      state,
      action: PayloadAction<{ ranges: TextRange | TextRange[]; text: string }>
    ) {
      throw new NotImplementedError(`Not implemented action '${action.type}'`);
    },
    replaceText(
      state,
      action: PayloadAction<{ text: string | RegExp; newText: string }>
    ) {
      throw new NotImplementedError(`Not implemented action '${action.type}'`);
    },
    /* Caret */
    setCaret(state, action: PayloadAction<Caret | Caret[]>) {
      if (!_.isArray(action.payload)) {
        const c = action.payload;
        state.selections = [createTextRange(c.line, c.column)];
      } else {
        state.selections = _(action.payload)
          .map((c) => createTextRange(c.line, c.column))
          .sort((a, b) =>
            a.startLine === b.startLine
              ? a.startColumn - b.startColumn
              : a.startLine - b.startLine
          )
          .value();
      }
    },
    addCaret(state, action: PayloadAction<Caret>) {
      const { selections } = state;
      const { line, column: column } = action.payload;
      const newRange = createTextRange(line, column);
      const index = _.sortedIndex(selections, newRange);
      state.selections.splice(index, 0, newRange);
    },
    removeCaret(state, action: PayloadAction<Caret>) {
      const { selections } = state;
      const { line, column: column } = action.payload;
      const newRange = createTextRange(line, column);
      const index = _.sortedIndexOf(selections, newRange);
      if (!~index) {
        state.selections.splice(index, 1);
      }
    },
    clearCarets(state) {
      state.selections = [collapsedTextRange(state.selections[0])];
    },
    /* Selection */
    setSelection(state, action: PayloadAction<TextRange | TextRange[]>) {
      if (!_.isArray(action.payload)) {
        state.selections = [action.payload];
      } else {
        action.payload.sort((a, b) =>
          a.startLine === b.startLine
            ? a.startColumn - b.startColumn
            : a.startLine - b.startLine
        );
        state.selections = action.payload;
      }
    },
    addSelection(state, action: PayloadAction<TextRange>) {
      const { selections } = state;
      const index = _.sortedIndex(selections, action.payload);
      state.selections.splice(index, 0, action.payload);
    },
    removeSelection(state, action: PayloadAction<TextRange>) {
      const { selections } = state;
      const index = _.sortedIndexOf(selections, action.payload);
      if (!~index) {
        state.selections.splice(index, 1);
      }
    },
    clearSelections(state) {
      state.selections = [collapsedTextRange(state.selections[0])];
    },
    /* Highlight */
    setHighlight(state, action: PayloadAction<TextRange | TextRange[]>) {
      if (!_.isArray(action.payload)) {
        state.highlights = [action.payload];
      } else {
        action.payload.sort((a, b) =>
          a.startLine === b.startLine
            ? a.startColumn - b.startColumn
            : a.startLine - b.startLine
        );
      }
    },
    addHighlight(state, action: PayloadAction<TextRange>) {
      const { highlights } = state;
      const index = _.sortedIndex(highlights, action.payload);
      state.highlights.splice(index, 0, action.payload);
    },
    removeHighlight(state, action: PayloadAction<TextRange>) {
      const { highlights } = state;
      const index = _.sortedIndexOf(highlights, action.payload);
      if (!~index) {
        state.highlights.splice(index, 1);
      }
    },
    clearHighlights(state) {
      state.highlights = [];
    },
  },
});

export const {
  /* Text */
  setText,
  loadText,
  setViewLineRange,
  insertText,
  deleteText,
  replaceRange,
  replaceText,
  /* Caret */
  setCaret,
  addCaret,
  removeCaret,
  clearCarets,
  /* Selection */
  setSelection,
  addSelection,
  removeSelection,
  clearSelections,
  /* Highlight */
  setHighlight,
  addHighlight,
  removeHighlight,
  clearHighlights,
} = editorSlice.actions;

const reducer = editorSlice.reducer;

export default reducer;
