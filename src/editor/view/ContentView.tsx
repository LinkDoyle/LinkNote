import React, {
  useState,
  useRef,
  useEffect,
  ReactElement,
  useDebugValue,
} from "react";
import _ from "lodash";
import { Caret } from "../editorReducer";
import { useInterval } from "../hooks";
import DebugView from "./DebugView";
import Carets, { CaretMetric } from "./Carets";

const parseLine = (line: string): ReactElement[] => {
  const matches = line.match(/(\S+|\s+)/g);
  if (matches) {
    return matches.map((s, index) => (
      <span key={index}>{s.replace(/ /g, "\u00A0")}</span>
    ));
  } else {
    return [<span key={0}></span>];
  }
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
}): ReactElement => {
  const [caretMetrics, setCaretMetrics] = useState<CaretMetric[]>([]);

  const contentRef = useRef<HTMLDivElement>(null);
  const inputTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const editorTextMeasurerRef = useRef<HTMLDivElement>(null);

  const [cursorVisibility, setCursorVisibility] = useState<
    "visible" | "hidden"
  >("visible");

  useInterval(() => {
    setCursorVisibility(cursorVisibility === "visible" ? "hidden" : "visible");
  }, 500);

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
        if (restOffset > currentLength) {
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

  useDebugValue(props.carets);
  useDebugValue(caretMetrics);

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

    const lastCaret = _.last(props.carets);
    console.log(lastCaret);
    if (lastCaret) {
      console.log(props.carets);
      props.onTextInsert?.(lastCaret.line, lastCaret.offset, insertedText);
      console.log(props.carets);
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
      <div className="editor-text-measurer" ref={editorTextMeasurerRef} />
      <div
        className="editor-lines"
        ref={contentRef}
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
      </div>
      <DebugView>
        {props.carets.map((c, i) => {
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
        onFocus={() => console.log("focus")}
        style={{ ...calcCaretInputAreaPosition() }}
      />
    </div>
  );
};

export default ContentContainer;
