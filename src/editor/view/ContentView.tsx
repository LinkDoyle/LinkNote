import React, { useState, useRef, useEffect, ReactElement } from "react";
import _ from "lodash";
import { Caret } from "../editorReducer";
import DebugView from "./DebugView";
import Carets from "./Carets";
import Lines, { useCaretMetrics } from "./Lines";

const ContentContainer = (props: {
  lines: string[];
  carets: Caret[];
  onTextInsert?: (line: number, offset: number, text: string) => void;
  onTextDelete?: (line: number, startOffset: number, endOffset: number) => void;
  onCaretsChange?: (carets: Caret[]) => void;
}): ReactElement => {
  const { lines, carets, onTextInsert, onCaretsChange } = props;
  const linesViewRef = useRef<HTMLDivElement>(null);
  const measurerRef = useRef<HTMLDivElement>(null);
  const [caretMetrics] = useCaretMetrics(linesViewRef, measurerRef, carets);
  const inputTextAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputTextAreaRef.current?.focus();
  });

  const [isCompositionMode, setCompositionMode] = useState(false);
  const handleCompositionStart = (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: React.CompositionEvent<HTMLTextAreaElement>
  ) => {
    setCompositionMode(true);
  };

  const handleCompositionUpdate = (
    event: React.CompositionEvent<HTMLTextAreaElement>
  ) => {
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
      onTextInsert?.(lastCaret.line, lastCaret.offset, insertedText);
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

  return (
    <div className="editor-content">
      <Lines
        lines={lines}
        linesRef={linesViewRef}
        measurerRef={measurerRef}
        onCaretsChange={onCaretsChange}
      />
      <DebugView>
        {carets.map((c, i) => {
          return (
            <span key={i}>
              line: {c.line}, offset: {c.offset}{" "}
            </span>
          );
        })}
      </DebugView>
      <Carets caretMetrics={caretMetrics} />
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
        style={{ ...calcCaretInputAreaPosition() }}
      />
    </div>
  );
};

export default ContentContainer;
