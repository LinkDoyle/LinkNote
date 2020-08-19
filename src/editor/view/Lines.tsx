import React, {
  ReactElement,
  useRef,
  RefObject,
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
} from "react";
import _ from "lodash";
import { Caret } from "../editorReducer";
import { CaretMetric } from "./Carets";

const measureElementText = (
  measurerRef: RefObject<HTMLDivElement | undefined>,
  span: HTMLSpanElement
): number[] => {
  const measurer = measurerRef.current;
  if (!measurer) {
    return [0];
  }
  if (!span.textContent) {
    return [0];
  }
  measurer.childNodes.forEach((e) => e.remove());
  const clonedNode = span.cloneNode() as HTMLSpanElement;
  measurer.append(clonedNode);

  const metricOffsets: number[] = [0];
  for (const c of span.textContent) {
    clonedNode.textContent += c;
    metricOffsets.push(clonedNode.getBoundingClientRect().width);
  }
  return metricOffsets;
};

export const useCaretMetrics = (
  linesViewRef: RefObject<HTMLDivElement>,
  measurerRef: RefObject<HTMLDivElement>,
  carets: Caret[]
): [CaretMetric[], Dispatch<SetStateAction<CaretMetric[]>>] => {
  const [caretMetrics, setCaretMetrics] = useState<CaretMetric[]>([]);

  // update caretMetrics
  useEffect(() => {
    const linesView = linesViewRef.current;
    const measurer = measurerRef.current;
    if (!linesView || !measurer) {
      return;
    }
    const newCaretMetrics: CaretMetric[] = [];
    for (const caret of carets) {
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
          metricOffsets: measureElementText(measurerRef, spanElement),
          metricIndex: restOffset,
        });
      }
    }
    setCaretMetrics(newCaretMetrics);
  }, [linesViewRef, measurerRef, carets]);
  return [caretMetrics, setCaretMetrics];
};

const Line = (props: { line: string }): ReactElement => {
  const { line } = props;
  const matches = line.match(/(\S+|\s+)/g);
  return (
    <div className="editor-line">
      {matches ? (
        matches.map((s, index) => (
          <span key={index}>{s.replace(/ /g, "\u00A0")}</span>
        ))
      ) : (
        <span key={0}></span>
      )}
    </div>
  );
};

function Lines(props: {
  lines: string[];
  linesRef: RefObject<HTMLDivElement>;
  measurerRef: RefObject<HTMLDivElement>;
  onCaretsChange?: (carets: Caret[]) => void;
}): ReactElement {
  const { lines, linesRef, measurerRef, onCaretsChange } = props;
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
      const metricOffsets = measureElementText(measurerRef, span);
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
      onCaretsChange?.([
        {
          line: lineIndex,
          offset: charOffset,
        },
      ]);
    }
  };

  return (
    <>
      <div className="editor-text-measurer" ref={measurerRef} />
      <div
        className="editor-lines"
        ref={linesRef}
        onMouseDown={(e) => updateCaretsPositionWithMeasurer(e)}
        onMouseMove={(e) =>
          e.buttons & 1 && updateCaretsPositionWithMeasurer(e)
        }
        onMouseUp={(e) => updateCaretsPositionWithMeasurer(e)}
        onMouseLeave={(e) =>
          e.buttons & 1 && updateCaretsPositionWithMeasurer(e)
        }
      >
        {lines.map((value, index) => (
          <Line key={index} line={value} />
        ))}
      </div>
    </>
  );
}

export default Lines;
