import React, { ReactElement, useEffect, useRef, useState } from "react";
import "./DrawBoard.css";

import { useSelector, useDispatch } from "react-redux";
import ToolBar from "./Toolbar";
import { Mode, record, redo, undo } from "../drawingSlice";
import { RootState } from "../../reducers";
import { cmdClear, cmdPen } from "../commands";
import { Drawer } from "../drawer";

function DrawBoard(): ReactElement {
  const { mode, lineWidth, color, history } = useSelector(
    (state: RootState) => state.drawing
  );

  const dispatch = useDispatch();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawer] = useState<Drawer>(
    new Drawer(canvasRef.current?.getContext("2d"))
  );

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPointerId, setCurrentPointerId] = useState<number | null>(null);
  const [currentTracks, setCurrentTracks] = useState<
    { x: number; y: number }[]
  >([]);

  const processPointerBegin = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDrawing) {
      return;
    }
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;

    setIsDrawing(true);
    setCurrentPointerId(ev.pointerId);
    const [offsetX, offsetY] = [ev.nativeEvent.offsetX, ev.nativeEvent.offsetY];
    setCurrentTracks([...currentTracks, { x: offsetX, y: offsetY }]);
  };

  const processPointerMoving = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || currentPointerId !== ev.pointerId) {
      return;
    }
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) {
      return;
    }

    const [offsetX, offsetY] = [ev.nativeEvent.offsetX, ev.nativeEvent.offsetY];
    const tracks = [...currentTracks, { x: offsetX, y: offsetY }];
    setCurrentTracks(tracks);
    switch (mode) {
      case Mode.PenDrawing: {
        ctx.beginPath();
        const { x: x0, y: y0 } = tracks[tracks.length - 2];
        ctx.moveTo(x0, y0);
        const { x: x1, y: y1 } = tracks[tracks.length - 1];
        ctx.lineTo(x1, y1);
        ctx.closePath();
        ctx.stroke();
        break;
      }
      default: {
        // TODO
        console.warn(`Not implemented ${Mode[mode]} yet.`);
      }
    }
  };

  const processPointerEnd = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || currentPointerId !== ev.pointerId) {
      return;
    }
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) {
      return;
    }

    switch (mode) {
      case Mode.PenDrawing: {
        dispatch(record(cmdPen({ lineWidth, color, tracks: currentTracks })));
        break;
      }
      default: {
        // TODO
        console.warn(`Not implemented mode ${Mode[mode]} yet.`);
      }
    }

    setIsDrawing(false);
    setCurrentPointerId(null);
    setCurrentTracks([]);
  };

  const redraw = (): void => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawer.context = ctx;
    const { commands, currentIndex } = history;
    for (let i = 0; i <= currentIndex; ++i) {
      const command = commands[i];
      drawer.execute(command);
    }
  };

  const handleUndoClick = (): void => {
    dispatch(undo());
    redraw();
  };

  const handleRedoClick = (): void => {
    dispatch(redo());
    redraw();
  };

  const handleClearClick = (): void => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dispatch(record(cmdClear()));
  };

  useEffect(() => {
    redraw();
  }, [history.currentIndex]);

  return (
    <div className="drawboard-container">
      <ToolBar
        onUndoClick={() => handleUndoClick()}
        onRedoClick={() => handleRedoClick()}
        onClearClick={() => handleClearClick()}
      />
      <div className="drawboard-wrapper">
        <canvas
          ref={canvasRef}
          className="drawboard-canvas"
          width="800"
          height="600"
          onPointerDown={processPointerBegin}
          onPointerMove={processPointerMoving}
          onPointerUp={processPointerEnd}
        ></canvas>
      </div>
    </div>
  );
}

export default DrawBoard;
