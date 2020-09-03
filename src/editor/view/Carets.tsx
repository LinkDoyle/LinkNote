import { ReactElement, useState } from "react";

import React from "react";
import { useInterval } from "../hooks";

export interface CaretMetric {
  focusElement: HTMLElement;
  metricOffsets: number[];
  metricIndex: number;
}

function Carets(props: {
  caretMetrics: CaretMetric[];
  blink: boolean;
}): ReactElement {
  const { caretMetrics, blink } = props;
  const [cursorVisibility, setCursorVisibility] = useState<
    "visible" | "hidden"
  >("visible");

  useInterval(() => {
    if (blink) {
      setCursorVisibility(
        cursorVisibility === "visible" ? "hidden" : "visible"
      );
    } else {
      setCursorVisibility("visible");
    }
  }, 500);

  return (
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
  );
}

export default Carets;
