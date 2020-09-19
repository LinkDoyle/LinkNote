import React, { useState, useRef, useEffect, ReactElement } from "react";
import _ from "lodash";
import DebugView from "./DebugView";
import Carets from "./Carets";
import Lines, { useCaretMetrics } from "./Lines";
import { KeyCode } from "../../utility";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../reducers";
import {
  createTextRange,
  deleteText,
  insertText,
  setCaret,
} from "../editorSlice";
import { createSelector } from "@reduxjs/toolkit";

const selectCarets = createSelector(
  (state: RootState) => state.editor.selections,
  (selections) =>
    selections.map((s) => ({
      line: s.endLine,
      column: s.endColumn,
    }))
);

const ContentContainer = (): ReactElement => {
  const dispatch = useDispatch();
  const carets = useSelector(selectCarets);
  const lines = useSelector((state: RootState) => state.editor.lines);

  const linesViewRef = useRef<HTMLDivElement>(null);
  const measurerRef = useRef<HTMLDivElement>(null);
  const [caretMetrics] = useCaretMetrics(linesViewRef, measurerRef, carets);
  const inputTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const [caretBlink, setCaretBlink] = useState(true);

  useEffect(() => {
    inputTextAreaRef.current?.focus();
  }, [inputTextAreaRef]);

  const [isCompositionMode, setCompositionMode] = useState(false);
  const handleCompositionStart = (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: React.CompositionEvent<HTMLTextAreaElement>
  ) => {
    setCompositionMode(true);
  };

  const handleCompositionUpdate = () => {
    // TODO: show characters
  };

  const handleCompositionEnd = (
    event: React.CompositionEvent<HTMLTextAreaElement>
  ) => {
    event.currentTarget.value = "";
    setCompositionMode(false);
  };

  const handleTextAreaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    if (isCompositionMode) {
      return;
    }
    const insertedText = event.currentTarget.value;
    event.currentTarget.value = "";
    console.debug(insertedText);

    const lastCaret = _.last(carets);
    console.log(lastCaret);
    if (lastCaret) {
      console.log(carets);
      dispatch(
        insertText({
          line: lastCaret.line,
          column: lastCaret.column,
          text: insertedText,
        })
      );
      console.log(carets);
    }
  };

  const calcCaretInputAreaPosition = () => {
    if (caretMetrics.length === 0) {
      return {
        left: 0,
        top: 0,
      };
    }
    const lastCaretMetric = _.last(caretMetrics);
    return lastCaretMetric
      ? {
          left:
            lastCaretMetric.focusElement.offsetLeft +
            lastCaretMetric.metricOffsets[lastCaretMetric.metricIndex],
          top: lastCaretMetric.focusElement.offsetTop,
        }
      : {
          left: 0,
          top: 0,
        };
  };

  const handleTextAreaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ): void => {
    switch (e.keyCode) {
      case KeyCode.DOM_VK_BACK_SPACE: {
        const lastCaret = _.last(carets);
        if (lastCaret) {
          console.log(carets);
          const range =
            lastCaret.column > 0
              ? createTextRange(lastCaret.line, lastCaret.column - 1)
              : lastCaret.line > 0
              ? createTextRange(
                  lastCaret.line - 1,
                  lines[lastCaret.line - 1].length
                )
              : createTextRange(0, 0);
          dispatch(deleteText(range));
          console.log(carets);
        }
        break;
      }
      case KeyCode.DOM_VK_LEFT: {
        setCaretBlink(false);
        const newCarets = carets.map((c) =>
          c.column > 0
            ? {
                line: c.line,
                column: c.column - 1,
              }
            : c.line > 0
            ? {
                line: c.line - 1,
                column: lines[c.line].length,
              }
            : {
                line: 0,
                column: 0,
              }
        );
        dispatch(setCaret(newCarets));
        break;
      }
      case KeyCode.DOM_VK_RIGHT: {
        setCaretBlink(false);
        const newCarets = carets.map((c) =>
          c.column < lines[c.line].length
            ? {
                line: c.line,
                column: c.column + 1,
              }
            : c.line < lines.length - 1
            ? {
                line: c.line + 1,
                column: 0,
              }
            : {
                line: lines.length - 1,
                column: lines[lines.length - 1].length,
              }
        );
        dispatch(setCaret(newCarets));
        break;
      }
      case KeyCode.DOM_VK_UP: {
        setCaretBlink(false);
        const newCarets = carets.map((c) => {
          const newLineIndex = Math.max(0, c.line - 1);
          const newOffset = Math.min(lines[newLineIndex].length, c.column);
          return {
            line: newLineIndex,
            column: newOffset,
          };
        });
        dispatch(setCaret(newCarets));
        break;
      }
      case KeyCode.DOM_VK_DOWN: {
        setCaretBlink(false);
        const newCarets = carets.map((c) => {
          const newLineIndex = Math.min(lines.length - 1, c.line + 1);
          const newOffset = Math.min(lines[newLineIndex].length, c.column);
          return {
            line: newLineIndex,
            column: newOffset,
          };
        });
        dispatch(setCaret(newCarets));
        break;
      }
    }
  };

  const handleTextAreaKeyUp = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ): void => {
    switch (e.keyCode) {
      case KeyCode.DOM_VK_LEFT:
      case KeyCode.DOM_VK_RIGHT:
      case KeyCode.DOM_VK_UP:
      case KeyCode.DOM_VK_DOWN: {
        setCaretBlink(true);
        break;
      }
    }
  };
  return (
    <div className="editor-content">
      <Lines linesRef={linesViewRef} measurerRef={measurerRef} />
      <DebugView>
        {carets.map((c, i) => {
          return (
            <span key={i}>
              line: {c.line}, offset: {c.column}{" "}
            </span>
          );
        })}
      </DebugView>
      <Carets caretMetrics={caretMetrics} blink={caretBlink} />
      <textarea
        ref={inputTextAreaRef}
        className="editor-input-textarea"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        role="textbox"
        wrap="off"
        onChange={handleTextAreaChange}
        onCompositionUpdate={handleCompositionUpdate}
        onCompositionEnd={handleCompositionEnd}
        onCompositionStart={handleCompositionStart}
        onKeyDown={handleTextAreaKeyDown}
        onKeyUp={handleTextAreaKeyUp}
        style={{ ...calcCaretInputAreaPosition() }}
      />
    </div>
  );
};

export default ContentContainer;
