import React, { createRef, useState, useEffect } from "react";
import "./editor.css";
import _, { rangeRight } from "lodash";
import content from "*.html";

const initialLines = [
  "Hello WennyEditor",
  "Hello LinkNode",
  "Practice makes perfect",
];

const initialLineNumbers = _.range(1, initialLines.length + 1);

export function EditorView() {
  const [lineNumbers, setLineNumbers] = useState(initialLineNumbers);
  const [lines, setLines] = useState(initialLines);
  const contentRef = createRef<HTMLDivElement>();
  const inputTextAreaRef = createRef<HTMLTextAreaElement>();
  const textCursorRef = createRef<HTMLDivElement>();
  const editorTextMeasurerRef = createRef<HTMLDivElement>();

  const handleLineChange = (event: React.FormEvent<HTMLDivElement>) => {
    console.log("handleLineChange");
    console.log(event.target);
  };

  const handleLineInput = (event: React.FormEvent<HTMLDivElement>) => {
    console.log(`handleLineInput:`);
    console.log(event.target);
  };

  const handleLineKeyUp = (event: React.FormEvent<HTMLDivElement>) => {
    console.log(`handleLineKeyUp:`);
    console.log(event.target);
  };

  const handleLineClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    console.log(`handleLineClick:`);

    // const inputCursor = inputCursorRef.current!;
    // inputCursor.focus();
  };

  const handleLinesSelect = (
    element: React.SyntheticEvent<HTMLDivElement, Event>
  ) => {
    console.log("handleLinesSelect");
  };

  const handleLinesMouseUp = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    onCursorPositionChange(e.currentTarget);
  };

  const handleLinesMouseMove = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (e.buttons & 1) {
      onCursorPositionChange(e.currentTarget);
    }
  };

  const handleLinesMouseDown = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    console.debug("handleLinesMouseDown");
    onCursorPositionChange(e.currentTarget);
  };

  const handleLinesMouseLeave = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    onCursorPositionChange(e.currentTarget);
  };

  const handleLinesBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    onCursorPositionChange(e.currentTarget);
  };

  const [lastSelection, setLastSection] = useState<Selection | null>(null);
  const onCursorPositionChange = (element: HTMLDivElement) => {
    const cursor = textCursorRef.current!;
    const inputTextArea = inputTextAreaRef.current!;

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
    cursor.style.top = `${newTop}px`;
    cursor.style.left = `${newLeft}px`;
    inputTextArea.style.top = `${newTop}px`;
    inputTextArea.style.left = `${newLeft}px`;
    inputTextArea.focus();
    selection.addRange(lastRange);
  };

  const Line = (props: { line: string }) => {
    return (
      <div
        className="editor-line"
        onChange={handleLineChange}
        onKeyUp={handleLineKeyUp}
        onInput={handleLineInput}
        onClick={handleLineClick}
      >
        <span>{props.line}</span>
      </div>
    );
  };

  const handleContentChange = (event: React.FormEvent<HTMLDivElement>) => {
    console.log("handleContentChange");
    console.log(event);

    let currentTarget = event.currentTarget;

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
    console.log("handleContentClick:");
  };

  const [isCompositionMode, setCompositionMode] = useState(false);
  const handleCompositionStart = (_: React.CompositionEvent<HTMLTextAreaElement>) => {
    // console.debug("handleCompositionStart");
    setCompositionMode(true);
  }
  const handleCompositionUpdate = (event: React.CompositionEvent<HTMLTextAreaElement>) => {
    // console.debug("handleCompositionUpdate");
    // TODO: show characters
  }
  const handleCompositionEnd = (event: React.CompositionEvent<HTMLTextAreaElement>) => {
    // console.debug(`handleCompositionEnd`);
    // console.debug(event.data);
    // console.debug(event.currentTarget.value);
    event.currentTarget.value = "";
    setCompositionMode(false);
  }
  const handleTextAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
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

  const measureElementText = (element: HTMLElement): number[] => {
    if (!element.textContent) {
      return [0.];
    }
    console.debug(element.childNodes);
    const editorTextMeasurer = editorTextMeasurerRef.current!;
    editorTextMeasurer.childNodes.forEach((e) => e.remove());
    const clonedNode = element.cloneNode() as HTMLElement;
    editorTextMeasurer.append(clonedNode);

    const metricOffsets: number[] = [0.];
    for (let c of element.textContent) {
      clonedNode.textContent += c;
      metricOffsets.push(clonedNode.getBoundingClientRect().width);
    }

    console.debug(metricOffsets);
    const metrics: number[] = [metricOffsets.length > 0 ? metricOffsets[0] : 0.];
    for (let i = 1; i < metricOffsets.length; ++i) {
      const metric = metricOffsets[i] - metricOffsets[i - 1];
      metrics.push(metric);
    }
    console.debug(metrics);
    return metricOffsets;
  }

  const handleTestAreaClick = (event: React.MouseEvent<HTMLSpanElement | HTMLDivElement>) => {
    console.log(event.target);
    console.log(event.currentTarget);
    const target = event.target as HTMLElement;
    if (!target.textContent) {
      return;
    }
    const metrics = measureElementText(target);
    const domRect = target.getBoundingClientRect();
    const offsetX = Math.max(event.clientX - domRect.x, 0);
    let deltaX = 0.
    for(const m of metrics) {
      if(m > offsetX) {
        break;
      }
      deltaX = m;
    }

    const cursor = textCursorRef.current!;
    const inputTextArea = inputTextAreaRef.current!;
    const newTop = target.offsetTop;
    const newLeft = target.offsetLeft + deltaX;
    cursor.style.top = `${newTop}px`;
    cursor.style.left = `${newLeft}px`;
    inputTextArea.style.top = `${newTop}px`;
    inputTextArea.style.left = `${newLeft}px`;
  }

  useEffect(() => {
    const handler = setInterval(() => {
      const cursor = textCursorRef.current!;
      cursor.style.visibility =
        cursor.style.visibility === "inherit" ? "hidden" : "inherit";
    }, 500);
    return () => {
      clearInterval(handler);
    };
  });

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
          onSelect={handleLinesSelect}
        >
          {lines.map((value, index) => {
            return <Line key={lineNumbers[index]} line={value} />;
          })}
        </div>
        <div className="editor-cursor" ref={textCursorRef}></div>
        <div className="editor-text-measurer" ref={editorTextMeasurerRef} >
          <span>x</span>
        </div>
        <div onClick={handleTestAreaClick}>
          <span>There is a </span>
          <span style={{ fontWeight: "bold" }}>span</span>
          <span>{" here!"}</span>
        </div>
      </div>
    </div>
  );
}
