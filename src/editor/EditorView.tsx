import React, {
  createRef,
  useState,
  useEffect,
  useRef,
  ReactElement,
} from "react";
import "./editor.css";
import _, { rangeRight } from "lodash";
import content from "*.html";
import { JSXElement } from "@babel/types";

const initialLines = [
  "Hello WennyEditor",
  "Hello LinkNode",
  "Practice makes perfect",
];

const parseLine = (line: string) =>
  line.match(/(\w+|\s+)/g)?.map((s, index) => <span key={index}>{s}</span>);

const initialLineNumbers = _.range(1, initialLines.length + 1);

const LineView = (props: { line: string }) => {
  return <div className="editor-line">{parseLine(props.line)}</div>;
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

export function EditorView(): ReactElement {
  const [lineNumbers, setLineNumbers] = useState(initialLineNumbers);
  const [lines, setLines] = useState(initialLines);
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

  const [lastSelection, setLastSection] = useState<Selection | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const updateCursorPosition = (
    event: React.MouseEvent<HTMLSpanElement | HTMLDivElement>
  ) => {
    // updateCursorPositionWithSelection(element);
    updateCursorPositionWithMeasurer(event);
  };

  const updateCursorPositionWithSelection = (element: HTMLDivElement) => {
    const clientRect = element.getBoundingClientRect();
    const selection = window.getSelection();
    if (!selection) {
      return;
    }
    setLastSection(selection);
    const anchorNode = selection.anchorNode;
    const focusNode = selection.focusNode;
    if (!anchorNode || !focusNode) {
      return;
    }
    const rangeCount = selection.rangeCount;
    const lastRange = selection.getRangeAt(rangeCount - 1);
    const rects = lastRange.getClientRects();
    console.debug(selection);
    console.debug(lastRange);
    console.debug(rects);

    const position = anchorNode.compareDocumentPosition(focusNode);
    const cursorOffsetX =
      (anchorNode === focusNode &&
        selection.anchorOffset < selection.focusOffset) ||
      position & Node.DOCUMENT_POSITION_FOLLOWING
        ? rects[rects.length - 1].x + rects[rects.length - 1].width
        : rects[0].x;

    // console.debug([clientRect.x, cursorOffsetX]);

    const focusElement = focusNode.parentElement!;
    const newTop = focusElement.offsetTop;
    const newLeft = cursorOffsetX - clientRect.x;
    setCursorPosition({ x: newLeft, y: newTop });
    const inputTextArea = inputTextAreaRef.current!;
    inputTextArea.focus();
    selection.addRange(lastRange);
  };

  const updateCursorPositionWithMeasurer = (
    event: React.MouseEvent<HTMLSpanElement | HTMLDivElement>
  ) => {
    const target = event.target as HTMLElement;
    // console.debug(["updateCursorPositionWithMeasurer", target]);
    if (target instanceof HTMLDivElement) {
      let container = target;
      if (target.classList.contains("editor-lines")) {
        container = target.lastElementChild as HTMLDivElement;
      }
      if (container.classList.contains("editor-line")) {
        const element = container.lastElementChild as HTMLElement;
        if (element) {
          setCursorPosition({
            x: element.offsetLeft + element.offsetWidth,
            y: element.offsetTop,
          });
        }
      }
    } else {
      const domRect = target.getBoundingClientRect();
      const offsetX = Math.max(event.clientX - domRect.x, 0);
      let deltaX = 0;
      const metricOffsets = measureElementText(target);
      for (const m of metricOffsets) {
        if (m > offsetX) {
          break;
        }
        deltaX = m;
      }
      setCursorPosition({
        x: target.offsetLeft + deltaX,
        y: target.offsetTop,
      });
    }
    const inputTextArea = inputTextAreaRef.current!;
    inputTextArea.focus();
  };

  const handleContentChange = (event: React.FormEvent<HTMLDivElement>) => {
    console.log("handleContentChange");
    console.log(event);

    // let newLines: string[] = [];
    // for (let child of target.children) {
    //   const text = child.textContent ?? "";
    //   newLines.push(text);
    // }
    // setLines(newLines);
    const lineCount = Math.max(1, event.currentTarget.children.length);
    setLineNumbers(_.range(1, lineCount + 1));
  };

  const handleContentInput = (event: React.FormEvent<HTMLDivElement>) => {
    console.log(`handleContentInput:`);
    console.log(event);
  };

  const handleContentKeyUp = (event: React.FormEvent<HTMLDivElement>) => {
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
    // console.debug(event.currentTarget.value);
    const insertedText = event.currentTarget.value;
    event.currentTarget.value = "";
    if (!lastSelection) {
      return;
    }
    const focusNode = lastSelection.focusNode;
    if (!focusNode) {
      return;
    }
    const focusOffset = lastSelection.focusOffset;
    const focusElement = focusNode.parentElement;
    console.debug(focusElement);
    if (focusElement) {
      const t = focusNode.textContent;
      focusElement.textContent =
        t?.slice(0, focusOffset) + insertedText + t?.slice(focusOffset);
    }
  };

  const [cursorVisibility, setCursorVisibility] = useState<
    "visible" | "hidden"
  >("visible");
  useInterval(() => {
    setCursorVisibility(cursorVisibility === "visible" ? "hidden" : "visible");
  }, 500);

  return (
    <div className="editor-container">
      <div className="editor-line-numbers">
        {lineNumbers.map((value, index) => {
          return (
            <div className="editor-line-number" key={index}>
              {value}
            </div>
          );
        })}
      </div>
      <div className="editor-content">
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
          style={{ left: cursorPosition.x, top: cursorPosition.y }}
        />
        <div
          className="editor-lines"
          ref={contentRef}
          onChange={handleContentChange}
          onKeyUp={handleContentKeyUp}
          onInput={handleContentInput}
          onClick={handleContentClick}
          onMouseDown={handleLinesMouseDown}
          onMouseMove={handleLinesMouseMove}
          onMouseUp={handleLinesMouseUp}
          onMouseLeave={handleLinesMouseLeave}
          onBlur={handleLinesBlur}
        >
          {lines.map((value, index) => {
            return <LineView key={lineNumbers[index]} line={value} />;
          })}
          <div className="editor-text-measurer" ref={editorTextMeasurerRef} />
        </div>
        <div
          className="editor-cursor"
          style={{
            visibility: cursorVisibility,
            left: cursorPosition.x,
            top: cursorPosition.y,
          }}
        ></div>
      </div>
    </div>
  );
}
