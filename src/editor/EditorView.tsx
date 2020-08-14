import React, {
  useState,
  useEffect,
  useRef,
  ReactElement,
  useReducer,
} from "react";
import "./editor.css";
import _ from "lodash";

interface Caret {
  line: number;
  offset: number;
}

const initialLines = [
  "Hello WennyEditor",
  "Hello LinkNode",
  "Practice makes perfect",
  "Space: 1",
  "Space:  2",
  "Space:   3",
];

const parseLine = (line: string): JSX.Element[] => {
  const matches = line.match(/(\S+|\s+)/g);
  if (matches) {
    return matches.map((s, index) => (
      <span key={index}>{s.replace(/ /g, "\u00A0")}</span>
    ));
  } else {
    return [<span key={0}></span>];
  }
};

const useInterval = (callback: () => void, ms: number) => {
  const savedCallback = useRef<() => void>();

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }
    const handle = setInterval(tick, ms);
    return () => clearInterval(handle);
  }, [ms]);
};

const LineNumberContainer = (props: { lineNumbers: number[] }) => {
  return (
    <div className="editor-line-numbers">
      {props.lineNumbers.map((value, index) => {
        return (
          <div className="editor-line-number" key={index}>
            {value}
          </div>
        );
      })}
    </div>
  );
};

const LineView = (props: { line: string }) => {
  return <div className="editor-line">{parseLine(props.line)}</div>;
};

const ContentContainer = (props: {
  lines: string[];
  carets: Caret[];
  onTextInsert?: (line: number, offset: number, text: string) => void;
  onTextDelete?: (line: number, startOffset: number, endOffset: number) => void;
  onCaretsChange?: (carets: Caret[]) => void;
}) => {
  interface CaretMetric {
    focusElement: HTMLElement;
    metricOffsets: number[];
    metricIndex: number;
  }
  const [caretMetrics, setCaretMetrics] = useState<CaretMetric[]>([]);

  const contentRef = useRef<HTMLDivElement>(null);
  const inputTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const editorTextMeasurerRef = useRef<HTMLDivElement>(null);

  const measureElementText = (element: HTMLElement): number[] => {
    if (!element.textContent) {
      return [0];
    }
    const editorTextMeasurer = editorTextMeasurerRef.current!;
    editorTextMeasurer.childNodes.forEach((e) => e.remove());
    const clonedNode = element.cloneNode() as HTMLElement;
    editorTextMeasurer.append(clonedNode);

    const metricOffsets: number[] = [0];
    for (const c of element.textContent) {
      clonedNode.textContent += c;
      metricOffsets.push(clonedNode.getBoundingClientRect().width);
    }
    return metricOffsets;
  };

  const handleLinesMouseUp = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    updateCursorPosition(e);
  };

  const handleLinesMouseMove = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (e.buttons & 1) {
      updateCursorPosition(e);
    }
  };

  const handleLinesMouseDown = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    // console.debug("handleLinesMouseDown");
    updateCursorPosition(e);
  };

  const handleLinesMouseLeave = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (e.buttons & 1) {
      updateCursorPosition(e);
    }
  };

  const handleLinesBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    // updateCursorPosition(e.currentTarget);
  };

  const updateCursorPosition = (
    event: React.MouseEvent<HTMLSpanElement | HTMLDivElement>
  ) => {
    // updateCursorPositionWithSelection(element);
    updateCaretsPositionWithMeasurer(event);
  };

  const updateCaretsPositionWithMeasurer = (
    event: React.MouseEvent<HTMLSpanElement | HTMLDivElement>
  ) => {
    const target = event.target as HTMLElement;
    let span: HTMLSpanElement | null = null;
    let metricIndex = -1;

    if (target instanceof HTMLDivElement) {
      let container = target;
      if (target.classList.contains("editor-lines")) {
        container = target.lastElementChild as HTMLDivElement;
      }

      if (container.classList.contains("editor-line")) {
        const element = container.lastElementChild as HTMLElement;
        if (element && element instanceof HTMLSpanElement) {
          span = element;
          metricIndex = span.textContent?.length ?? 0;
        }
      }
    } else if (target instanceof HTMLSpanElement) {
      span = target;
    }

    if (span) {
      const metricOffsets = measureElementText(span);
      if (metricIndex === -1) {
        const domRect = target.getBoundingClientRect();
        const offsetX = Math.max(event.clientX - domRect.x, 0);
        metricIndex = 0;
        for (let i = 0; i < metricOffsets.length; ++i) {
          if (metricOffsets[i] >= offsetX) {
            break;
          }
          metricIndex = i;
        }
      }
      const lineElement = span.parentElement;
      const spanIndex = _.indexOf(lineElement?.children, span);
      const linesElement = lineElement?.parentElement;
      const lineIndex = _.indexOf(linesElement?.children, lineElement);
      const charOffset =
        _(lineElement?.children)
          .slice(0, spanIndex)
          .sumBy((e) => e.textContent?.length ?? 0) + metricIndex;
      props.onCaretsChange?.([
        {
          line: lineIndex,
          offset: charOffset,
        },
      ]);
      console.log([
        {
          line: lineIndex,
          offset: charOffset,
        },
      ]);
      setCaretMetrics([
        {
          focusElement: span,
          metricOffsets: metricOffsets,
          metricIndex: metricIndex,
        },
      ]);
    }
  };

  // update caretMetrics
  useEffect(() => {
    const linesView = contentRef.current;
    if (!linesView) {
      return;
    }
    const newCaretMetrics: CaretMetric[] = [];
    for (const caret of props.carets) {
      const lineView = linesView.children[caret.line];
      let restOffset = caret.offset;
      let spanElement: HTMLSpanElement | null = null;
      for (const element of lineView.children) {
        if (!(element instanceof HTMLSpanElement)) {
          continue;
        }
        const currentLength = element.textContent?.length ?? 0;
        if (restOffset >= currentLength) {
          restOffset -= currentLength;
        } else {
          spanElement = element;
          break;
        }
      }
      if (spanElement) {
        newCaretMetrics.push({
          focusElement: spanElement,
          metricOffsets: measureElementText(spanElement),
          metricIndex: restOffset,
        });
      }
    }
    setCaretMetrics(newCaretMetrics);
  }, [props.carets]);

  useEffect(() => {
    inputTextAreaRef.current?.focus();
  });

  const handleContentInput = (event: React.FormEvent<HTMLDivElement>) => {
    console.log(`handleContentInput:`);
    console.log(event);
  };

  const handleContentKeyUp = (event: React.KeyboardEvent<HTMLDivElement>) => {
    console.log(`handleContentKeyUp:`);
    console.log(event);
  };

  const handleContentClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    // console.log("handleContentClick:");
  };

  const [isCompositionMode, setCompositionMode] = useState(false);
  const handleCompositionStart = (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: React.CompositionEvent<HTMLTextAreaElement>
  ) => {
    // console.debug("handleCompositionStart");
    setCompositionMode(true);
  };

  const handleCompositionUpdate = (
    event: React.CompositionEvent<HTMLTextAreaElement>
  ) => {
    // console.debug("handleCompositionUpdate");
    // TODO: show characters
  };

  const handleCompositionEnd = (
    event: React.CompositionEvent<HTMLTextAreaElement>
  ) => {
    // console.debug(`handleCompositionEnd`);
    // console.debug(event.data);
    // console.debug(event.currentTarget.value);
    event.currentTarget.value = "";
    setCompositionMode(false);
  };

  // const calcTextPosition = (caret: CaretElementState) => {
  //   const focusElement = caret.focusElement;
  //   const lineElement = focusElement.parentElement!;
  //   const spanIndex = _.indexOf(lineElement.children, focusElement);
  //   const linesElement = lineElement.parentElement!;
  //   const lineIndex = _.indexOf(linesElement.children, lineElement);
  //   console.log(lineElement.children);
  //   const column =
  //     _.sum(
  //       _.map(
  //         _.slice(lineElement.children, 0, spanIndex),
  //         (e) => e?.textContent?.length ?? 0
  //       )
  //     ) + caret.offset;
  //   console.log([lineIndex, column, spanIndex, caret.offset]);
  //   return [lineIndex, column];
  // };

  const handleTextAreaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    if (isCompositionMode) {
      return;
    }
    const insertedText = event.currentTarget.value;
    event.currentTarget.value = "";
    console.debug(insertedText);

    const lastCaret = _.last(props.carets);
    console.log(lastCaret);
    if (lastCaret) {
      console.log(props.carets);
      props.onTextInsert?.(lastCaret.line, lastCaret.offset, insertedText);
      console.log(props.carets);
    }
  };

  const [cursorVisibility, setCursorVisibility] = useState<
    "visible" | "hidden"
  >("visible");
  useInterval(() => {
    setCursorVisibility(cursorVisibility === "visible" ? "hidden" : "visible");
  }, 500);

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
      <div
        className="editor-lines"
        ref={contentRef}
        // onChange={handleContentChange}
        // onKeyUp={handleContentKeyUp}
        // onInput={handleContentInput}
        onClick={handleContentClick}
        onMouseDown={handleLinesMouseDown}
        onMouseMove={handleLinesMouseMove}
        onMouseUp={handleLinesMouseUp}
        onMouseLeave={handleLinesMouseLeave}
        onBlur={handleLinesBlur}
      >
        {props.lines.map((value, index) => {
          return <LineView key={index} line={value} />;
        })}
        <div
          className="editor-text-measurer editor-debug-view"
          ref={editorTextMeasurerRef}
        />

        <div className="editor-debug-view">
          <div>
            {props.carets.map((c, i) => {
              return (
                <span key={i}>
                  line: {c.line}, offset: {c.offset}{" "}
                </span>
              );
            })}
          </div>
        </div>
      </div>
      <div className="editor-carets" style={{ visibility: cursorVisibility }}>
        {caretMetrics.map((c, index) => (
          <div
            className="editor-caret"
            key={index}
            style={{
              left: c.focusElement.offsetLeft + c.metricOffsets[c.metricIndex],
              top: c.focusElement.offsetTop,
            }}
          ></div>
        ))}
      </div>
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
        onFocus={() => console.log("focus")}
        style={{ ...calcCaretInputAreaPosition() }}
      />
    </div>
  );
};

export function EditorView(): ReactElement {
  type Action =
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

  type State = {
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

  const [state, dispatch] = useReducer(reducer, {
    lines: initialLines,
    lineNumbers: _.range(1, initialLines.length + 1),
    carets: [{ line: 0, offset: 0 }],
  });

  return (
    <div className="editor-container">
      <LineNumberContainer lineNumbers={state.lineNumbers} />
      <ContentContainer
        lines={state.lines}
        carets={state.carets}
        onTextInsert={(line, offset, text) =>
          dispatch({ type: "insert", line, offset, text })
        }
        onCaretsChange={(carets) =>
          dispatch({ type: "updateCarets", carets: carets })
        }
      />
    </div>
  );
}
