import React, {
  createRef,
  useState,
  useEffect,
  useRef,
  ReactElement,
  useReducer,
} from "react";
import "./editor.css";
import _ from "lodash";

const initialLines = [
  "Hello WennyEditor",
  "Hello LinkNode",
  "Practice makes perfect",
  "Space: 1",
  "Space:  2",
  "Space:   3",
];

const parseLine = (line: string): JSX.Element[] => {
  const matches = line.match(/(\w+|\s+)/g);
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
  onTextInsert?: (line: number, offset: number, text: string) => void;
  onTextDelete?: (line: number, startOffset: number, endOffset: number) => void;
}) => {
  interface Caret {
    focusElement: HTMLElement;
    offset: number;
    metricOffsets: number[];
  }
  const [carets, setCarets] = useState<Caret[]>([]);

  const contentRef = createRef<HTMLDivElement>();
  const inputTextAreaRef = createRef<HTMLTextAreaElement>();
  const editorTextMeasurerRef = createRef<HTMLDivElement>();

  const measureElementText = (element: HTMLElement): number[] => {
    if (!element.textContent) {
      return [0];
    }
    // console.debug(element.childNodes);
    const editorTextMeasurer = editorTextMeasurerRef.current!;
    editorTextMeasurer.childNodes.forEach((e) => e.remove());
    const clonedNode = element.cloneNode() as HTMLElement;
    editorTextMeasurer.append(clonedNode);

    const metricOffsets: number[] = [0];
    for (const c of element.textContent) {
      clonedNode.textContent += c;
      metricOffsets.push(clonedNode.getBoundingClientRect().width);
    }

    // console.debug(metricOffsets);
    // const metrics: number[] = [metricOffsets.length > 0 ? metricOffsets[0] : 0];
    // for (let i = 1; i < metricOffsets.length; ++i) {
    //   const metric = metricOffsets[i] - metricOffsets[i - 1];
    //   metrics.push(metric);
    // }
    // console.debug(metrics);
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
    let currentOffset = -1;

    if (target instanceof HTMLDivElement) {
      let container = target;
      if (target.classList.contains("editor-lines")) {
        container = target.lastElementChild as HTMLDivElement;
      }

      if (container.classList.contains("editor-line")) {
        const element = container.lastElementChild as HTMLElement;
        if (element && element instanceof HTMLSpanElement) {
          span = element;
          currentOffset = span.textContent!.length;
        }
      }
    } else if (target instanceof HTMLSpanElement) {
      span = target;
    }

    if (span) {
      const metricOffsets = measureElementText(span);
      if (currentOffset === -1) {
        const domRect = target.getBoundingClientRect();
        const offsetX = Math.max(event.clientX - domRect.x, 0);
        currentOffset = 0;
        for (let i = 0; i < metricOffsets.length; ++i) {
          if (metricOffsets[i] >= offsetX) {
            break;
          }
          currentOffset = i;
        }
      }
      setCarets([
        {
          focusElement: span,
          offset: currentOffset,
          metricOffsets: metricOffsets,
        },
      ]);
    }

    const inputTextArea = inputTextAreaRef.current!;
    inputTextArea.blur();
    inputTextArea.focus();
  };

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

  const handleTextAreaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    if (isCompositionMode) {
      return;
    }
    const insertedText = event.currentTarget.value;
    event.currentTarget.value = "";
    console.debug(insertedText);

    for (let i = 0; i < carets.length; ++i) {
      const caret = carets[i];
      const focusElement = caret.focusElement;
      if (focusElement) {
        const t = focusElement.textContent;
        focusElement.textContent =
          t?.slice(0, caret.offset) + insertedText + t?.slice(caret.offset);
        caret.metricOffsets = measureElementText(focusElement);
        caret.offset += insertedText.length;
      }
    }
    const lastCaret = carets[carets.length - 1];
    const focusElement = lastCaret.focusElement;
    const lineElement = focusElement.parentElement!;
    const spanIndex = Array.prototype.slice
      .call(lineElement.children)
      .indexOf(focusElement);
    const linesElement = lineElement.parentElement!;
    const lineIndex = Array.prototype.slice
      .call(linesElement.children)
      .indexOf(lineElement);
    const column = _.sum(
      _.slice(linesElement.children, 0, spanIndex).map((e) =>
        e && e.textContent ? e.textContent.length : 0
      )
    );
    console.log([lineIndex, column, spanIndex, lastCaret.offset]);

    setCarets(carets);
    props.onTextInsert?.(lineIndex, column, insertedText);
  };

  const [cursorVisibility, setCursorVisibility] = useState<
    "visible" | "hidden"
  >("visible");
  useInterval(() => {
    setCursorVisibility(cursorVisibility === "visible" ? "hidden" : "visible");
  }, 500);

  const calcCaretInputAreaPosition = () => {
    if (carets.length === 0) {
      return {
        left: 0,
        top: 0,
      };
    }
    const lastCaret = carets[carets.length - 1];
    return {
      left:
        lastCaret.focusElement.offsetLeft +
        lastCaret.metricOffsets[lastCaret.offset],
      top: lastCaret.focusElement.offsetTop,
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
            {carets.map((c, i) => {
              return (
                <span key={i}>
                  {c.focusElement?.textContent} {c.offset}{" "}
                </span>
              );
            })}
          </div>
        </div>
      </div>
      <div className="editor-carets" style={{ visibility: cursorVisibility }}>
        {carets.map((c) => (
          <div
            className="editor-caret"
            style={{
              left: c.focusElement.offsetLeft + c.metricOffsets[c.offset],
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
      };

  type State = {
    lines: string[];
    lineNumbers: number[];
  };

  const reducer = (state: State, action: Action) => {
    switch (action.type) {
      case "insert": {
        break;
      }
      case "delete": {
        break;
      }
    }
    return state;
  };

  const [state, dispatch] = useReducer(reducer, {
    lines: initialLines,
    lineNumbers: _.range(1, initialLines.length + 1),
  });

  return (
    <div className="editor-container">
      <LineNumberContainer lineNumbers={state.lineNumbers} />
      <ContentContainer
        lines={state.lines}
        onTextInsert={(line, offset, text) =>
          dispatch({ type: "insert", line, offset, text })
        }
      />
    </div>
  );
}
